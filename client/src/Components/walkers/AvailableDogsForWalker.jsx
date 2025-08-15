import { useState, useEffect } from "react";
import { getAvailableDogsForWalker } from "../../managers/walkerManager.js";
import { assignWalker } from "../../managers/dogManager.js";

export const AvailableDogsForWalker = ({ walkerId, walkerName, onBack, onDogAssigned }) => {
  const [availableDogs, setAvailableDogs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadAvailableDogs();
  }, [walkerId]);

  const loadAvailableDogs = async () => {
    try {
      const dogsData = await getAvailableDogsForWalker(walkerId);
      setAvailableDogs(dogsData);
      setIsLoading(false);
    } catch (err) {
      setError("Failed to load available dogs");
      setIsLoading(false);
    }
  };

  const handleAssignDog = async (dogId, dogName) => {
    try {
      await assignWalker(dogId, walkerId);
      onDogAssigned(); // This will go back to walkers and refresh
    } catch (err) {
      setError(`Failed to assign ${dogName} to ${walkerName}`);
    }
  };

  if (isLoading) {
    return <div>Loading available dogs...</div>;
  }

  return (
    <div className="available-dogs">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Available Dogs for {walkerName}</h2>
        <button className="btn btn-secondary" onClick={onBack}>
          Back to Walkers
        </button>
      </div>

      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}

      <p className="text-muted">
        Showing dogs in {walkerName}'s cities that are not already assigned to {walkerName}
      </p>

      {availableDogs.length === 0 ? (
        <div className="alert alert-info">
          No dogs are available for assignment to {walkerName}. This could mean:
          <ul className="mt-2 mb-0">
            <li>All dogs in {walkerName}'s cities are already assigned to {walkerName}</li>
            <li>There are no dogs in the cities where {walkerName} works</li>
          </ul>
        </div>
      ) : (
        <div className="row">
          {availableDogs.map((dog) => (
            <div key={dog.id} className="col-md-6 mb-3">
              <div className="card">
                <div className="card-body">
                  <h5 className="card-title">{dog.name}</h5>
                  <p className="card-text">
                    <strong>City:</strong> {dog.city?.name}<br />
                    <strong>Currently:</strong> {dog.walker?.name || "Unassigned"}
                  </p>
                  <button 
                    className="btn btn-primary"
                    onClick={() => handleAssignDog(dog.id, dog.name)}
                  >
                    Assign to {walkerName}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
