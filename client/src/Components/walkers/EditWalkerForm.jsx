import { useState, useEffect } from "react";
import { getWalker, updateWalker } from "../../managers/walkerManager.js";
import { getCities } from "../../managers/cityManager.js";

export const EditWalkerForm = ({ walkerId, onBack, onWalkerUpdated }) => {
  const [walker, setWalker] = useState(null);
  const [allCities, setAllCities] = useState([]);
  const [selectedCityIds, setSelectedCityIds] = useState([]);
  const [walkerName, setWalkerName] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    loadData();
  }, [walkerId]);

  const loadData = async () => {
    try {
      const [walkerData, citiesData] = await Promise.all([
        getWalker(walkerId),
        getCities()
      ]);
      
      setWalker(walkerData);
      setWalkerName(walkerData.name);
      setAllCities(citiesData);
      setSelectedCityIds(walkerData.cities.map(city => city.id));
      setIsLoading(false);
    } catch (err) {
      setError("Failed to load walker data");
      setIsLoading(false);
    }
  };

  const handleCityChange = (cityId, isChecked) => {
    setSelectedCityIds(prev => {
      if (isChecked) {
        return [...prev, cityId];
      } else {
        return prev.filter(id => id !== cityId);
      }
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!walkerName.trim()) {
      setError("Walker name is required");
      return;
    }

    setIsSaving(true);
    setError("");

    try {
      // Prepare the walker data with selected cities
      const updatedWalkerData = {
        name: walkerName.trim(),
        cities: selectedCityIds.map(cityId => ({
          id: cityId,
          name: allCities.find(city => city.id === cityId)?.name || ""
        }))
      };

      await updateWalker(walkerId, updatedWalkerData);
      onWalkerUpdated(); // Go back to walkers list and refresh
    } catch (err) {
      setError(err.message);
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <div>Loading walker details...</div>;
  }

  if (error && !walker) {
    return (
      <div>
        <div className="alert alert-danger">{error}</div>
        <button className="btn btn-secondary" onClick={onBack}>
          Back to Walkers
        </button>
      </div>
    );
  }

  return (
    <div className="edit-walker-form">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Edit Walker: {walker?.name}</h2>
        <button className="btn btn-secondary" onClick={onBack}>
          Cancel
        </button>
      </div>

      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}

      <div className="card">
        <div className="card-body">
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label htmlFor="walkerName" className="form-label">Walker Name</label>
              <input
                type="text"
                className="form-control"
                id="walkerName"
                value={walkerName}
                onChange={(e) => setWalkerName(e.target.value)}
                required
              />
            </div>

            <div className="mb-3">
              <label className="form-label">Cities this walker serves:</label>
              <div className="mt-2">
                {allCities.map(city => (
                  <div key={city.id} className="form-check">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id={`city-${city.id}`}
                      checked={selectedCityIds.includes(city.id)}
                      onChange={(e) => handleCityChange(city.id, e.target.checked)}
                    />
                    <label className="form-check-label" htmlFor={`city-${city.id}`}>
                      {city.name}
                    </label>
                  </div>
                ))}
              </div>
              {selectedCityIds.length === 0 && (
                <small className="text-warning">
                  ⚠️ Walker must serve at least one city to be assigned dogs
                </small>
              )}
            </div>

            <div className="d-flex gap-2">
              <button 
                type="submit" 
                className="btn btn-primary"
                disabled={isSaving}
              >
                {isSaving ? "Updating..." : "Update Walker"}
              </button>
              <button 
                type="button" 
                className="btn btn-secondary"
                onClick={onBack}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Info Section */}
      <div className="mt-4">
        <div className="alert alert-info">
          <h6>How Walker Cities Work:</h6>
          <ul className="mb-0">
            <li>Walkers can only be assigned to dogs in cities where they work</li>
            <li>Changing cities won't unassign existing dogs, but may affect future assignments</li>
            <li>Use checkboxes to select all cities where this walker provides service</li>
          </ul>
        </div>
      </div>
    </div>
  );
};
