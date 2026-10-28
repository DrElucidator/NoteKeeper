using FluentResults;
using MediatR;
using NoteKeeper.Aplicacao.Compartilhado;
using NoteKeeper.Dominio.Compartilhado;
using NoteKeeper.Dominio.Modulos.Notas;

namespace NoteKeeper.Aplicacao.Modulos.Notas;

public sealed record AtualizarStatusNotaCommand(Guid UsuarioId, Guid Id, string? Status)
    : IRequest<Result<NotaDto>>;

public sealed class AtualizarStatusNotaCommandHandler(IRepositorioNota repositorio)
    : IRequestHandler<AtualizarStatusNotaCommand, Result<NotaDto>>
{
    public async Task<Result<NotaDto>> Handle(AtualizarStatusNotaCommand command, CancellationToken ct)
    {
        var nota = await repositorio.ObterAsync(command.Id, command.UsuarioId, ct);
        if (nota is null)
        {
            return Result.Fail<NotaDto>(Erros.Criar(TipoErro.NaoEncontrado, "Nota não encontrada."));
        }

        if (!StatusNotaParser.TryParse(command.Status, out var status))
        {
            return Result.Fail<NotaDto>(
                Erros.Criar(
                    TipoErro.Validacao,
                    "Status deve ser Pendente, EmAndamento, Concluida ou Arquivada.",
                    "status"));
        }

        nota.AlterarStatus(status);
        await repositorio.SalvarStatusAsync(nota, ct);

        return Result.Ok(DtoMapper.ToDto(nota));
    }
}
