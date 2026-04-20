namespace TaskFlow.DTOs
{
    public class StatsDto
    {
        public int TotalTasks { get; set; }
        public int CompletedTasks { get; set; }
        public int InProgressTasks { get; set; }

        public List<MemberStatsDto> PerMember { get; set; }
    }

    public class MemberStatsDto
    {
        public string MemberName { get; set; }
        public int CompletedTasks { get; set; }
    }

}
