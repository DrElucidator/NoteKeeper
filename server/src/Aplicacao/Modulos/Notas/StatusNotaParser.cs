using NoteKeeper.Dominio.Modulos.Notas;

namespace NoteKeeper.Aplicacao.Modulos.Notas;

internal static class StatusNotaParser
{
    internal static bool TryParse(string? status, bool permitirPadraoAtivo, out StatusNota resultado)
    {
        if (status is null && permitirPadraoAtivo)
        {
            resultado = StatusNota.Ativa;
            return true;
        }

        return Enum.TryParse(status, ignoreCase: true, out resultado)
            && Enum.IsDefined(resultado);
    }
}
