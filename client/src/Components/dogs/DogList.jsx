import { useState, useEffect } from "react";
import { getDogs, deleteDog } from "../../managers/dogManager.js";

export const DogList = ({ onViewDog, onAddDog }) => {
  const [dogs, setDogs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadDogs();
  }, []);

  const loadDogs = async () => {
    try {
      const dogsData = await getDogs();
      setDogs(dogsData);
      setIsLoading(false);
    } catch (err) {
      setError("Failed to load dogs");
      setIsLoading(false);
    }
  };

  const handleDeleteDog = async (dogId, dogName) => {
    if (window.confirm(`Are you sure you want to remove ${dogName} from the system? 🐕`)) {
      try {
        await deleteDog(dogId);
        loadDogs(); // Refresh the list
      } catch (err) {
        setError(`Failed to remove ${dogName}`);
      }
    }
  };

  if (isLoading) {
    return (
      <div className="loading">
        <div>Loading our furry friends...</div>
      </div>
    );
  }

  return (
    <div className="dog-list">
      <div className="page-header" style={{textAlign: 'center', width: '100%', display: 'block'}}>
        <h2>🐕 Our Dogs</h2>
        <p>Meet all the wonderful dogs in our care!</p>
      </div>

      <div className="d-flex justify-content-center mb-4" style={{textAlign: 'center', width: '100%', display: 'block'}}>
        <button className="btn btn-success btn-lg" onClick={onAddDog}>
          <span>Add New Dog</span>
        </button>
      </div>

      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}

      {dogs.length === 0 ? (
        <div className="no-data">
          <p>No dogs yet! Let's add some furry friends to get started.</p>
          <button className="btn btn-primary btn-lg" onClick={onAddDog}>
            Add Your First Dog
          </button>
        </div>
      ) : (
        <div className="row">
          {dogs.map((dog) => (
            <div key={dog.id}>
              <div className="card clickable-card">
                <div className="card-body">
                  <h5 
                    className="card-title text-primary" 
                    style={{ cursor: "pointer" }}
                    onClick={() => onViewDog(dog.id)}
                  >
                    🐕 {dog.name}
                  </h5>
                  
                  <div className="mb-2">
                    <span className="text-muted">🏙️ Location</span>
                    <div className="fw-medium">{dog.city?.name || "Unknown"}</div>
                  </div>
                  
                  <div className="mb-3">
                    <span className="text-muted">🚶‍♀️ Walker</span>
                    <div className="fw-medium">
                      {dog.walker?.name ? (
                        <span className="text-success">{dog.walker.name}</span>
                      ) : (
                        <span className="text-warning">Looking for a walker</span>
                      )}
                    </div>
                  </div>
                  
                  <div className="d-flex gap-2">
                    <button 
                      className="btn btn-primary btn-sm"
                      onClick={() => onViewDog(dog.id)}
                    >
                      View Details
                    </button>
                    <button 
                      className="btn btn-danger btn-sm"
                      onClick={() => handleDeleteDog(dog.id, dog.name)}
                      title={`Remove ${dog.name}`}
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
        <h6 className="mb-2">🐾 Dog Care Tips</h6>
        <p className="mb-0 small text-muted">
          All our dogs receive personalized attention from verified walkers in their neighborhoods. 
          We ensure every pup gets the exercise and love they deserve!
        </p>
      </div>
    </div>
  );
};
