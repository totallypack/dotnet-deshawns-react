using Microsoft.AspNetCore.Mvc;
using DeShawnsAPI.Models;
using DeShawnsAPI.Services;

namespace DeShawnsAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class CityController : ControllerBase
    {
        private readonly DataService _dataService = DataService.Instance;

        // GET /api/city
        [HttpGet]
        public ActionResult<List<City>> GetCities()
        {
            return Ok(_dataService.Cities);
        }

        // GET /api/city/{id}
        [HttpGet("{id}")]
        public ActionResult<City> GetCity(int id)
        {
            var city = _dataService.Cities.FirstOrDefault(c => c.Id == id);
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
            if (_dataService.Cities.Any(c => c.Name.ToLower() == newCity.Name.ToLower()))
            {
                return BadRequest("City already exists");
            }

            // Generate new ID
            newCity.Id = _dataService.GetNextCityId();
            
            _dataService.Cities.Add(newCity);
            
            return CreatedAtAction(nameof(GetCity), new { id = newCity.Id }, newCity);
        }

        // DELETE /api/city/{id}
        [HttpDelete("{id}")]
        public ActionResult DeleteCity(int id)
        {
            var city = _dataService.Cities.FirstOrDefault(c => c.Id == id);
            if (city == null)
            {
                return NotFound();
            }

            _dataService.Cities.Remove(city);
            return NoContent();
        }
    }
}
