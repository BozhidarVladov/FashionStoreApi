using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace VladovClothingStore.Migrations
{
    /// <inheritdoc />
    public partial class AddImageUrlToClothing : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Clothes_Tags_TagId",
                table: "Clothes");

            migrationBuilder.DropIndex(
                name: "IX_Clothes_TagId",
                table: "Clothes");

            migrationBuilder.DropColumn(
                name: "TagId",
                table: "Clothes");

            migrationBuilder.AddColumn<string>(
                name: "ImageUrl",
                table: "Clothes",
                type: "TEXT",
                nullable: false,
                defaultValue: "");

            migrationBuilder.CreateTable(
                name: "ClothingItemTag",
                columns: table => new
                {
                    ClothingItemsId = table.Column<int>(type: "INTEGER", nullable: false),
                    TagsId = table.Column<int>(type: "INTEGER", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ClothingItemTag", x => new { x.ClothingItemsId, x.TagsId });
                    table.ForeignKey(
                        name: "FK_ClothingItemTag_Clothes_ClothingItemsId",
                        column: x => x.ClothingItemsId,
                        principalTable: "Clothes",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_ClothingItemTag_Tags_TagsId",
                        column: x => x.TagsId,
                        principalTable: "Tags",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_ClothingItemTag_TagsId",
                table: "ClothingItemTag",
                column: "TagsId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "ClothingItemTag");

            migrationBuilder.DropColumn(
                name: "ImageUrl",
                table: "Clothes");

            migrationBuilder.AddColumn<int>(
                name: "TagId",
                table: "Clothes",
                type: "INTEGER",
                nullable: true);

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
    }
}
