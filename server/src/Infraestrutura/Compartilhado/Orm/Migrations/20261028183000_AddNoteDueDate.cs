using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;
using NoteKeeper.Infraestrutura.Compartilhado.Orm;

#nullable disable

namespace NoteKeeper.Infraestrutura.Compartilhado.Orm.Migrations;

[DbContext(typeof(NoteKeeperDbContext))]
[Migration("20261028183000_AddNoteDueDate")]
public partial class AddNoteDueDate : Migration
{
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.AddColumn<DateOnly>(
            name: "DataVencimento",
            table: "Notas",
            type: "date",
            nullable: true);
    }

    protected override void Down(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.DropColumn(
            name: "DataVencimento",
            table: "Notas");
    }
}
