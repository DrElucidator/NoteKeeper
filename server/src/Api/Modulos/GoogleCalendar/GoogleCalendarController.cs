using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using NoteKeeper.Infraestrutura.Modulos.GoogleCalendar;

namespace NoteKeeper.Api.Modulos.GoogleCalendar;

[ApiController]
[Route("integrations/google-calendar")]
public sealed class GoogleCalendarController(GoogleCalendarService googleCalendar) : ControllerBase
{
    [HttpGet("status")]
    public Task<GoogleCalendarStatus> ObterStatus(CancellationToken ct)
    {
        return googleCalendar.ObterStatusAsync(UserId(), ct);
    }

    [HttpGet("authorization-url")]
    public ActionResult<GoogleCalendarAuthorization> ObterUrlAutorizacao()
    {
        try
        {
            return Ok(googleCalendar.CriarUrlAutorizacao(UserId()));
        }
        catch (GoogleCalendarException exception)
        {
            return BadRequest(new ProblemDetails { Status = 400, Title = exception.Message });
        }
    }

    [AllowAnonymous]
    [HttpGet("callback")]
    public async Task<IActionResult> Callback(
        [FromQuery] string? code,
        [FromQuery] string? state,
        [FromQuery] string? error,
        CancellationToken ct)
    {
        if (!string.IsNullOrWhiteSpace(error) || string.IsNullOrWhiteSpace(code) || string.IsNullOrWhiteSpace(state))
        {
            return BadRequest(new ProblemDetails
            {
                Status = 400,
                Title = "Google Calendar authorization was cancelled or incomplete."
            });
        }

        try
        {
            return Redirect(await googleCalendar.ConcluirAutorizacaoAsync(code, state, ct));
        }
        catch (GoogleCalendarException exception)
        {
            return BadRequest(new ProblemDetails { Status = 400, Title = exception.Message });
        }
    }

    [HttpPost("notes/{noteId:guid}/sync")]
    public async Task<ActionResult<GoogleCalendarSyncResult>> SincronizarNota(Guid noteId, CancellationToken ct)
    {
        try
        {
            return Ok(await googleCalendar.SincronizarNotaAsync(UserId(), noteId, ct));
        }
        catch (GoogleCalendarNotFoundException exception)
        {
            return NotFound(new ProblemDetails { Status = 404, Title = exception.Message });
        }
        catch (GoogleCalendarException exception)
        {
            return BadRequest(new ProblemDetails { Status = 400, Title = exception.Message });
        }
    }

    [HttpPost("notes/sync")]
    public async Task<ActionResult<GoogleCalendarBatchSyncResult>> SincronizarTodasNotas(CancellationToken ct)
    {
        try
        {
            return Ok(await googleCalendar.SincronizarTodasNotasAsync(UserId(), ct));
        }
        catch (GoogleCalendarException exception)
        {
            return BadRequest(new ProblemDetails { Status = 400, Title = exception.Message });
        }
    }

    [HttpDelete("connection")]
    public async Task<IActionResult> Desconectar(CancellationToken ct)
    {
        await googleCalendar.DesconectarAsync(UserId(), ct);
        return NoContent();
    }

    private Guid UserId()
    {
        return Guid.Parse(User.FindFirstValue(JwtRegisteredClaimNames.Sub)!);
    }
}
