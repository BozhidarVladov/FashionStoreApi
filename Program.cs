using System;
using System.Linq;
using Microsoft.AspNetCore.Builder;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using System.Text;
using VladovClothingStore;
using VladovClothingStore.Services;
using System.Security.Claims;
using System.IdentityModel.Tokens.Jwt;
using System.Threading.Tasks;
using VladovClothingStore.Middleware;

var builder = WebApplication.CreateBuilder(args);
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowReact",
        policy => policy.WithOrigins("http://localhost:5173") // Портът на React
                        .AllowAnyMethod()
                        .AllowAnyHeader());
});
builder.Services.AddTransient<IEmailService, EmailService>();
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();

builder.Services.AddSwaggerGen(options =>
{
    options.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "Vladov Clothing Store API",
        Version = "v1"
    });

    options.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Name = "Authorization",
        In = ParameterLocation.Header,
        Type = SecuritySchemeType.ApiKey,
        Description = "Напиши точно това: Bearer {token}" 
    });

    options.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            Array.Empty<string>()
        }
    });
});

builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseSqlite("Data Source=fashion.db"));

var keyBytes = Encoding.UTF8.GetBytes("vladovstoresecretkey123456789012");

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.RequireHttpsMetadata = false;
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true, 
        ValidateIssuerSigningKey = true,

        ValidIssuer = "VladovAPI",
        ValidAudience = "VladovAPI",

        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes("vladovstoresecretkey123456789012")),

        RoleClaimType = ClaimTypes.Role,
        NameClaimType = ClaimTypes.Name,

        ClockSkew = TimeSpan.Zero
    };
    options.Events = new JwtBearerEvents
    {
        OnAuthenticationFailed = context =>
        {
            Console.WriteLine("TOKEN ERROR: " + context.Exception.Message);
            return Task.CompletedTask;
        }
    };
});




builder.Services.AddScoped<IStoreService, StoreService>();
builder.Services.AddAuthorization();

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseMiddleware<ExceptionMiddleware>();

app.UseRouting();

app.UseCors("AllowReact");

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

using (var scope = app.Services.CreateScope())
{
    var context = scope.ServiceProvider.GetRequiredService<VladovClothingStore.ApplicationDbContext>();
    
    // Проверяваме дали таблицата е празна, като броим редовете
    if (context.Categories.Count() == 0)
    {
        // Създаваме категорията динамично през самия Context
        var newCategory = new VladovClothingStore.Models.Category
        {
            Id = 1,
            Name = "Summer Collection"
        };
        
        context.Categories.Add(newCategory);
        context.SaveChanges();
        Console.WriteLine("------> УСПЕШНО ДОБАВЕНА АВТОМАТИЧНА КАТЕГОРИЯ: Summer Collection! <------");
    }
}
app.Run();