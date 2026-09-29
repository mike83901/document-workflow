using Example.DocumentApproval.Api.Models;
using Microsoft.AspNetCore.Mvc;

namespace Example.DocumentApproval.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public sealed class DocumentsController(DocumentStore store) : ControllerBase
{
    [HttpGet]
    public ActionResult<IReadOnlyList<DocumentItem>> GetAll() => Ok(store.GetAll());

    [HttpPost("{id:guid}/decision")]
    public ActionResult<DocumentItem> Decide(Guid id, DecisionRequest request)
    {
        if (request.Status is not (DocumentStatus.Approved or DocumentStatus.Rejected))
        {
            return BadRequest(new { message = "Choose Approved or Rejected." });
        }

        if (string.IsNullOrWhiteSpace(request.Reason))
        {
            return BadRequest(new { message = "A decision reason is required." });
        }

        var updated = store.Decide(id, request.Status, request.Reason);
        return updated is null
            ? Conflict(new { message = "The document is missing or has already been decided." })
            : Ok(updated);
    }
}