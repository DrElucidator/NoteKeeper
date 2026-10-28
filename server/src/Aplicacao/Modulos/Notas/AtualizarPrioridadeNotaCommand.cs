using FluentResults;
using MediatR;
using NoteKeeper.Aplicacao.Compartilhado;
using NoteKeeper.Dominio.Compartilhado;
using NoteKeeper.Dominio.Modulos.Notas;

namespace NoteKeeper.Aplicacao.Modulos.Notas;

public sealed record AtualizarPrioridadeNotaCommand(Guid UsuarioId, Guid Id, string? Prioridade)
    : IRequest<Result<NotaDto>>;

public sealed class AtualizarPrioridadeNotaCommandHandler(IRepositorioNota repositorio)
    : IRequestHandler<AtualizarPrioridadeNotaCommand, Result<NotaDto>>
{
    public async Task<Result<NotaDto>> Handle(
        AtualizarPrioridadeNotaCommand command,
        CancellationToken ct)
    {
        var nota = await repositorio.ObterAsync(command.Id, command.UsuarioId, ct);
        if (nota is null)
        {
            return Result.Fail<NotaDto>(Erros.Criar(TipoErro.NaoEncontrado, "Nota não encontrada."));
        }

        if (!PrioridadeNotaParser.TryParse(command.Prioridade, out var prioridade))
        {
            return Result.Fail<NotaDto>(
                Erros.Criar(
                    TipoErro.Validacao,
                    "Prioridade deve ser Baixa, Media, Alta ou Urgente.",
                    "prioridade"));
        }

        nota.AlterarPrioridade(prioridade);
        await repositorio.SalvarPrioridadeAsync(nota, ct);

        return Result.Ok(DtoMapper.ToDto(nota));
    }
}
