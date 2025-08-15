using Microsoft.AspNetCore.Mvc;
using DeShawnsAPI.Models;

namespace DeShawnsAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class WalkerController : ControllerBase
    {
        // Shared data (in a real app, this would be in a database or service)
        private static List<City> _cities = new List<City>
        {
            new City { Id = 1, Name = "Nashville" },
            new City { Id = 2, Name = "Memphis" },
            new City { Id = 3, Name = "Knoxville" }
        };

        private static List<Walker> _walkers = new List<Walker>
        {
            new Walker { Id = 1, Name = "Sarah Johnson" },
            new Walker { Id = 2, Name = "Mike Davis" },
            new Walker { Id = 3, Name = "Jessica Lee" }
        };

        // Junction table data - represents which cities each walker works in
        private static List<WalkerCity> _walkerCities = new List<WalkerCity>
        {
            new WalkerCity { Id = 1, WalkerId = 1, CityId = 1 }, // Sarah -> Nashville
            new WalkerCity { Id = 2, WalkerId = 1, CityId = 2 }, // Sarah -> Memphis
            new WalkerCity { Id = 3, WalkerId = 2, CityId = 3 }, // Mike -> Knoxville
            new WalkerCity { Id = 4, WalkerId = 3, CityId = 1 }, // Jessica -> Nashville
            new WalkerCity { Id = 5, WalkerId = 3, CityId = 2 }, // Jessica -> Memphis
            new WalkerCity { Id = 6, WalkerId = 3, CityId = 3 }  // Jessica -> Knoxville
        };

        private static List<Dog> _dogs = new List<Dog>
        {
            new Dog { Id = 1, Name = "Buddy", CityId = 1, WalkerId = 1 },
            new Dog { Id = 2, Name = "Max", CityId = 2, WalkerId = null },
            new Dog { Id = 3, Name = "Luna", CityId = 3, WalkerId = 2 }
        };

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
            var walker = _walkers.FirstOrDefault(w => w.Id == id);
            if (walker == null)
            {
                return NotFound();
            }

            // Populate cities for this walker
            walker.Cities = GetCitiesForWalker(id);

            return Ok(walker);
        }

        // GET /api/walker/{id}/available-dogs
        [HttpGet("{id}/available-dogs")]
        public ActionResult<List<Dog>> GetAvailableDogsForWalker(int id)
        {
            var walker = _walkers.FirstOrDefault(w => w.Id == id);
            if (walker == null)
            {
                return NotFound("Walker not found");
            }

            // Get cities this walker works in
            var walkerCityIds = _walkerCities
                .Where(wc => wc.WalkerId == id)
                .Select(wc => wc.CityId)
                .ToList();

            // Get dogs that are:
            // 1. In cities where this walker works
            // 2. Not already assigned to this walker
            var availableDogs = _dogs
                .Where(d => walkerCityIds.Contains(d.CityId) && d.WalkerId != id)
                .Select(dog => new Dog
                {
                    Id = dog.Id,
                    Name = dog.Name,
                    CityId = dog.CityId,
                    WalkerId = dog.WalkerId,
                    City = _cities.FirstOrDefault(c => c.Id == dog.CityId),
                    Walker = dog.WalkerId.HasValue ? _walkers.FirstOrDefault(w => w.Id == dog.WalkerId.Value) : null
                })
                .ToList();

            return Ok(availableDogs);
        }
        
                // PUT /api/walker/{id}
        [HttpPut("{id}")]
        public ActionResult<Walker> UpdateWalker(int id, [FromBody] Walker updatedWalker)
        {
            var existingWalker = _walkers.FirstOrDefault(w => w.Id == id);
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
                    .Where(c => !_cities.Any(city => city.Id == c.Id))
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
            _walkerCities = _walkerCities.Where(wc => wc.WalkerId != id).ToList();

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
                    newWC.Id = _walkerCities.Count > 0 ? _walkerCities.Max(wc => wc.Id) + 1 : 1;
                    _walkerCities.Add(newWC);
                }
            }

            // Return walker with updated cities
            existingWalker.Cities = GetCitiesForWalker(id);

            return Ok(existingWalker);
         }

        // DELETE /api/walker/{id}
        [HttpDelete("{id}")]
        public ActionResult DeleteWalker(int id)
        {
            var walker = _walkers.FirstOrDefault(w => w.Id == id);
            if (walker == null)
            {
                return NotFound();
            }

            // Remove walker
            _walkers.Remove(walker);

            // Remove all walker-city relationships
            _walkerCities.RemoveAll(wc => wc.WalkerId == id);

            // Unassign all dogs from this walker
            foreach (var dog in _dogs.Where(d => d.WalkerId == id))
            {
                dog.WalkerId = null;
            }

            return NoContent();
        }

        // Helper methods
        private List<Walker> GetWalkersWithCities()
        {
            return _walkers.Select(walker => new Walker
            {
                Id = walker.Id,
                Name = walker.Name,
                Cities = GetCitiesForWalker(walker.Id)
            }).ToList();
        }

        private List<City> GetCitiesForWalker(int walkerId)
        {
            var walkerCityIds = _walkerCities
                .Where(wc => wc.WalkerId == walkerId)
                .Select(wc => wc.CityId)
                .ToList();

            return _cities
                .Where(c => walkerCityIds.Contains(c.Id))
                .ToList();
        }
    }
}
