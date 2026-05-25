using MailKit.Net.Smtp;
using MimeKit;
using Microsoft.Extensions.Configuration;
using System.Threading.Tasks;

namespace VladovClothingStore.Services
{
    public class EmailService : IEmailService
    {
        private readonly IConfiguration _config;

        public EmailService(IConfiguration config)
        {
            _config = config;
        }

        public async Task SendEmailAsync(string toEmail, string subject, string messageBody)
{
    var emailMessage = new MimeMessage();
    var senderName = _config["EmailSettings:SenderName"] ?? "Vladov Clothing Store";
    var senderEmail = _config["EmailSettings:SenderEmail"] ?? "";

    emailMessage.From.Add(new MailboxAddress(senderName, senderEmail));
    emailMessage.To.Add(new MailboxAddress("", toEmail));
    emailMessage.Subject = subject;

    var bodyBuilder = new BodyBuilder { HtmlBody = messageBody };
    emailMessage.Body = bodyBuilder.ToMessageBody();

    using (var client = new SmtpClient())
    {
        var smtpServer = _config["EmailSettings:SmtpServer"] ?? "smtp.gmail.com";
        var port = int.Parse(_config["EmailSettings:Port"] ?? "587");
        var password = _config["EmailSettings:Password"] ?? "";

        await client.ConnectAsync(smtpServer, port, MailKit.Security.SecureSocketOptions.StartTls);
        await client.AuthenticateAsync(senderEmail, password);
        await client.SendAsync(emailMessage);
        await client.DisconnectAsync(true);
    }
    }
    }
}