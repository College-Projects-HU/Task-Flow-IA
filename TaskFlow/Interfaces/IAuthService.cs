using TaskFlow.DTOs;

namespace TaskFlow.Interfaces
{
    public interface IAuthService
    {
        Task<(bool Success, string Message)> RegisterAsync(RegisterDto dto);
        Task<(bool Success, string TokenOrMessage)> LoginAsync(LoginDto dto);
    }
}