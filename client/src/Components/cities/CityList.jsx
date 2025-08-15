import { useState, useEffect } from "react";
import { getCities, createCity } from "../../managers/cityManager.js";

export const CityList = () => {
  const [cities, setCities] = useState([]);
  const [newCityName, setNewCityName] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadCities();
  }, []);

  const loadCities = async () => {
    try {
      const citiesData = await getCities();
      setCities(citiesData);
      setIsLoading(false);
    } catch (err) {
      setError("Failed to load cities");
      setIsLoading(false);
    }
  };

  const handleAddCity = async (e) => {
    e.preventDefault();
    
    if (!newCityName.trim()) {
      setError("City name is required");
      return;
    }

    try {
      setError("");
      await createCity({ name: newCityName.trim() });
      setNewCityName("");
      loadCities(); // Refresh the list
    } catch (err) {
      setError(err.message);
    }
  };

  if (isLoading) {
    return <div>Loading cities...</div>;
  }

  return (
    <div className="city-list">
      <h2>Cities</h2>
      
      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}

      {/* Add City Form */}
      <div className="add-city-section">
        <h3>Add a City</h3>
        <form onSubmit={handleAddCity} className="d-flex gap-2 mb-4">
          <input
            type="text"
            className="form-control"
            placeholder="Enter city name"
            value={newCityName}
            onChange={(e) => setNewCityName(e.target.value)}
            style={{ maxWidth: "300px" }}
          />
          <button type="submit" className="btn btn-primary">
            Add
          </button>
        </form>
      </div>

      {/* Cities List */}
      <div className="cities-grid">
        <h3>Current Cities</h3>
        {cities.length === 0 ? (
          <p>No cities found.</p>
        ) : (
          <div className="row">
            {cities.map((city) => (
              <div key={city.id} className="col-md-4 mb-3">
                <div className="card">
                  <div className="card-body">
                    <h5 className="card-title">{city.name}</h5>
                    <small className="text-muted">City ID: {city.id}</small>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
