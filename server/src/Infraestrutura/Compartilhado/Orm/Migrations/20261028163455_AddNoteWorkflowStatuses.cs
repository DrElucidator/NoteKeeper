using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace NoteKeeper.Infraestrutura.Compartilhado.Orm.Migrations
{
    /// <inheritdoc />
    public partial class AddNoteWorkflowStatuses : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql("""
                UPDATE [Notas]
                SET [Status] = N'Pendente'
                WHERE [Status] = N'Ativa';
                """);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql("""
                UPDATE [Notas]
                SET [Status] = N'Ativa'
                WHERE [Status] = N'Pendente';
                """);
        }
    }
}
