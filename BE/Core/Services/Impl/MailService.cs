using Core.Configurations;
using Core.Utilities;
using MailKit.Net.Smtp;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Options;
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
        private readonly MailConfig mailConfig;
        private readonly IStorageService storageService;

        public MailService(IOptions<MailConfig> config, IStorageService storageService)
        {
            this.mailConfig = config.Value;
            this.storageService = storageService;
        }

        public async Task<bool> SendAuthenticationCodeViaEmail(string email, string code, int ttl_minutes, string templateFileName)
        {
            string template = await storageService.GetHtmlTemplate(templateFileName);
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
                smtpClient.Connect(mailConfig.Host, mailConfig.Port, MailKit.Security.SecureSocketOptions.StartTls);
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
