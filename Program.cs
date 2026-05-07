using Microsoft.EntityFrameworkCore;
using VladovClothingStore;
using VladovClothingStore.Services;

var builder = WebApplication.CreateBuilder(args);

// Регистриране на услугите
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseSqlite("Data Source=fashion.db"));

builder.Services.AddScoped<IStoreService, StoreService>();

var app = builder.Build();

app.UseSwagger();
app.UseSwaggerUI(c =>
{
    c.SwaggerEndpoint("/swagger/v1/swagger.json", "Vladov Store API V1");
    c.RoutePrefix = "swagger"; 
});

app.UseRouting();
app.UseAuthorization();

app.MapControllers();

app.Run();