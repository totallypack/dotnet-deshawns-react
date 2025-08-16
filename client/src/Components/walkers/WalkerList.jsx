import { useState, useEffect } from "react";
import { getWalkers, deleteWalker } from "../../managers/walkerManager.js";
import { getCities } from "../../managers/cityManager.js";

export const WalkerList = ({ onViewAvailableDogs, onEditWalker }) => {
  const [walkers, setWalkers] = useState([]);
  const [cities, setCities] = useState([]);
  const [selectedCityId, setSelectedCityId] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    loadWalkers();
  }, [selectedCityId]);

  const loadData = async () => {
    try {
      const [walkersData, citiesData] = await Promise.all([
        getWalkers(),
        getCities()
      ]);
      setWalkers(walkersData);
      setCities(citiesData);
      setIsLoading(false);
    } catch (err) {
      setError("Failed to load data");
      setIsLoading(false);
    }
  };

  const loadWalkers = async () => {
    try {
      const cityFilter = selectedCityId ? parseInt(selectedCityId) : null;
      const walkersData = await getWalkers(cityFilter);
      setWalkers(walkersData);
    } catch (err) {
      setError("Failed to load walkers");
    }
  };

  const handleDeleteWalker = async (walkerId, walkerName) => {
    if (window.confirm(`Are you sure you want to remove ${walkerName}? This will unassign all their dogs. 🚶‍♀️`)) {
      try {
        await deleteWalker(walkerId);
        loadWalkers(); // Refresh the list
      } catch (err) {
        setError(`Failed to remove ${walkerName}`);
      }
    }
  };

  const formatCityNames = (cities) => {
    return cities.map(city => city.name).join(", ");
  };

  if (isLoading) {
    return (
      <div className="loading">
        <div>Finding our trusted walkers...</div>
      </div>
    );
  }

  return (
    <div className="walker-list">
      <div className="page-header" style={{textAlign: 'center', width: '100%', display: 'block'}}>
        <h2>🚶‍♀️ Our Dog Walkers</h2>
        <p>Meet our trusted team of professional dog walkers!</p>
      </div>

      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}

      {/* City Filter */}
      <div className="card mb-4">
        <div className="card-body">
          <label htmlFor="cityFilter" className="form-label">🏙️ Filter by City:</label>
          <select
            id="cityFilter"
            className="form-select"
            style={{ maxWidth: "300px" }}
            value={selectedCityId}
            onChange={(e) => setSelectedCityId(e.target.value)}
          >
            <option value="">All Cities</option>
            {cities.map(city => (
              <option key={city.id} value={city.id}>
                {city.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Walkers List */}
      {walkers.length === 0 ? (
        <div className="no-data">
          <p>
            {selectedCityId 
              ? "No walkers found in the selected city." 
              : "No walkers yet! Let's add some trusted dog walkers to our team."
            }
          </p>
        </div>
      ) : (
        <div className="row">
          {walkers.map((walker) => (
            <div key={walker.id}>
              <div className="card clickable-card">
                <div className="card-body">
                  <h5 
                    className="card-title text-primary"
                    style={{ cursor: "pointer" }}
                    onClick={() => onEditWalker(walker.id)}
                  >
                    🚶‍♀️ {walker.name}
                  </h5>
                  
                  <div className="mb-3">
                    <span className="text-muted">🗺️ Service Areas</span>
                    <div className="fw-medium">{formatCityNames(walker.cities)}</div>
                  </div>
                  
                  <div className="mb-3">
                    <span className="text-muted">📊 Status</span>
                    <div>
                      <span className="badge bg-success">Available</span>
                    </div>
                  </div>
                  
                  <div className="d-flex gap-2">
                    <button 
                      className="btn btn-success btn-sm"
                      onClick={() => onViewAvailableDogs(walker.id, walker.name)}
                      title={`Assign dogs to ${walker.name}`}
                    >
                      Assign Dogs
                    </button>
                    <button 
                      className="btn btn-primary btn-sm"
                      onClick={() => onEditWalker(walker.id)}
                      title={`Edit ${walker.name}'s details`}
                    >
                      Edit
                    </button>
                    <button 
                      className="btn btn-danger btn-sm"
                      onClick={() => handleDeleteWalker(walker.id, walker.name)}
                      title={`Remove ${walker.name}`}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="info-section mt-4">
        <h6 className="mb-2">🌟 Walker Standards</h6>
        <p className="mb-0 small text-muted">
          All our walkers are background-checked, insured, and passionate about pet care. 
          They provide regular updates and ensure your dog's safety and happiness!
        </p>
      </div>
    </div>
  );
};
