using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using NoteKeeper.Dominio.Modulos.Categorias;
using NoteKeeper.Dominio.Modulos.Notas;
using NoteKeeper.Infraestrutura.Modulos.GoogleCalendar;

namespace NoteKeeper.Infraestrutura.Compartilhado.Orm;

public sealed class NoteKeeperDbContext(DbContextOptions<NoteKeeperDbContext> options)
    : IdentityUserContext<NoteKeeperUser, Guid>(options)
{
    public DbSet<Categoria> Categorias => Set<Categoria>();
    public DbSet<Nota> Notas => Set<Nota>();
    public DbSet<NotaCategoria> NotasCategorias => Set<NotaCategoria>();
    public DbSet<TokenRevogado> TokensRevogados => Set<TokenRevogado>();
    public DbSet<GoogleCalendarConnection> GoogleCalendarConnections => Set<GoogleCalendarConnection>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.ApplyConfigurationsFromAssembly(typeof(NoteKeeperDbContext).Assembly);
    }
}
