using Core.Utilities;
using MailKit.Net.Smtp;
using Microsoft.Extensions.Configuration;
using MimeKit;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Core.Services.Impl
{
    public class MailService : IMailService
    {
        private readonly IConfiguration config;
        private readonly IStorageService storageService;
        private string host;
        private int port;
        private string systemEmailAddress;
        private string systemEmailPassword;

        public MailService(IConfiguration config, IStorageService storageService)
        {
            this.config = config;
            this.host = config.GetSection("MailConfig")["Host"];
            this.port = int.Parse(config.GetSection("MailConfig")["Port"]);
            this.systemEmailAddress = Environment.GetEnvironmentVariable("SystemEmailAddress")!;
            this.systemEmailPassword = Environment.GetEnvironmentVariable("SystemEmailPassword")!;
            this.storageService = storageService;
        }

        public async Task<bool> SendAuthenticationCodeViaEmail(string email, string code, int ttl_minutes)
        {
            string template = await storageService.GetHtmlTemplate("confirm_email.html");
            template = template.Replace("[auth-code]", code);
            template = template.Replace("[ttl_minutes]", ttl_minutes.ToString());
            return await SendMail(email, "Nhập mã xác thực", template);
        }

        public async Task<bool> SendMail(string receiver, string subject, string htmlContent)
        {
            try
            {
                // Create a mail contain
                MimeMessage mail = new();
                mail.Subject = subject;
                mail.From.Add(new MailboxAddress("ZShop", systemEmailAddress));
                mail.To.Add(MailboxAddress.Parse(receiver));
                mail.Body = new TextPart(MimeKit.Text.TextFormat.Html)
                {
                    Text = htmlContent
                };

                // Connect to mail server and send mail
                using var smtpClient = new SmtpClient();
                smtpClient.Connect(host, port, MailKit.Security.SecureSocketOptions.StartTls);
                smtpClient.Authenticate(systemEmailAddress, systemEmailPassword);
                await smtpClient.SendAsync(mail);
                smtpClient.Disconnect(true);

                return true;
            }
            catch
            {
                return false;
            }
            
        }
    }
}
