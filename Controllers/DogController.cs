using Microsoft.AspNetCore.Mvc;
using DeShawnsAPI.Models;
using DeShawnsAPI.Services;

namespace DeShawnsAPI.Controllers
{
  [ApiController]
  [Route("api/[controller]")]
  public class DogController : ControllerBase
  {
    private readonly DataService _dataService = DataService.Instance;

    // GET /api/dog
    [HttpGet]
    public ActionResult<List<Dog>> GetDogs()
    {
      // Populate navigation properties
      var dogsWithDetails = _dataService.Dogs.Select(dog => new Dog
      {
        Id = dog.Id,
        Name = dog.Name,
        CityId = dog.CityId,
        WalkerId = dog.WalkerId,
        City = _dataService.Cities.FirstOrDefault(c => c.Id == dog.CityId),
        Walker = dog.WalkerId.HasValue ? _dataService.Walkers.FirstOrDefault(w => w.Id == dog.WalkerId.Value) : null
      }).ToList();

      return Ok(dogsWithDetails);
    }

    // GET /api/dog/{id}
    [HttpGet("{id}")]
    public ActionResult<Dog> GetDog(int id)
    {
      var dog = _dataService.Dogs.FirstOrDefault(d => d.Id == id);
      if (dog == null)
      {
        return NotFound();
      }

      // Populate navigation properties
      dog.City = _dataService.Cities.FirstOrDefault(c => c.Id == dog.CityId);
      dog.Walker = dog.WalkerId.HasValue ? _dataService.Walkers.FirstOrDefault(w => w.Id == dog.WalkerId.Value) : null;

      return Ok(dog);
    }

    // GET /api/dog/{id}/available-walkers
    [HttpGet("{id}/available-walkers")]
    public ActionResult<List<Walker>> GetAvailableWalkersForDog(int id)
    {
      var dog = _dataService.Dogs.FirstOrDefault(d => d.Id == id);
      if (dog == null)
      {
        return NotFound("Dog not found");
      }

      // Get walkers who work in this dog's city
      var availableWalkerIds = _dataService.WalkerCities
          .Where(wc => wc.CityId == dog.CityId)
          .Select(wc => wc.WalkerId)
          .ToList();

      var availableWalkers = _dataService.Walkers
          .Where(w => availableWalkerIds.Contains(w.Id))
          .Select(walker => new Walker
          {
            Id = walker.Id,
            Name = walker.Name,
            Cities = _dataService.GetCitiesForWalker(walker.Id)
          })
          .ToList();

      return Ok(availableWalkers);
    }

    // POST /api/dog
    [HttpPost]
    public ActionResult<Dog> CreateDog([FromBody] Dog newDog)
    {
      // Validation
      if (string.IsNullOrWhiteSpace(newDog.Name))
      {
        return BadRequest("Dog name is required");
      }

      if (!_dataService.Cities.Any(c => c.Id == newDog.CityId))
      {
        return BadRequest("Invalid city ID");
      }

      if (newDog.WalkerId.HasValue && !_dataService.Walkers.Any(w => w.Id == newDog.WalkerId.Value))
      {
        return BadRequest("Invalid walker ID");
      }

      // Generate new ID
      newDog.Id = _dataService.GetNextDogId();

      _dataService.Dogs.Add(newDog);

      // Return dog with populated navigation properties
      newDog.City = _dataService.Cities.FirstOrDefault(c => c.Id == newDog.CityId);
      newDog.Walker = newDog.WalkerId.HasValue ? _dataService.Walkers.FirstOrDefault(w => w.Id == newDog.WalkerId.Value) : null;

      return CreatedAtAction(nameof(GetDog), new { id = newDog.Id }, newDog);
    }

    // PUT /api/dog/{id}
    [HttpPut("{id}")]
    public ActionResult<Dog> UpdateDog(int id, [FromBody] Dog updatedDog)
    {
      var existingDog = _dataService.Dogs.FirstOrDefault(d => d.Id == id);
      if (existingDog == null)
      {
        return NotFound();
      }

      // Validation
      if (string.IsNullOrWhiteSpace(updatedDog.Name))
      {
        return BadRequest("Dog name is required");
      }

      if (!_dataService.Cities.Any(c => c.Id == updatedDog.CityId))
      {
        return BadRequest("Invalid city ID");
      }

      if (updatedDog.WalkerId.HasValue && !_dataService.Walkers.Any(w => w.Id == updatedDog.WalkerId.Value))
      {
        return BadRequest("Invalid walker ID");
      }

      // Update properties
      existingDog.Name = updatedDog.Name;
      existingDog.CityId = updatedDog.CityId;
      existingDog.WalkerId = updatedDog.WalkerId;

      // Populate navigation properties for response
      existingDog.City = _dataService.Cities.FirstOrDefault(c => c.Id == existingDog.CityId);
      existingDog.Walker = existingDog.WalkerId.HasValue ? _dataService.Walkers.FirstOrDefault(w => w.Id == existingDog.WalkerId.Value) : null;

      return Ok(existingDog);
    }

    // DELETE /api/dog/{id}
    [HttpDelete("{id}")]
    public ActionResult DeleteDog(int id)
    {
      var dog = _dataService.Dogs.FirstOrDefault(d => d.Id == id);
      if (dog == null)
      {
        return NotFound();
      }

      _dataService.Dogs.Remove(dog);
      return NoContent();
    }

    // PUT /api/dog/{id}/walker - Assign walker to dog
    [HttpPut("{id}/walker")]
    public ActionResult<Dog> AssignWalker(int id, [FromBody] AssignWalkerRequest request)
    {
      var dog = _dataService.Dogs.FirstOrDefault(d => d.Id == id);
      if (dog == null)
      {
        return NotFound("Dog not found");
      }

      // If assigning a walker (not null), validate business rules
      if (request.WalkerId.HasValue)
      {
        var walker = _dataService.Walkers.FirstOrDefault(w => w.Id == request.WalkerId.Value);
        if (walker == null)
        {
          return BadRequest("Walker not found");
        }

        // Check if walker works in the dog's city
        var walkerCityIds = _dataService.WalkerCities
            .Where(wc => wc.WalkerId == request.WalkerId.Value)
            .Select(wc => wc.CityId)
            .ToList();

        if (!walkerCityIds.Contains(dog.CityId))
        {
          var dogCity = _dataService.Cities.FirstOrDefault(c => c.Id == dog.CityId);
          var walkerCities = _dataService.Cities.Where(c => walkerCityIds.Contains(c.Id)).Select(c => c.Name);
          return BadRequest($"Walker {walker.Name} does not work in {dogCity?.Name}. " +
                          $"Walker works in: {string.Join(", ", walkerCities)}");
        }
      }

      dog.WalkerId = request.WalkerId;

      // Populate navigation properties for response
      dog.City = _dataService.Cities.FirstOrDefault(c => c.Id == dog.CityId);
      dog.Walker = dog.WalkerId.HasValue ? _dataService.Walkers.FirstOrDefault(w => w.Id == dog.WalkerId.Value) : null;

      return Ok(dog);
    }
  }

  // Request model for walker assignment
  public class AssignWalkerRequest
  {
    public int? WalkerId { get; set; }
  }
}
