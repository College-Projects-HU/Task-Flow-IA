using TaskFlow.DTOs;

namespace TaskFlow.Interfaces
{
    public interface IAuthService
    {
        Task<(bool Success, string Message, int? UserId)> RegisterAsync(RegisterDto dto);
        Task<(bool Success, string TokenOrMessage)> LoginAsync(LoginDto dto);
    }
}