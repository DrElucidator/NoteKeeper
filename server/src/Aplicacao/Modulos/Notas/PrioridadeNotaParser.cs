using NoteKeeper.Dominio.Modulos.Notas;

namespace NoteKeeper.Aplicacao.Modulos.Notas;

internal static class PrioridadeNotaParser
{
    internal static bool TryParse(string? prioridade, out PrioridadeNota resultado)
    {
        return Enum.TryParse(prioridade, ignoreCase: true, out resultado)
            && Enum.IsDefined(resultado);
    }
}
