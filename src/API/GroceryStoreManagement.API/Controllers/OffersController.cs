using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using GroceryStoreManagement.Application.Commands.Offers;
using GroceryStoreManagement.Application.Queries.Offers;

namespace GroceryStoreManagement.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Admin,Staff")]
public class OffersController : ControllerBase
{
    private readonly IMediator _mediator;
    private readonly ILogger<OffersController> _logger;

    public OffersController(IMediator mediator, ILogger<OffersController> logger)
    {
        _mediator = mediator;
        _logger = logger;
    }

    [HttpGet]
    public async Task<ActionResult<List<Application.DTOs.OfferDto>>> GetOffers(
        [FromQuery] bool? isActive = null,
        [FromQuery] bool? isValid = null,
        [FromQuery] Guid? productId = null,
        [FromQuery] Guid? categoryId = null)
    {
        var query = new GetOffersQuery
        {
            IsActive = isActive,
            IsValid = isValid,
            ProductId = productId,
            CategoryId = categoryId
        };
        var offers = await _mediator.Send(query);
        return Ok(offers);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<Application.DTOs.OfferDto>> GetOffer(Guid id)
    {
        var query = new GetOfferByIdQuery { Id = id };
        var offer = await _mediator.Send(query);
        
        if (offer == null)
            return NotFound();

        return Ok(offer);
    }

    [HttpPost]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<Application.DTOs.OfferDto>> CreateOffer([FromBody] CreateOfferCommand command)
    {
        var offer = await _mediator.Send(command);
        return CreatedAtAction(nameof(GetOffer), new { id = offer.Id }, offer);
    }

    [HttpPut("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<Application.DTOs.OfferDto>> UpdateOffer(Guid id, [FromBody] UpdateOfferCommand command)
    {
        if (id != command.Id)
            return BadRequest("ID mismatch");

        var offer = await _mediator.Send(command);
        return Ok(offer);
    }

    [HttpDelete("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult> DeleteOffer(Guid id)
    {
        var command = new DeleteOfferCommand { Id = id };
        await _mediator.Send(command);
        return NoContent();
    }
}

