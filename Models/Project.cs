namespace ClientProjectTracker.Models;

public class Project
{
    public static readonly string[] Statuses = ["Planning", "In Progress", "On Hold", "Completed"];
    public static readonly string[] Priorities = ["Low", "Medium", "High"];

    public int Id { get; set; }
    public string ClientName { get; set; } = "";
    public string ProjectName { get; set; } = "";
    public string? Description { get; set; }
    public string Status { get; set; } = "Planning";
    public string Priority { get; set; } = "Medium";
    public DateOnly StartDate { get; set; }
    public DateOnly DueDate { get; set; }

    public void Apply(Project other)
    {
        ClientName = other.ClientName;
        ProjectName = other.ProjectName;
        Description = other.Description;
        Status = other.Status;
        Priority = other.Priority;
        StartDate = other.StartDate;
        DueDate = other.DueDate;
    }
}
