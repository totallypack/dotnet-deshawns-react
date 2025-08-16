using Microsoft.AspNetCore.Mvc;
using DeShawnsAPI.Models;
using DeShawnsAPI.Services;

namespace DeShawnsAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class WalkerController : ControllerBase
    {
        private readonly DataService _dataService = DataService.Instance;

        // GET /api/walker
        [HttpGet]
        public ActionResult<List<Walker>> GetWalkers([FromQuery] int? cityId = null)
        {
            var walkersWithCities = GetWalkersWithCities();

            // Filter by city if specified
            if (cityId.HasValue)
            {
                walkersWithCities = walkersWithCities
                    .Where(w => w.Cities.Any(c => c.Id == cityId.Value))
                    .ToList();
            }

            return Ok(walkersWithCities);
        }

        // GET /api/walker/{id}
        [HttpGet("{id}")]
        public ActionResult<Walker> GetWalker(int id)
        {
            var walker = _dataService.Walkers.FirstOrDefault(w => w.Id == id);
            if (walker == null)
            {
                return NotFound();
            }

            // Populate cities for this walker
            walker.Cities = _dataService.GetCitiesForWalker(id);

            return Ok(walker);
        }

        // GET /api/walker/{id}/available-dogs
        [HttpGet("{id}/available-dogs")]
        public ActionResult<List<Dog>> GetAvailableDogsForWalker(int id)
        {
            var walker = _dataService.Walkers.FirstOrDefault(w => w.Id == id);
            if (walker == null)
            {
                return NotFound("Walker not found");
            }

            // Get cities this walker works in
            var walkerCityIds = _dataService.WalkerCities
                .Where(wc => wc.WalkerId == id)
                .Select(wc => wc.CityId)
                .ToList();

            // Get dogs that are:
            // 1. In cities where this walker works
            // 2. Not already assigned to this walker
            var availableDogs = _dataService.Dogs
                .Where(d => walkerCityIds.Contains(d.CityId) && d.WalkerId != id)
                .Select(dog => new Dog
                {
                    Id = dog.Id,
                    Name = dog.Name,
                    CityId = dog.CityId,
                    WalkerId = dog.WalkerId,
                    City = _dataService.Cities.FirstOrDefault(c => c.Id == dog.CityId),
                    Walker = dog.WalkerId.HasValue ? _dataService.Walkers.FirstOrDefault(w => w.Id == dog.WalkerId.Value) : null
                })
                .ToList();

            return Ok(availableDogs);
        }

        // PUT /api/walker/{id}
        [HttpPut("{id}")]
        public ActionResult<Walker> UpdateWalker(int id, [FromBody] Walker updatedWalker)
        {
            var existingWalker = _dataService.Walkers.FirstOrDefault(w => w.Id == id);
            if (existingWalker == null)
            {
                return NotFound();
            }

            // Validation
            if (string.IsNullOrWhiteSpace(updatedWalker.Name))
            {
                return BadRequest("Walker name is required");
            }

            // Validate that all city IDs exist
            if (updatedWalker.Cities != null)
            {
                var invalidCityIds = updatedWalker.Cities
                    .Where(c => !_dataService.Cities.Any(city => city.Id == c.Id))
                    .Select(c => c.Id)
                    .ToList();

                if (invalidCityIds.Any())
                {
                    return BadRequest($"Invalid city IDs: {string.Join(", ", invalidCityIds)}");
                }
            }

            // Update walker name
            existingWalker.Name = updatedWalker.Name;

            // Update walker-city relationships (implementing Part 3 logic)
            // Step 1: Remove current WalkerCity items associated with the walker
            _dataService.WalkerCities.RemoveAll(wc => wc.WalkerId == id);

            // Step 2: Add new WalkerCity items for each city in the updated walker
            if (updatedWalker.Cities != null)
            {
                foreach (City city in updatedWalker.Cities)
                {
                    WalkerCity newWC = new WalkerCity
                    {
                        WalkerId = id,
                        CityId = city.Id
                    };
                    newWC.Id = _dataService.GetNextWalkerCityId();
                    _dataService.WalkerCities.Add(newWC);
                }
            }

            // Return walker with updated cities
            existingWalker.Cities = _dataService.GetCitiesForWalker(id);

            return Ok(existingWalker);
        }

        // DELETE /api/walker/{id}
        [HttpDelete("{id}")]
        public ActionResult DeleteWalker(int id)
        {
            var walker = _dataService.Walkers.FirstOrDefault(w => w.Id == id);
            if (walker == null)
            {
                return NotFound();
            }

            // Remove walker
            _dataService.Walkers.Remove(walker);

            // Remove all walker-city relationships
            _dataService.WalkerCities.RemoveAll(wc => wc.WalkerId == id);

            // Unassign all dogs from this walker
            foreach (var dog in _dataService.Dogs.Where(d => d.WalkerId == id))
            {
                dog.WalkerId = null;
            }

            return NoContent();
        }

        // Helper methods
        private List<Walker> GetWalkersWithCities()
        {
            return _dataService.Walkers.Select(walker => new Walker
            {
                Id = walker.Id,
                Name = walker.Name,
                Cities = _dataService.GetCitiesForWalker(walker.Id)
            }).ToList();
        }
    }
}
