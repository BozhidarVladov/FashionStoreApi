using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace VladovClothingStore.Migrations
{
    /// <inheritdoc />
    public partial class AddDescriptionToClothing : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Description",
                table: "Clothes",
                type: "TEXT",
                nullable: false,
                defaultValue: "");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Description",
                table: "Clothes");
        }
    }
}
