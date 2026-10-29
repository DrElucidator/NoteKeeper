using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;
using NoteKeeper.Infraestrutura.Compartilhado.Orm;

#nullable disable

namespace NoteKeeper.Infraestrutura.Compartilhado.Orm.Migrations;

[DbContext(typeof(NoteKeeperDbContext))]
[Migration("20261029100000_AddGoogleCalendarIntegration")]
public partial class AddGoogleCalendarIntegration : Migration
{
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.AddColumn<string>(
            name: "GoogleCalendarEventId",
            table: "Notas",
            type: "nvarchar(256)",
            maxLength: 256,
            nullable: true);

        migrationBuilder.CreateTable(
            name: "GoogleCalendarConnections",
            columns: table => new
            {
                UsuarioId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                CalendarioId = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: false),
                RefreshTokenProtegido = table.Column<string>(type: "nvarchar(max)", nullable: false),
                ConectadoEm = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: false),
                AtualizadoEm = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: false)
            },
            constraints: table =>
            {
                table.PrimaryKey("PK_GoogleCalendarConnections", connection => connection.UsuarioId);
                table.ForeignKey(
                    name: "FK_GoogleCalendarConnections_AspNetUsers_UsuarioId",
                    column: connection => connection.UsuarioId,
                    principalTable: "AspNetUsers",
                    principalColumn: "Id",
                    onDelete: ReferentialAction.Cascade);
            });
    }

    protected override void Down(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.DropTable(name: "GoogleCalendarConnections");

        migrationBuilder.DropColumn(
            name: "GoogleCalendarEventId",
            table: "Notas");
    }
}
