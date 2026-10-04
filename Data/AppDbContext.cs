using ClientProjectTracker.Models;
using Microsoft.EntityFrameworkCore;

namespace ClientProjectTracker.Data;

public class AppDbContext(DbContextOptions<AppDbContext> options) : DbContext(options)
{
    public DbSet<Project> Projects => Set<Project>();
}
