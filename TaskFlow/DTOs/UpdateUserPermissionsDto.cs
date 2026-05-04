namespace TaskFlow.DTOs
{
    public class UpdateUserPermissionsDto
    {
        public bool CanInteractWithTasks { get; set; }
        public bool CanComment { get; set; }
        public bool CanAttachFiles { get; set; }
    }
}