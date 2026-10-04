using ClientProjectTracker.Data;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

// SQLite file lives next to Program.cs and is created on first run.
var dbPath = Path.Combine(builder.Environment.ContentRootPath, "projects.db");
builder.Services.AddDbContext<AppDbContext>(o => o.UseSqlite($"Data Source={dbPath}"));
builder.Services.AddControllersWithViews();
builder.Services.AddProblemDetails();

var app = builder.Build();

using (var scope = app.Services.CreateScope())
    DbInitializer.Initialize(scope.ServiceProvider.GetRequiredService<AppDbContext>());

Console.WriteLine($"Database file: {dbPath}");

app.UseExceptionHandler();   // unexpected errors -> JSON problem response
app.UseStatusCodePages();    // bare 404/405 etc. -> JSON problem response
app.UseStaticFiles();

app.MapControllers();              // /projects API (attribute routes)
app.MapDefaultControllerRoute();   // "/" -> HomeController.Index -> Views/Home/Index.cshtml

app.Run();
