namespace TaskFlow.Models
{
    public class Attachment
    {
        public int Id { get; set; }
        public string FilePath { get; set; }
        public int TaskId { get; set; }
    }
}
