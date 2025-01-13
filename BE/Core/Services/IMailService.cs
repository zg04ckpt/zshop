using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Core.Services
{
    public interface IMailService
    {
        Task<bool> SendMail(string receiver, string subject, string body);
        Task<bool> SendAuthenticationCodeViaEmail(string email, string code, int ttl_minutes, string templateFileName);
    }
}
