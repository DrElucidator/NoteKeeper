using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using NoteKeeper.Infraestrutura.Modulos.GoogleCalendar;

namespace NoteKeeper.Infraestrutura.Compartilhado.Orm.Config;

public sealed class GoogleCalendarConnectionConfiguration : IEntityTypeConfiguration<GoogleCalendarConnection>
{
    public void Configure(EntityTypeBuilder<GoogleCalendarConnection> builder)
    {
        builder.ToTable("GoogleCalendarConnections");
        builder.HasKey(connection => connection.UsuarioId);

        builder.Property(connection => connection.CalendarioId)
            .HasMaxLength(256)
            .IsRequired();

        builder.Property(connection => connection.RefreshTokenProtegido)
            .IsRequired();

        builder.HasOne<NoteKeeperUser>()
            .WithOne()
            .HasForeignKey<GoogleCalendarConnection>(connection => connection.UsuarioId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
