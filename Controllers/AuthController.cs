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
        string recipientEmail = request.Email;
        string subject = "Добре дошли във Vladov Clothing Store! 🎉";

        string messageBody = $@"
        <h1>Здравейте и добре дошли!</h1>
        <p>Благодарим ви, че се регистрирахте във <strong>Vladov Clothing Store</strong>.</p>
        <p>Вашият профил беше създаден успешно с имейл: <strong>{request.Email}</strong>.</p>
        <p>Вече можете да разгледате най-новите ни колекции дрехи и да направите първата си поръчка!</p>
        <br/>
        <p>Поздрави,<br/>Екипът на Vladov Clothing Store</p>";

        await _emailService.SendEmailAsync(recipientEmail, subject, messageBody);

        return Ok("Регистрацията е успешна!");
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