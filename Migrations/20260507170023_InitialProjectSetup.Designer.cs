using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;
using Microsoft.EntityFrameworkCore.Storage.ValueConversion;
using VladovClothingStore;

#nullable disable

namespace VladovClothingStore.Migrations
{
    [DbContext(typeof(ApplicationDbContext))]
    [Migration("20260507170023_InitialProjectSetup")]
    partial class InitialProjectSetup
    {
        protected override void BuildTargetModel(ModelBuilder modelBuilder)
        {
#pragma warning disable 612, 618
            modelBuilder.HasAnnotation("ProductVersion", "10.0.7");

            modelBuilder.Entity("VladovClothingStore.Models.Category", b =>
                {
                    b.Property<int>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("INTEGER");

                    b.Property<string>("name")
                        .IsRequired()
                        .HasColumnType("TEXT");

                    b.HasKey("Id");

                    b.ToTable("Categories");
                });

            modelBuilder.Entity("VladovClothingStore.Models.ClothingItem", b =>
                {
                    b.Property<int>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("INTEGER");

                    b.Property<int>("CategoryId")
                        .HasColumnType("INTEGER");

                    b.Property<string>("Name")
                        .IsRequired()
                        .HasColumnType("TEXT");

                    b.Property<decimal>("Price")
                        .HasColumnType("TEXT");

                    b.HasKey("Id");

                    b.HasIndex("CategoryId");

                    b.ToTable("Clothes");
                });

            modelBuilder.Entity("VladovClothingStore.Models.ClothingItem", b =>
                {
                    b.HasOne("VladovClothingStore.Models.Category", "Category")
                        .WithMany("ClothingItems")
                        .HasForeignKey("CategoryId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.Navigation("Category");
                });

            modelBuilder.Entity("VladovClothingStore.Models.Category", b =>
                {
                    b.Navigation("ClothingItems");
                });
#pragma warning restore 612, 618
        }
    }
}
