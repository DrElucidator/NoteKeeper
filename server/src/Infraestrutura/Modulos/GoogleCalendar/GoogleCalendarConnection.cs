namespace NoteKeeper.Infraestrutura.Modulos.GoogleCalendar;

public sealed class GoogleCalendarConnection
{
    public Guid UsuarioId { get; private set; }
    public string CalendarioId { get; private set; } = string.Empty;
    public string RefreshTokenProtegido { get; private set; } = string.Empty;
    public DateTimeOffset ConectadoEm { get; private set; }
    public DateTimeOffset AtualizadoEm { get; private set; }

    private GoogleCalendarConnection() { }

    public GoogleCalendarConnection(Guid usuarioId, string calendarioId, string refreshTokenProtegido)
    {
        UsuarioId = usuarioId;
        Atualizar(calendarioId, refreshTokenProtegido);
        ConectadoEm = AtualizadoEm;
    }

    public void Atualizar(string calendarioId, string refreshTokenProtegido)
    {
        CalendarioId = calendarioId;
        RefreshTokenProtegido = refreshTokenProtegido;
        AtualizadoEm = DateTimeOffset.UtcNow;
    }
}
