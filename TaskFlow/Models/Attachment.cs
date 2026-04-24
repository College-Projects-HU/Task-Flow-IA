namespace TaskFlow.Models
{
    public class Attachment
    {
        public int Id { get; set; }

        public int TaskId { get; set; }
        public TaskItem Task { get; set; }

        public int UploadedByUserId { get; set; }

        public string FileName { get; set; }
        public string FilePath { get; set; }
        public long FileSize { get; set; }

        public DateTime UploadedAt { get; set; }
    }
}