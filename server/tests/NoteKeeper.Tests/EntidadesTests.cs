using NoteKeeper.Dominio.Modulos.Categorias;
using NoteKeeper.Dominio.Modulos.Notas;
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
}
