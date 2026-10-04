using ClientProjectTracker.Models;

namespace ClientProjectTracker.Data;

public static class DbInitializer
{
    // Creates the database/tables if missing and adds sample data the first time.
    public static void Initialize(AppDbContext db)
    {
        db.Database.EnsureCreated();
        if (db.Projects.Any()) return;

        var today = DateOnly.FromDateTime(DateTime.Today);
        db.Projects.AddRange(
            new Project { ClientName = "Harbor & Pine", ProjectName = "Brand refresh", Description = "New logo, palette and brand guidelines.",
                          Status = "In Progress", Priority = "High", StartDate = today.AddDays(-14), DueDate = today.AddDays(21) },
            new Project { ClientName = "Northwind Co.", ProjectName = "E-commerce relaunch", Description = "Migrate storefront and redesign checkout.",
                          Status = "Planning", Priority = "Medium", StartDate = today.AddDays(7), DueDate = today.AddDays(90) },
            new Project { ClientName = "Lumen Health", ProjectName = "Campaign microsite", Description = "Landing pages for the spring awareness campaign.",
                          Status = "Completed", Priority = "Low", StartDate = today.AddDays(-60), DueDate = today.AddDays(-10) });
        db.SaveChanges();
    }
}
