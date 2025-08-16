using DeShawnsAPI.Models;

namespace DeShawnsAPI.Services
{
    public class DataService
    {
        private static readonly DataService _instance = new DataService();
        public static DataService Instance => _instance;

        private DataService() 
        {
            // Initialize data only once
        }

        // Shared data - all controllers use these same instances
        public List<City> Cities { get; set; } = new List<City>
        {
            new City { Id = 1, Name = "Nashville" },
            new City { Id = 2, Name = "Memphis" },
            new City { Id = 3, Name = "Knoxville" }
        };

        public List<Walker> Walkers { get; set; } = new List<Walker>
        {
            new Walker { Id = 1, Name = "Sarah Johnson" },
            new Walker { Id = 2, Name = "Mike Davis" },
            new Walker { Id = 3, Name = "Jessica Lee" }
        };

        public List<WalkerCity> WalkerCities { get; set; } = new List<WalkerCity>
        {
            new WalkerCity { Id = 1, WalkerId = 1, CityId = 1 }, // Sarah -> Nashville
            new WalkerCity { Id = 2, WalkerId = 1, CityId = 2 }, // Sarah -> Memphis
            new WalkerCity { Id = 3, WalkerId = 2, CityId = 3 }, // Mike -> Knoxville
            new WalkerCity { Id = 4, WalkerId = 3, CityId = 1 }, // Jessica -> Nashville
            new WalkerCity { Id = 5, WalkerId = 3, CityId = 2 }, // Jessica -> Memphis
            new WalkerCity { Id = 6, WalkerId = 3, CityId = 3 }  // Jessica -> Knoxville
        };

        public List<Dog> Dogs { get; set; } = new List<Dog>
        {
            new Dog { Id = 1, Name = "Buddy", CityId = 1, WalkerId = 1 },
            new Dog { Id = 2, Name = "Max", CityId = 2, WalkerId = null },
            new Dog { Id = 3, Name = "Luna", CityId = 3, WalkerId = 2 }
        };

        // Helper methods
        public List<City> GetCitiesForWalker(int walkerId)
        {
            var walkerCityIds = WalkerCities
                .Where(wc => wc.WalkerId == walkerId)
                .Select(wc => wc.CityId)
                .ToList();

            return Cities
                .Where(c => walkerCityIds.Contains(c.Id))
                .ToList();
        }

        public int GetNextCityId()
        {
            return Cities.Count > 0 ? Cities.Max(c => c.Id) + 1 : 1;
        }

        public int GetNextWalkerId()
        {
            return Walkers.Count > 0 ? Walkers.Max(w => w.Id) + 1 : 1;
        }

        public int GetNextDogId()
        {
            return Dogs.Count > 0 ? Dogs.Max(d => d.Id) + 1 : 1;
        }

        public int GetNextWalkerCityId()
        {
            return WalkerCities.Count > 0 ? WalkerCities.Max(wc => wc.Id) + 1 : 1;
        }
    }
}
