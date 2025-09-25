using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace RunTribe.Api.Migrations
{
    /// <inheritdoc />
    public partial class SimplifyShoeModel : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_IndividualRuns_Shoes_ShoeId",
                table: "IndividualRuns");

            migrationBuilder.DropColumn(
                name: "Color",
                table: "Shoes");

            migrationBuilder.DropColumn(
                name: "Model",
                table: "Shoes");

            migrationBuilder.DropColumn(
                name: "Notes",
                table: "Shoes");

            migrationBuilder.DropColumn(
                name: "PurchaseDate",
                table: "Shoes");

            migrationBuilder.DropColumn(
                name: "Size",
                table: "Shoes");

            migrationBuilder.RenameColumn(
                name: "TotalMiles",
                table: "Shoes",
                newName: "StartingMiles");

            migrationBuilder.AddForeignKey(
                name: "FK_IndividualRuns_Shoes_ShoeId",
                table: "IndividualRuns",
                column: "ShoeId",
                principalTable: "Shoes",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_IndividualRuns_Shoes_ShoeId",
                table: "IndividualRuns");

            migrationBuilder.RenameColumn(
                name: "StartingMiles",
                table: "Shoes",
                newName: "TotalMiles");

            migrationBuilder.AddColumn<string>(
                name: "Color",
                table: "Shoes",
                type: "nvarchar(100)",
                maxLength: 100,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Model",
                table: "Shoes",
                type: "nvarchar(100)",
                maxLength: 100,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Notes",
                table: "Shoes",
                type: "nvarchar(1000)",
                maxLength: 1000,
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "PurchaseDate",
                table: "Shoes",
                type: "datetime2",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddColumn<string>(
                name: "Size",
                table: "Shoes",
                type: "nvarchar(50)",
                maxLength: 50,
                nullable: true);

            migrationBuilder.AddForeignKey(
                name: "FK_IndividualRuns_Shoes_ShoeId",
                table: "IndividualRuns",
                column: "ShoeId",
                principalTable: "Shoes",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);
        }
    }
}
