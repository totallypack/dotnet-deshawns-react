using Microsoft.AspNetCore.Mvc;
using DeShawnsAPI.Models;

namespace DeShawnsAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class CityController : ControllerBase
    {
        // In-memory data for now (you can replace with database later)
        private static List<City> _cities = new List<City>
        {
            new City { Id = 1, Name = "Nashville" },
            new City { Id = 2, Name = "Memphis" },
            new City { Id = 3, Name = "Knoxville" }
        };

        // GET /api/city
        [HttpGet]
        public ActionResult<List<City>> GetCities()
        {
            return Ok(_cities);
        }

        // GET /api/city/{id}
        [HttpGet("{id}")]
        public ActionResult<City> GetCity(int id)
        {
            var city = _cities.FirstOrDefault(c => c.Id == id);
            if (city == null)
            {
                return NotFound();
            }
            return Ok(city);
        }

        // POST /api/city
        [HttpPost]
        public ActionResult<City> CreateCity([FromBody] City newCity)
        {
            if (string.IsNullOrWhiteSpace(newCity.Name))
            {
                return BadRequest("City name is required");
            }

            // Check if city already exists
            if (_cities.Any(c => c.Name.ToLower() == newCity.Name.ToLower()))
            {
                return BadRequest("City already exists");
            }

            // Generate new ID
            newCity.Id = _cities.Count > 0 ? _cities.Max(c => c.Id) + 1 : 1;
            
            _cities.Add(newCity);
            
            return CreatedAtAction(nameof(GetCity), new { id = newCity.Id }, newCity);
        }

        // DELETE /api/city/{id} (optional - not in user stories but useful)
        [HttpDelete("{id}")]
        public ActionResult DeleteCity(int id)
        {
            var city = _cities.FirstOrDefault(c => c.Id == id);
            if (city == null)
            {
                return NotFound();
            }

            _cities.Remove(city);
            return NoContent();
        }
    }
}
