using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace VladovClothingStore.Migrations
{
    
    public partial class AddManyToManyTags : Migration
    {
       
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "name",
                table: "Categories",
                newName: "Name");

            migrationBuilder.AddColumn<int>(
                name: "TagId",
                table: "Clothes",
                type: "INTEGER",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "Tags",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    Name = table.Column<string>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Tags", x => x.Id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Clothes_TagId",
                table: "Clothes",
                column: "TagId");

            migrationBuilder.AddForeignKey(
                name: "FK_Clothes_Tags_TagId",
                table: "Clothes",
                column: "TagId",
                principalTable: "Tags",
                principalColumn: "Id");
        }
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Clothes_Tags_TagId",
                table: "Clothes");

            migrationBuilder.DropTable(
                name: "Tags");

            migrationBuilder.DropIndex(
                name: "IX_Clothes_TagId",
                table: "Clothes");

            migrationBuilder.DropColumn(
                name: "TagId",
                table: "Clothes");

            migrationBuilder.RenameColumn(
                name: "Name",
                table: "Categories",
                newName: "name");
        }
    }
}
