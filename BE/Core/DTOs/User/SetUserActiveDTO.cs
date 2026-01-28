namespace Core.DTOs.User
{
    public class SetUserActiveDTO
    {
        public Guid UserId { get; set; }
        public bool IsActived { get; set; }
    }
}
