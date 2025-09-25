using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace RunTribe.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddShoesTable : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<Guid>(
                name: "ShoeId",
                table: "IndividualRuns",
                type: "uniqueidentifier",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "ShoeId",
                table: "GroupRuns",
                type: "uniqueidentifier",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "Shoes",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    UserId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Name = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    Brand = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    Model = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    ImageUrl = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    Color = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    Size = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    TotalMiles = table.Column<decimal>(type: "decimal(8,2)", precision: 8, scale: 2, nullable: false),
                    MaxMiles = table.Column<decimal>(type: "decimal(8,2)", precision: 8, scale: 2, nullable: true),
                    PurchaseDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    IsActive = table.Column<bool>(type: "bit", nullable: false),
                    Notes = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Shoes", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Shoes_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_IndividualRuns_ShoeId",
                table: "IndividualRuns",
                column: "ShoeId");

            migrationBuilder.CreateIndex(
                name: "IX_GroupRuns_ShoeId",
                table: "GroupRuns",
                column: "ShoeId");

            migrationBuilder.CreateIndex(
                name: "IX_Shoes_UserId",
                table: "Shoes",
                column: "UserId");

            migrationBuilder.AddForeignKey(
                name: "FK_GroupRuns_Shoes_ShoeId",
                table: "GroupRuns",
                column: "ShoeId",
                principalTable: "Shoes",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_IndividualRuns_Shoes_ShoeId",
                table: "IndividualRuns",
                column: "ShoeId",
                principalTable: "Shoes",
                principalColumn: "Id",
                onDelete: ReferentialAction.NoAction);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_GroupRuns_Shoes_ShoeId",
                table: "GroupRuns");

            migrationBuilder.DropForeignKey(
                name: "FK_IndividualRuns_Shoes_ShoeId",
                table: "IndividualRuns");

            migrationBuilder.DropTable(
                name: "Shoes");

            migrationBuilder.DropIndex(
                name: "IX_IndividualRuns_ShoeId",
                table: "IndividualRuns");

            migrationBuilder.DropIndex(
                name: "IX_GroupRuns_ShoeId",
                table: "GroupRuns");

            migrationBuilder.DropColumn(
                name: "ShoeId",
                table: "IndividualRuns");

            migrationBuilder.DropColumn(
                name: "ShoeId",
                table: "GroupRuns");
        }
    }
}
