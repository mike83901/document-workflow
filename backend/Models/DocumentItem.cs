namespace Example.DocumentApproval.Api.Models;

public enum DocumentStatus
{
    Pending,
    Approved,
    Rejected
}

public sealed record DocumentItem(
    Guid Id,
    string DocumentNumber,
    string Title,
    string Category,
    string SubmittedBy,
    DateTimeOffset SubmittedAt,
    DocumentStatus Status,
    string? DecisionReason,
    DateTimeOffset? DecisionAt);

public sealed record DecisionRequest(DocumentStatus Status, string Reason);