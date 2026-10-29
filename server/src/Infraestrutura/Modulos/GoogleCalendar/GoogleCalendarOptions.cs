namespace NoteKeeper.Infraestrutura.Modulos.GoogleCalendar;

public sealed class GoogleCalendarOptions
{
    public const string SectionName = "GoogleCalendar";

    public string ClientId { get; init; } = string.Empty;
    public string ClientSecret { get; init; } = string.Empty;
    public string RedirectUri { get; init; } = string.Empty;
    public string ClientAppUrl { get; init; } = "http://localhost:4200";

    public bool IsConfigured =>
        !string.IsNullOrWhiteSpace(ClientId) &&
        !string.IsNullOrWhiteSpace(ClientSecret) &&
        Uri.TryCreate(RedirectUri, UriKind.Absolute, out _) &&
        Uri.TryCreate(ClientAppUrl, UriKind.Absolute, out _);
}
