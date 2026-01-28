namespace Core.Providers
{
    public interface IDbConnectionInfoProvider
    {
        string GetConnectionString();
        string GetDatabaseName();
        string GetUserName();
        string GetPassword();
        string GetHost();
        int GetPort();
    }
}
