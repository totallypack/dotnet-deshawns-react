using Microsoft.AspNetCore.Mvc;
using DeShawnsAPI.Models;

namespace DeShawnsAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class DogController : ControllerBase
    {
        // In-memory data (we'll use the same cities from CityController)
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

        private static List<Dog> _dogs = new List<Dog>
        {
            new Dog { Id = 1, Name = "Buddy", CityId = 1, WalkerId = 1 },
            new Dog { Id = 2, Name = "Max", CityId = 2, WalkerId = null },
            new Dog { Id = 3, Name = "Luna", CityId = 3, WalkerId = 2 }
        };

        // GET /api/dog
        [HttpGet]
        public ActionResult<List<Dog>> GetDogs()
        {
            // Populate navigation properties
            var dogsWithDetails = _dogs.Select(dog => new Dog
            {
                Id = dog.Id,
                Name = dog.Name,
                CityId = dog.CityId,
                WalkerId = dog.WalkerId,
                City = _cities.FirstOrDefault(c => c.Id == dog.CityId),
                Walker = dog.WalkerId.HasValue ? _walkers.FirstOrDefault(w => w.Id == dog.WalkerId.Value) : null
            }).ToList();

            return Ok(dogsWithDetails);
        }

        // GET /api/dog/{id}
        [HttpGet("{id}")]
        public ActionResult<Dog> GetDog(int id)
        {
            var dog = _dogs.FirstOrDefault(d => d.Id == id);
            if (dog == null)
            {
                return NotFound();
            }

            // Populate navigation properties
            dog.City = _cities.FirstOrDefault(c => c.Id == dog.CityId);
            dog.Walker = dog.WalkerId.HasValue ? _walkers.FirstOrDefault(w => w.Id == dog.WalkerId.Value) : null;

            return Ok(dog);
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

            if (!_cities.Any(c => c.Id == newDog.CityId))
            {
                return BadRequest("Invalid city ID");
            }

            if (newDog.WalkerId.HasValue && !_walkers.Any(w => w.Id == newDog.WalkerId.Value))
            {
                return BadRequest("Invalid walker ID");
            }

            // Generate new ID
            newDog.Id = _dogs.Count > 0 ? _dogs.Max(d => d.Id) + 1 : 1;
            
            _dogs.Add(newDog);

            // Return dog with populated navigation properties
            newDog.City = _cities.FirstOrDefault(c => c.Id == newDog.CityId);
            newDog.Walker = newDog.WalkerId.HasValue ? _walkers.FirstOrDefault(w => w.Id == newDog.WalkerId.Value) : null;
            
            return CreatedAtAction(nameof(GetDog), new { id = newDog.Id }, newDog);
        }

        // PUT /api/dog/{id}
        [HttpPut("{id}")]
        public ActionResult<Dog> UpdateDog(int id, [FromBody] Dog updatedDog)
        {
            var existingDog = _dogs.FirstOrDefault(d => d.Id == id);
            if (existingDog == null)
            {
                return NotFound();
            }

            // Validation
            if (string.IsNullOrWhiteSpace(updatedDog.Name))
            {
                return BadRequest("Dog name is required");
            }

            if (!_cities.Any(c => c.Id == updatedDog.CityId))
            {
                return BadRequest("Invalid city ID");
            }

            if (updatedDog.WalkerId.HasValue && !_walkers.Any(w => w.Id == updatedDog.WalkerId.Value))
            {
                return BadRequest("Invalid walker ID");
            }

            // Update properties
            existingDog.Name = updatedDog.Name;
            existingDog.CityId = updatedDog.CityId;
            existingDog.WalkerId = updatedDog.WalkerId;

            // Populate navigation properties for response
            existingDog.City = _cities.FirstOrDefault(c => c.Id == existingDog.CityId);
            existingDog.Walker = existingDog.WalkerId.HasValue ? _walkers.FirstOrDefault(w => w.Id == existingDog.WalkerId.Value) : null;

            return Ok(existingDog);
        }

        // DELETE /api/dog/{id}
        [HttpDelete("{id}")]
        public ActionResult DeleteDog(int id)
        {
            var dog = _dogs.FirstOrDefault(d => d.Id == id);
            if (dog == null)
            {
                return NotFound();
            }

            _dogs.Remove(dog);
            return NoContent();
        }

        // PUT /api/dog/{id}/walker - Assign walker to dog
        [HttpPut("{id}/walker")]
        public ActionResult<Dog> AssignWalker(int id, [FromBody] AssignWalkerRequest request)
        {
            var dog = _dogs.FirstOrDefault(d => d.Id == id);
            if (dog == null)
            {
                return NotFound("Dog not found");
            }

            if (request.WalkerId.HasValue && !_walkers.Any(w => w.Id == request.WalkerId.Value))
            {
                return BadRequest("Invalid walker ID");
            }

            dog.WalkerId = request.WalkerId;

            // Populate navigation properties for response
            dog.City = _cities.FirstOrDefault(c => c.Id == dog.CityId);
            dog.Walker = dog.WalkerId.HasValue ? _walkers.FirstOrDefault(w => w.Id == dog.WalkerId.Value) : null;

            return Ok(dog);
        }
    }

    // Request model for walker assignment
    public class AssignWalkerRequest
    {
        public int? WalkerId { get; set; }
    }
}
