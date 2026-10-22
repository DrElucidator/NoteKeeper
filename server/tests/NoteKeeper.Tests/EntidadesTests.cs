using NoteKeeper.Dominio.Modulos.Categorias;
using NoteKeeper.Dominio.Modulos.Notas;
using NoteKeeper.Aplicacao.Modulos.Notas;
using Xunit;

namespace NoteKeeper.Tests;

public sealed class EntidadesTests
{
    [Fact]
    public void Categoria_AplicaTrimEValidacaoDeTitulo()
    {
        var categoria = new Categoria(Guid.NewGuid(), "  Trabalho  ");

        Assert.Equal("Trabalho", categoria.Titulo);
        Assert.Equal("TRABALHO", categoria.TituloNormalizado);
        Assert.Empty(categoria.Validar());
    }

    [Theory]
    [InlineData("")]
    [InlineData("A")]
    public void Categoria_RejeitaTituloCurto(string titulo)
    {
        var categoria = new Categoria(Guid.NewGuid(), titulo);
        Assert.NotEmpty(categoria.Validar());
    }

    [Fact]
    public void Nota_PermiteDescricaoVaziaENotaSemCategorias()
    {
        var nota = new Nota(Guid.NewGuid(), "Ideia", null, StatusNota.Ativa);
        Assert.Empty(nota.Validar());
        Assert.Empty(nota.NotasCategorias);
    }

    [Fact]
    public void Nota_RejeitaDescricaoMaiorQueTrezentosCaracteres()
    {
        var nota = new Nota(Guid.NewGuid(), "Ideia", new string('a', 301), StatusNota.Ativa);
        Assert.Contains(nota.Validar(), erro => erro.Campo == "descricao");
    }

    [Fact]
    public void Nota_NormalizaTituloSemDistinguirCaixa()
    {
        var nota = new Nota(Guid.NewGuid(), "  Minha Nota ", null, StatusNota.Arquivada);
        Assert.Equal("Minha Nota", nota.Titulo);
        Assert.Equal("MINHA NOTA", nota.TituloNormalizado);
    }

    [Fact]
    public async Task CriarNota_SemStatusComecaAtiva()
    {
        var repositorio = new RepositorioNotaFalso();
        var handler = new CriarNotaCommandHandler(repositorio);

        var resultado = await handler.Handle(
            new CriarNotaCommand(Guid.NewGuid(), "Anotação", null),
            CancellationToken.None);

        Assert.True(resultado.IsSuccess);
        Assert.Equal(StatusNota.Ativa, repositorio.NotaSalva?.Status);
    }

    private sealed class RepositorioNotaFalso : IRepositorioNota
    {
        public Nota? NotaSalva { get; private set; }

        public Task SalvarAsync(Nota nota, IReadOnlyCollection<Guid>? categoriaIds, CancellationToken cancellationToken)
        {
            NotaSalva = nota;
            return Task.CompletedTask;
        }

        public Task ExcluirAsync(Nota nota, CancellationToken cancellationToken)
        {
            throw new NotImplementedException();
        }

        public Task<IReadOnlyList<Nota>> ListarAsync(
            Guid usuarioId,
            IReadOnlyCollection<Guid>? categoriaIds,
            CancellationToken cancellationToken)
        {
            throw new NotImplementedException();
        }

        public Task<Nota?> ObterAsync(Guid id, Guid usuarioId, CancellationToken cancellationToken)
        {
            throw new NotImplementedException();
        }

        public Task<bool> TituloExisteAsync(
            Guid usuarioId,
            string tituloNormalizado,
            Guid? ignorarId,
            CancellationToken cancellationToken)
        {
            return Task.FromResult(false);
        }

        public Task<IReadOnlyList<Guid>?> CategoriasPropriasAsync(
            Guid usuarioId,
            IReadOnlyCollection<Guid> ids,
            CancellationToken cancellationToken)
        {
            return Task.FromResult<IReadOnlyList<Guid>?>(ids.ToArray());
        }
    }
}
