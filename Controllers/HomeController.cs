using Microsoft.AspNetCore.Mvc;

namespace ClientProjectTracker.Controllers;

// Serves the page (the View). The page then talks to ProjectsController via fetch().
public class HomeController : Controller
{
    public IActionResult Index() => View();
}
