namespace DeShawnsAPI.Models
{
    public class Dog
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public int CityId { get; set; }
        public int? WalkerId { get; set; } // Nullable - dogs might not have a walker
        
        // Navigation properties for API responses
        public City? City { get; set; }
        public Walker? Walker { get; set; }
    }
}
