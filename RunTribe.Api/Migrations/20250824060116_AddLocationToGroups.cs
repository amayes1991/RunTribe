using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace RunTribe.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddLocationToGroups : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Location",
                table: "Groups",
                type: "nvarchar(200)",
                maxLength: 200,
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Location",
                table: "Groups");
        }
    }
}
