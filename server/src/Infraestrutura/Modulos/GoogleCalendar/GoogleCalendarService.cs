using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text;
using System.Text.Json;
using Microsoft.AspNetCore.DataProtection;
using Microsoft.AspNetCore.WebUtilities;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using NoteKeeper.Dominio.Modulos.Notas;
using NoteKeeper.Infraestrutura.Compartilhado.Orm;

namespace NoteKeeper.Infraestrutura.Modulos.GoogleCalendar;

public sealed record GoogleCalendarStatus(bool IsConfigured, bool IsConnected);

public sealed record GoogleCalendarAuthorization(string Url);

public sealed record GoogleCalendarSyncResult(string EventId, string? EventUrl);

public sealed record GoogleCalendarBatchSyncResult(int Total, int Synchronized, int Failed);

public sealed class GoogleCalendarService(
    NoteKeeperDbContext db,
    IHttpClientFactory httpClientFactory,
    IDataProtectionProvider dataProtectionProvider,
    IOptions<GoogleCalendarOptions> options)
{
    private const string CalendarScope = "https://www.googleapis.com/auth/calendar.app.created";
    private readonly GoogleCalendarOptions options = options.Value;
    private readonly IDataProtector tokenProtector = dataProtectionProvider.CreateProtector(
        "NoteKeeper.GoogleCalendar.RefreshToken.v1");
    private readonly IDataProtector stateProtector = dataProtectionProvider.CreateProtector(
        "NoteKeeper.GoogleCalendar.AuthorizationState.v1");

    public async Task<GoogleCalendarStatus> ObterStatusAsync(Guid usuarioId, CancellationToken ct)
    {
        var isConnected = await db.GoogleCalendarConnections
            .AsNoTracking()
            .AnyAsync(connection => connection.UsuarioId == usuarioId, ct);

        return new GoogleCalendarStatus(options.IsConfigured, isConnected);
    }

    public GoogleCalendarAuthorization CriarUrlAutorizacao(Guid usuarioId)
    {
        EnsureConfigured();

        var state = new AuthorizationState(usuarioId, DateTimeOffset.UtcNow.AddMinutes(10));
        var protectedState = stateProtector.Protect(JsonSerializer.Serialize(state));
        var stateValue = WebEncoders.Base64UrlEncode(Encoding.UTF8.GetBytes(protectedState));

        var query = new Dictionary<string, string?>
        {
            ["client_id"] = options.ClientId,
            ["redirect_uri"] = options.RedirectUri,
            ["response_type"] = "code",
            ["scope"] = CalendarScope,
            ["access_type"] = "offline",
            ["prompt"] = "consent",
            ["include_granted_scopes"] = "true",
            ["state"] = stateValue
        };

        return new GoogleCalendarAuthorization(QueryHelpers.AddQueryString(
            "https://accounts.google.com/o/oauth2/v2/auth", query));
    }

    public async Task<string> ConcluirAutorizacaoAsync(string code, string state, CancellationToken ct)
    {
        EnsureConfigured();
        var authorizationState = ReadAuthorizationState(state);
        var token = await TrocarCodigoPorTokenAsync(code, ct);

        if (string.IsNullOrWhiteSpace(token.RefreshToken))
        {
            throw new GoogleCalendarException("Google did not return a refresh token. Try connecting again.");
        }

        if (string.IsNullOrWhiteSpace(token.AccessToken))
        {
            throw new GoogleCalendarException("Google did not return an access token.");
        }

        var connection = await db.GoogleCalendarConnections
            .SingleOrDefaultAsync(item => item.UsuarioId == authorizationState.UsuarioId, ct);

        if (connection is null)
        {
            var calendar = await CriarCalendarioAsync(token.AccessToken, ct);
            if (string.IsNullOrWhiteSpace(calendar.Id))
            {
                throw new GoogleCalendarException("Google Calendar did not return a calendar identifier.");
            }

            connection = new GoogleCalendarConnection(
                authorizationState.UsuarioId,
                calendar.Id,
                tokenProtector.Protect(token.RefreshToken));
            db.GoogleCalendarConnections.Add(connection);
        }
        else
        {
            connection.Atualizar(connection.CalendarioId, tokenProtector.Protect(token.RefreshToken));
        }

        await db.SaveChangesAsync(ct);
        return BuildClientRedirect("connected");
    }

    public async Task<GoogleCalendarSyncResult> SincronizarNotaAsync(
        Guid usuarioId,
        Guid notaId,
        CancellationToken ct)
    {
        EnsureConfigured();

        var connection = await db.GoogleCalendarConnections
            .SingleOrDefaultAsync(item => item.UsuarioId == usuarioId, ct)
            ?? throw new GoogleCalendarException("Connect your Google Calendar before syncing notes.");

        var note = await db.Notas
            .SingleOrDefaultAsync(item => item.Id == notaId && item.UsuarioId == usuarioId, ct)
            ?? throw new GoogleCalendarNotFoundException("Note not found.");

        if (note.DataVencimento is null)
        {
            throw new GoogleCalendarException("Add a due date before syncing this note.");
        }

        var accessToken = await ObterAccessTokenAsync(connection, ct);
        return await SincronizarNotaAsync(note, connection, accessToken, ct);
    }

    public async Task<GoogleCalendarBatchSyncResult> SincronizarTodasNotasAsync(
        Guid usuarioId,
        CancellationToken ct)
    {
        EnsureConfigured();

        var connection = await db.GoogleCalendarConnections
            .SingleOrDefaultAsync(item => item.UsuarioId == usuarioId, ct)
            ?? throw new GoogleCalendarException("Connect your Google Calendar before syncing notes.");

        var notes = await db.Notas
            .Where(note => note.UsuarioId == usuarioId && note.DataVencimento != null)
            .OrderBy(note => note.DataVencimento)
            .ToListAsync(ct);

        var accessToken = await ObterAccessTokenAsync(connection, ct);
        var synchronized = 0;
        var failed = 0;

        foreach (var note in notes)
        {
            try
            {
                await SincronizarNotaAsync(note, connection, accessToken, ct);
                synchronized++;
            }
            catch (GoogleCalendarException)
            {
                failed++;
            }
        }

        return new GoogleCalendarBatchSyncResult(notes.Count, synchronized, failed);
    }

    private async Task<GoogleCalendarSyncResult> SincronizarNotaAsync(
        Nota note,
        GoogleCalendarConnection connection,
        string accessToken,
        CancellationToken ct)
    {
        var eventPayload = CriarEvento(note);
        var http = httpClientFactory.CreateClient("GoogleCalendar");
        http.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", accessToken);

        HttpResponseMessage response;
        if (string.IsNullOrWhiteSpace(note.GoogleCalendarEventId))
        {
            response = await http.PostAsJsonAsync(
                $"https://www.googleapis.com/calendar/v3/calendars/{Uri.EscapeDataString(connection.CalendarioId)}/events",
                eventPayload,
                ct);
        }
        else
        {
            response = await http.PutAsJsonAsync(
                $"https://www.googleapis.com/calendar/v3/calendars/{Uri.EscapeDataString(connection.CalendarioId)}/events/{Uri.EscapeDataString(note.GoogleCalendarEventId)}",
                eventPayload,
                ct);
        }

        if (!response.IsSuccessStatusCode)
        {
            throw new GoogleCalendarException("Google Calendar could not save this event. Try again.");
        }

        var savedEvent = await response.Content.ReadFromJsonAsync<GoogleCalendarEventResponse>(ct)
            ?? throw new GoogleCalendarException("Google Calendar returned an invalid event.");

        if (string.IsNullOrWhiteSpace(savedEvent.Id))
        {
            throw new GoogleCalendarException("Google Calendar did not return an event identifier.");
        }

        note.DefinirEventoGoogleCalendar(savedEvent.Id);
        await db.SaveChangesAsync(ct);

        return new GoogleCalendarSyncResult(savedEvent.Id, savedEvent.HtmlLink);
    }

    public async Task DesconectarAsync(Guid usuarioId, CancellationToken ct)
    {
        var connection = await db.GoogleCalendarConnections
            .SingleOrDefaultAsync(item => item.UsuarioId == usuarioId, ct);

        if (connection is null)
        {
            return;
        }

        var notes = await db.Notas
            .Where(note => note.UsuarioId == usuarioId && note.GoogleCalendarEventId != null)
            .ToListAsync(ct);

        foreach (var note in notes)
        {
            note.RemoverEventoGoogleCalendar();
        }

        db.GoogleCalendarConnections.Remove(connection);
        await db.SaveChangesAsync(ct);
    }

    public async Task RemoverEventoDaNotaAsync(Guid usuarioId, Guid notaId, CancellationToken ct)
    {
        var connection = await db.GoogleCalendarConnections
            .SingleOrDefaultAsync(item => item.UsuarioId == usuarioId, ct);

        if (connection is null)
        {
            return;
        }

        var note = await db.Notas
            .SingleOrDefaultAsync(item => item.Id == notaId && item.UsuarioId == usuarioId, ct);

        if (note is null || string.IsNullOrWhiteSpace(note.GoogleCalendarEventId))
        {
            return;
        }

        var accessToken = await ObterAccessTokenAsync(connection, ct);
        var http = httpClientFactory.CreateClient("GoogleCalendar");
        http.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", accessToken);

        var response = await http.DeleteAsync(
            $"https://www.googleapis.com/calendar/v3/calendars/{Uri.EscapeDataString(connection.CalendarioId)}/events/{Uri.EscapeDataString(note.GoogleCalendarEventId)}",
            ct);

        if (!response.IsSuccessStatusCode && response.StatusCode != System.Net.HttpStatusCode.NotFound)
        {
            throw new GoogleCalendarException("Google Calendar could not remove this event. Try again.");
        }

        note.RemoverEventoGoogleCalendar();
        await db.SaveChangesAsync(ct);
    }

    private AuthorizationState ReadAuthorizationState(string state)
    {
        try
        {
            var protectedState = Encoding.UTF8.GetString(WebEncoders.Base64UrlDecode(state));
            var payload = stateProtector.Unprotect(protectedState);
            var authorizationState = JsonSerializer.Deserialize<AuthorizationState>(payload)
                ?? throw new InvalidOperationException();

            if (authorizationState.ExpiresAt <= DateTimeOffset.UtcNow)
            {
                throw new GoogleCalendarException("The Google authorization request expired. Start again.");
            }

            return authorizationState;
        }
        catch (GoogleCalendarException)
        {
            throw;
        }
        catch
        {
            throw new GoogleCalendarException("The Google authorization request is invalid. Start again.");
        }
    }

    private async Task<GoogleTokenResponse> TrocarCodigoPorTokenAsync(string code, CancellationToken ct)
    {
        var http = httpClientFactory.CreateClient("GoogleCalendar");
        using var content = new FormUrlEncodedContent(new Dictionary<string, string>
        {
            ["code"] = code,
            ["client_id"] = options.ClientId,
            ["client_secret"] = options.ClientSecret,
            ["redirect_uri"] = options.RedirectUri,
            ["grant_type"] = "authorization_code"
        });

        var response = await http.PostAsync("https://oauth2.googleapis.com/token", content, ct);
        if (!response.IsSuccessStatusCode)
        {
            throw new GoogleCalendarException("Google could not complete the connection. Try again.");
        }

        return await response.Content.ReadFromJsonAsync<GoogleTokenResponse>(ct)
            ?? throw new GoogleCalendarException("Google returned an invalid authorization response.");
    }

    private async Task<string> ObterAccessTokenAsync(GoogleCalendarConnection connection, CancellationToken ct)
    {
        var refreshToken = tokenProtector.Unprotect(connection.RefreshTokenProtegido);
        var http = httpClientFactory.CreateClient("GoogleCalendar");
        using var content = new FormUrlEncodedContent(new Dictionary<string, string>
        {
            ["client_id"] = options.ClientId,
            ["client_secret"] = options.ClientSecret,
            ["refresh_token"] = refreshToken,
            ["grant_type"] = "refresh_token"
        });

        var response = await http.PostAsync("https://oauth2.googleapis.com/token", content, ct);
        if (!response.IsSuccessStatusCode)
        {
            throw new GoogleCalendarException("Your Google Calendar connection expired. Connect it again.");
        }

        var token = await response.Content.ReadFromJsonAsync<GoogleTokenResponse>(ct);
        return token?.AccessToken ?? throw new GoogleCalendarException("Google did not return an access token.");
    }

    private async Task<GoogleCalendarResponse> CriarCalendarioAsync(string accessToken, CancellationToken ct)
    {
        var http = httpClientFactory.CreateClient("GoogleCalendar");
        http.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", accessToken);

        var response = await http.PostAsJsonAsync(
            "https://www.googleapis.com/calendar/v3/calendars",
            new { summary = "NoteKeeper", description = "Notes synchronized from NoteKeeper." },
            ct);

        if (!response.IsSuccessStatusCode)
        {
            throw new GoogleCalendarException("Google Calendar could not create the NoteKeeper calendar.");
        }

        return await response.Content.ReadFromJsonAsync<GoogleCalendarResponse>(ct)
            ?? throw new GoogleCalendarException("Google Calendar returned an invalid calendar.");
    }

    private string BuildClientRedirect(string result)
    {
        return QueryHelpers.AddQueryString(
            $"{options.ClientAppUrl.TrimEnd('/')}/workspace/notes/calendar",
            "googleCalendar",
            result);
    }

    private void EnsureConfigured()
    {
        if (!options.IsConfigured)
        {
            throw new GoogleCalendarException("Google Calendar is not configured for this environment.");
        }
    }

    private static object CriarEvento(Nota note)
    {
        var dueDate = note.DataVencimento!.Value;
        var endDate = dueDate.AddDays(1);
        var description = new StringBuilder();

        if (!string.IsNullOrWhiteSpace(note.Descricao))
        {
            description.AppendLine(note.Descricao);
            description.AppendLine();
        }

        description.AppendLine($"Status: {note.Status}");
        description.Append($"Priority: {note.Prioridade}");

        return new
        {
            summary = note.Titulo,
            description = description.ToString(),
            start = new { date = dueDate.ToString("yyyy-MM-dd") },
            end = new { date = endDate.ToString("yyyy-MM-dd") }
        };
    }

    private sealed record AuthorizationState(Guid UsuarioId, DateTimeOffset ExpiresAt);

    private sealed record GoogleTokenResponse(
        [property: System.Text.Json.Serialization.JsonPropertyName("access_token")] string? AccessToken,
        [property: System.Text.Json.Serialization.JsonPropertyName("refresh_token")] string? RefreshToken);

    private sealed record GoogleCalendarResponse(
        [property: System.Text.Json.Serialization.JsonPropertyName("id")] string? Id);

    private sealed record GoogleCalendarEventResponse(
        [property: System.Text.Json.Serialization.JsonPropertyName("id")] string? Id,
        [property: System.Text.Json.Serialization.JsonPropertyName("htmlLink")] string? HtmlLink);
}

public sealed class GoogleCalendarException(string message) : Exception(message);

public sealed class GoogleCalendarNotFoundException(string message) : Exception(message);
