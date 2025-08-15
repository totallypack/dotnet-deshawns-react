namespace DeShawnsAPI.Models
{
    public class Walker
    {
        public int Id { get; set; }
        public string Name { get; set; }
        
        // We'll add cities relationship later
        public List<City> Cities { get; set; } = new List<City>();
    }
}
