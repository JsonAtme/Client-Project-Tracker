namespace ClientProjectTracker.Models;

// Incoming payload: everything is a string so bad values produce
// field-level validation messages instead of a generic deserialization error.
public record ProjectRequest(
    string? ClientName,
    string? ProjectName,
    string? Description,
    string? Status,
    string? Priority,
    string? StartDate,
    string? DueDate);
