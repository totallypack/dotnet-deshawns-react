import { useState, useEffect } from "react";
import { getDog } from "./managers/dogManager.js";

export const DogDetails = ({ dogId, onBack }) => {
  const [dog, setDog] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadDog();
  }, [dogId]);

  const loadDog = async () => {
    try {
      const dogData = await getDog(dogId);
      setDog(dogData);
      setIsLoading(false);
    } catch (err) {
      setError("Failed to load dog details");
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <div>Loading dog details...</div>;
  }

  if (error) {
    return (
      <div>
        <div className="alert alert-danger">{error}</div>
        <button className="btn btn-secondary" onClick={onBack}>
          Back to Dogs
        </button>
      </div>
    );
  }

  return (
    <div className="dog-details">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Dog Details: {dog.name}</h2>
        <button className="btn btn-secondary" onClick={onBack}>
          Back to Dogs
        </button>
      </div>

      <div className="card">
        <div className="card-body">
          <div className="row">
            <div className="col-md-6">
              <p><strong>Name:</strong> {dog.name}</p>
              <p><strong>City:</strong> {dog.city?.name || "Unknown"}</p>
              <p><strong>Current Walker:</strong> {dog.walker?.name || "Not assigned"}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
