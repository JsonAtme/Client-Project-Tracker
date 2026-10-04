using ClientProjectTracker.Data;
using ClientProjectTracker.Models;
using ClientProjectTracker.Validation;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace ClientProjectTracker.Controllers;

[ApiController]
[Route("projects")]
public class ProjectsController(AppDbContext db) : ControllerBase
{
    // GET /projects
    [HttpGet]
    public async Task<ActionResult<List<Project>>> GetAll() =>
        await db.Projects.AsNoTracking().OrderBy(p => p.Id).ToListAsync();

    // GET /projects/{id}
    [HttpGet("{id:int}")]
    public async Task<ActionResult<Project>> Get(int id)
    {
        var project = await db.Projects.AsNoTracking().FirstOrDefaultAsync(p => p.Id == id);
        if (project is null) return NotFoundProblem(id);
        return project;
    }

    // POST /projects
    [HttpPost]
    public async Task<ActionResult<Project>> Create(ProjectRequest request)
    {
        var (project, errors) = ProjectValidator.Validate(request);
        if (project is null) return ValidationProblem(new ValidationProblemDetails(errors));

        db.Projects.Add(project);
        await db.SaveChangesAsync();
        return CreatedAtAction(nameof(Get), new { id = project.Id }, project);
    }

    // PUT /projects/{id}
    [HttpPut("{id:int}")]
    public async Task<ActionResult<Project>> Update(int id, ProjectRequest request)
    {
        var existing = await db.Projects.FindAsync(id);
        if (existing is null) return NotFoundProblem(id);

        var (project, errors) = ProjectValidator.Validate(request);
        if (project is null) return ValidationProblem(new ValidationProblemDetails(errors));

        existing.Apply(project);
        await db.SaveChangesAsync();
        return existing;
    }

    // DELETE /projects/{id}
    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        var deleted = await db.Projects.Where(p => p.Id == id).ExecuteDeleteAsync();
        return deleted > 0 ? NoContent() : NotFoundProblem(id);
    }

    private ObjectResult NotFoundProblem(int id) =>
        NotFound(new ProblemDetails
        {
            Title = "Project not found",
            Detail = $"No project exists with id {id}.",
            Status = StatusCodes.Status404NotFound
        });
}
