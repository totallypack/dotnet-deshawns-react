import { useState, useEffect } from "react";
import { createDog } from "./managers/dogManager.js";
import { getCities } from "./managers/cityManager.js";

export const AddDogForm = ({ onBack, onDogAdded }) => {
  const [formData, setFormData] = useState({
    name: "",
    cityId: "",
    walkerId: null
  });
  const [cities, setCities] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    loadCities();
  }, []);

  const loadCities = async () => {
    try {
      const citiesData = await getCities();
      setCities(citiesData);
    } catch (err) {
      setError("Failed to load cities");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      setError("Dog name is required");
      return;
    }

    if (!formData.cityId) {
      setError("Please select a city");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const dogData = {
        name: formData.name.trim(),
        cityId: parseInt(formData.cityId),
        walkerId: formData.walkerId || null
      };

      await createDog(dogData);
      onDogAdded(); // Callback to refresh the dog list and go back
    } catch (err) {
      setError(err.message);
      setIsLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="add-dog-form">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Add New Dog</h2>
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
              <label htmlFor="name" className="form-label">Dog Name</label>
              <input
                type="text"
                className="form-control"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter dog's name"
                required
              />
            </div>

            <div className="mb-3">
              <label htmlFor="cityId" className="form-label">City</label>
              <select
                className="form-select"
                id="cityId"
                name="cityId"
                value={formData.cityId}
                onChange={handleChange}
                required
              >
                <option value="">Select a city...</option>
                {cities.map(city => (
                  <option key={city.id} value={city.id}>
                    {city.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="mb-3">
              <small className="form-text text-muted">
                Walker assignment will be available after creating the dog
              </small>
            </div>

            <div className="d-flex gap-2">
              <button 
                type="submit" 
                className="btn btn-primary"
                disabled={isLoading}
              >
                {isLoading ? "Adding..." : "Add Dog"}
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
    </div>
  );
};
