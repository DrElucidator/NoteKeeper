using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace NoteKeeper.Infraestrutura.Compartilhado.Orm.Migrations
{
    /// <inheritdoc />
    public partial class AddNotePriority : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Prioridade",
                table: "Notas",
                type: "nvarchar(20)",
                maxLength: 20,
                nullable: false,
                defaultValue: "Media");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Prioridade",
                table: "Notas");
        }
    }
}
