using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Data.Migrations
{
    public partial class FixBookVectorSyncFK : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_BookVectorSyncs_Books_BookId1",
                table: "BookVectorSyncs");

            migrationBuilder.DropIndex(
                name: "IX_BookVectorSyncs_BookId1",
                table: "BookVectorSyncs");

            migrationBuilder.DropColumn(
                name: "BookId1",
                table: "BookVectorSyncs");

            migrationBuilder.AddForeignKey(
                name: "FK_BookVectorSyncs_Books_BookId",
                table: "BookVectorSyncs",
                column: "BookId",
                principalTable: "Books",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_BookVectorSyncs_Books_BookId",
                table: "BookVectorSyncs");

            migrationBuilder.AddColumn<Guid>(
                name: "BookId1",
                table: "BookVectorSyncs",
                type: "char(36)",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"),
                collation: "ascii_general_ci");

            migrationBuilder.CreateIndex(
                name: "IX_BookVectorSyncs_BookId1",
                table: "BookVectorSyncs",
                column: "BookId1");

            migrationBuilder.AddForeignKey(
                name: "FK_BookVectorSyncs_Books_BookId1",
                table: "BookVectorSyncs",
                column: "BookId1",
                principalTable: "Books",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
