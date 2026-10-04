using System.Globalization;
using ClientProjectTracker.Models;

namespace ClientProjectTracker.Validation;

public static class ProjectValidator
{
    public static (Project? Project, Dictionary<string, string[]> Errors) Validate(ProjectRequest r)
    {
        var errors = new Dictionary<string, string[]>();

        var client = r.ClientName?.Trim();
        var name = r.ProjectName?.Trim();
        var description = r.Description?.Trim();

        if (string.IsNullOrEmpty(client))
            errors["clientName"] = ["Client name is required."];
        else if (client.Length > 100)
            errors["clientName"] = ["Client name must be 100 characters or fewer."];

        if (string.IsNullOrEmpty(name))
            errors["projectName"] = ["Project name is required."];
        else if (name.Length > 150)
            errors["projectName"] = ["Project name must be 150 characters or fewer."];

        if (description is { Length: > 2000 })
            errors["description"] = ["Description must be 2000 characters or fewer."];

        var status = Lookup(Project.Statuses, r.Status);
        if (status is null)
            errors["status"] = [$"Status must be one of: {string.Join(", ", Project.Statuses)}."];

        var priority = Lookup(Project.Priorities, r.Priority);
        if (priority is null)
            errors["priority"] = [$"Priority must be one of: {string.Join(", ", Project.Priorities)}."];

        var start = ParseDate(r.StartDate, "startDate", "Start date", errors);
        var due = ParseDate(r.DueDate, "dueDate", "Due date", errors);

        if (start is not null && due is not null && due < start)
            errors["dueDate"] = ["Due date cannot be earlier than the start date."];

        if (errors.Count > 0) return (null, errors);

        return (new Project
        {
            ClientName = client!, ProjectName = name!, Description = description,
            Status = status!, Priority = priority!, StartDate = start!.Value, DueDate = due!.Value
        }, errors);
    }

    // Case-insensitive match that returns the canonical spelling ("in progress" -> "In Progress").
    private static string? Lookup(string[] allowed, string? value) =>
        allowed.FirstOrDefault(a => a.Equals(value?.Trim(), StringComparison.OrdinalIgnoreCase));

    private static DateOnly? ParseDate(string? value, string key, string label, Dictionary<string, string[]> errors)
    {
        if (string.IsNullOrWhiteSpace(value))
        {
            errors[key] = [$"{label} is required."];
            return null;
        }
        if (DateOnly.TryParseExact(value.Trim(), "yyyy-MM-dd", CultureInfo.InvariantCulture, DateTimeStyles.None, out var date))
            return date;

        errors[key] = [$"{label} must be a valid date in yyyy-MM-dd format."];
        return null;
    }
}
