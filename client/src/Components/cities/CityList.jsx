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
    return (
      <div className="loading">
        <div>Loading service areas...</div>
      </div>
    );
  }

  return (
    <div className="city-list">
      <div className="page-header" style={{textAlign: 'center', width: '100%', display: 'block'}}>
        <h2>🏙️ Service Areas</h2>
        <p>Manage the cities where we provide dog walking services!</p>
      </div>
      
      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}

      {/* Add City Form */}
      <div className="card mb-4">
        <div className="card-body">
          <h5 className="card-title">🌟 Expand Our Service</h5>
          <p className="text-muted mb-3">Add a new city to bring DeShawn's dog walking to more communities!</p>
          
          <form onSubmit={handleAddCity} className="d-flex gap-3 align-items-end">
            <div className="flex-grow-1">
              <label htmlFor="cityName" className="form-label">City Name</label>
              <input
                id="cityName"
                type="text"
                className="form-control"
                placeholder="Enter city name (e.g., Chattanooga)"
                value={newCityName}
                onChange={(e) => setNewCityName(e.target.value)}
              />
            </div>
            <button type="submit" className="btn btn-success">
              Add City
            </button>
          </form>
        </div>
      </div>

      {/* Cities Grid */}
      <div className="mb-4">
        <div className="text-center">
          <h5 className="mb-3" style={{textAlign: 'center', width: '100%', display: 'block'}}>Current Service Areas</h5>
        </div>
        {cities.length === 0 ? (
          <div className="no-data">
            <p>No cities yet! Add your first service area to get started.</p>
          </div>
        ) : (
          <div className="row">
            {cities.map((city) => (
              <div key={city.id}>
                <div className="card">
                  <div className="card-body">
                    <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>🏙️</div>
                    <h5 className="card-title">{city.name}</h5>
                    
                    <div className="mt-3">
                      <small className="text-muted">City ID: {city.id}</small>
                      <div className="mt-2">
                        <span className="badge bg-primary">Active</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="info-section">
        <h6 className="mb-2">🚀 Growing Our Reach</h6>
        <p className="mb-0 small text-muted">
          Each new city represents more families we can help and more dogs we can care for. 
          Our network of trusted walkers ensures consistent, quality service across all areas!
        </p>
      </div>
    </div>
  );
};
