import { useState, useEffect } from "react";
import { getWalkers, deleteWalker } from "./managers/walkerManager.js";
import { getCities } from "./managers/cityManager.js";

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
    if (window.confirm(`Are you sure you want to remove ${walkerName}? This will unassign all their dogs.`)) {
      try {
        await deleteWalker(walkerId);
        loadWalkers(); // Refresh the list
      } catch (err) {
        setError(`Failed to delete ${walkerName}`);
      }
    }
  };

  const formatCityNames = (cities) => {
    return cities.map(city => city.name).join(", ");
  };

  if (isLoading) {
    return <div>Loading walkers...</div>;
  }

  return (
    <div className="walker-list">
      <h2>Dog Walkers</h2>

      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}

      {/* City Filter */}
      <div className="mb-4">
        <label htmlFor="cityFilter" className="form-label">Filter by City:</label>
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

      {/* Walkers List */}
      {walkers.length === 0 ? (
        <p>No walkers found{selectedCityId ? " in the selected city" : ""}.</p>
      ) : (
        <div className="row">
          {walkers.map((walker) => (
            <div key={walker.id} className="col-md-6 mb-3">
              <div className="card">
                <div className="card-body">
                  <h5 
                    className="card-title text-primary"
                    style={{ cursor: "pointer" }}
                    onClick={() => onEditWalker(walker.id)}
                  >
                    {walker.name}
                  </h5>
                  <p className="card-text">
                    <strong>Cities:</strong> {formatCityNames(walker.cities)}
                  </p>
                  <div className="d-flex gap-2">
                    <button 
                      className="btn btn-success btn-sm"
                      onClick={() => onViewAvailableDogs(walker.id, walker.name)}
                    >
                      Add Dog
                    </button>
                    <button 
                      className="btn btn-danger btn-sm"
                      onClick={() => handleDeleteWalker(walker.id, walker.name)}
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
    </div>
  );
};
