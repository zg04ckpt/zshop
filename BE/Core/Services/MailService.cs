using Core.Configurations;
using Core.Interfaces.Services;
using Core.Interfaces.Services.External;
using Core.Utilities;
using MailKit.Net.Smtp;
using Microsoft.Extensions.Options;
using MimeKit;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Core.Services
{
    public class MailService : IMailService
    {
        private readonly MailConfig _mailConfig;
        private readonly IStorageService _storageService;

        public MailService(IOptions<MailConfig> config, IStorageService storageService)
        {
            _mailConfig = config.Value;
            _storageService = storageService;
        }

        public async Task<bool> SendAuthenticationCodeViaEmail(string email, string code, int ttl_minutes, string templateFileName)
        {
            string template = await _storageService.GetHtmlTemplate(templateFileName);
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
                mail.From.Add(new MailboxAddress("ZShop", EnvHelper.GetSystemEmail()));
                mail.To.Add(MailboxAddress.Parse(receiver));
                mail.Body = new TextPart(MimeKit.Text.TextFormat.Html)
                {
                    Text = htmlContent
                };

                // Connect to mail server and send mail
                using var smtpClient = new SmtpClient();
                smtpClient.Connect(_mailConfig.Host, _mailConfig.Port, MailKit.Security.SecureSocketOptions.StartTls);
                smtpClient.Authenticate(EnvHelper.GetSystemEmail(), EnvHelper.GetSystemEmailPassword());
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
