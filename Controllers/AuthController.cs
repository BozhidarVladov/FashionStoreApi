using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System;
using Microsoft.Extensions.Configuration;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using System.Threading.Tasks;
using VladovClothingStore.Models;
using VladovClothingStore.Services;

namespace VladovClothingStore.Controllers;

[Route("api/[controller]")]
[ApiController]
public class AuthController : ControllerBase
{
    private readonly IConfiguration _configuration;
    private readonly ApplicationDbContext _context;
    private readonly IEmailService _emailService;

    public AuthController(IConfiguration configuration, ApplicationDbContext context, IEmailService emailService)
    {
        _configuration = configuration;
        _context = context;
        _emailService = emailService;
    }

    [HttpPost("register")]
    public async Task<IActionResult> Register(UserDto request)
    {
        if (await _context.Users.AnyAsync(u => u.Email == request.Email))
            return BadRequest("Потребител с този имейл вече съществува.");

        var user = new User
        {
            Email = request.Email,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password),
            Role = "Admin"
        };

        _context.Users.Add(user);
        await _context.SaveChangesAsync();

        // 🌟 Безопасно изпращане на имейл с try-catch блок
        try
        {
            string recipientEmail = request.Email;
            string subject = "Добре дошли във Vladov Clothing Store! 🎉";

            string messageBody = $@"
            <div style='font-family: ""Segoe UI"", Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 25px; border: 1px solid #e0e0e0; border-radius: 8px; background-color: #ffffff;'>
                <div style='text-align: center; margin-bottom: 25px;'>
                    <h1 style='margin: 0; color: #111; font-size: 26px; letter-spacing: 1px;'>VLADOV CLOTHING STORE</h1>
                    <h2 style='color: #28a745; margin-top: 10px;'>Успешна регистрация!</h2>
                </div>
                
                <p style='font-size: 16px; color: #333;'>Здравейте и добре дошли!</p>
                <p style='font-size: 14px; color: #555; line-height: 1.6;'>
                    Благодарим ви, че се регистрирахте във <strong>Vladov Clothing Store</strong>.<br/>
                    Вашият профил беше създаден успешно с имейл: <strong style='color: #111;'>{request.Email}</strong>.
                </p>
                <p style='font-size: 14px; color: #555; line-height: 1.6;'>
                    Вече можете да разгледате най-новите ни колекции дрехи и да направите първата си поръчка!
                </p>
                
                <hr style='border: none; border-top: 1px solid #eee; margin: 30px 0 15px 0;' />
                <p style='text-align: center; color: #999; font-size: 12px; margin: 0;'>
                    Поздрави,<br/>
                    <strong>Екипът на Vladov Clothing Store © 2026</strong>
                </p>
            </div>";

            await _emailService.SendEmailAsync(recipientEmail, subject, messageBody);
        }
        catch (Exception ex)
        {
            // Ако Gmail/SMTP сървърът се забави, записваме грешката в конзолата, 
            // но регистрацията на потребителя остава успешна
            Console.WriteLine($"[Имейл Регистрация Грешка]: {ex.Message}");
        }

        return Ok(new { message = "Регистрацията е успешна!" });
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login(UserDto request)
    {
        var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == request.Email);

        if (user == null || !BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash))
            return BadRequest("Грешен имейл или парола.");

        var token = CreateToken(user);

        return Ok(new { token });
    }

    private string CreateToken(User user)
    {
        Console.WriteLine($"USER ROLE: {user.Role}");
        
        // Твоят оригинален таен ключ си остава непокътнат и еднакъв навсякъде
        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes("vladovstoresecretkey123456789012"));

        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);
        var claims = new List<Claim>
        {
            new Claim(ClaimTypes.Name, user.Email),
            new Claim(ClaimTypes.Role, user.Role)
        };

        var token = new JwtSecurityToken(
            issuer: "VladovAPI",
            audience: "VladovAPI",
            claims: claims,
            expires: DateTime.UtcNow.AddDays(1),
            signingCredentials: creds
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}

public class UserDto
{
    [Required, EmailAddress]
    public string Email { get; set; } = string.Empty;

    [Required, MinLength(6)]
    public string Password { get; set; } = string.Empty;
}