using Microsoft.AspNetCore.Mvc;

namespace RunTribe.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class MessageController : ControllerBase
{
    [HttpGet]
    public IActionResult GetMessage()
    {
        return Ok("Hello from Run Tribe API! The backend is working correctly.");
    }
} 