export const getDogs = async () => {
  const res = await fetch("/api/dog");
  return res.json();
};

export const getDog = async (id) => {
  const res = await fetch(`/api/dog/${id}`);
  return res.json();
};

export const createDog = async (dogData) => {
  const res = await fetch("/api/dog", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(dogData),
  });
  
  if (!res.ok) {
    const error = await res.text();
    throw new Error(error);
  }
  
  return res.json();
};

export const updateDog = async (id, dogData) => {
  const res = await fetch(`/api/dog/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(dogData),
  });
  
  if (!res.ok) {
    const error = await res.text();
    throw new Error(error);
  }
  
  return res.json();
};

export const deleteDog = async (id) => {
  const res = await fetch(`/api/dog/${id}`, {
    method: "DELETE",
  });
  
  if (!res.ok) {
    const error = await res.text();
    throw new Error(error);
  }
};

export const assignWalker = async (dogId, walkerId) => {
  const res = await fetch(`/api/dog/${dogId}/walker`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ walkerId }),
  });
  
  if (!res.ok) {
    const error = await res.text();
    throw new Error(error);
  }
  
  return res.json();
};

// client/src/components/dogs/DogList.jsx
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
    if (window.confirm(`Are you sure you want to remove ${dogName}?`)) {
      try {
        await deleteDog(dogId);
        loadDogs(); // Refresh the list
      } catch (err) {
        setError(`Failed to delete ${dogName}`);
      }
    }
  };

  if (isLoading) {
    return <div>Loading dogs...</div>;
  }

  return (
    <div className="dog-list">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>All Dogs</h2>
        <button className="btn btn-success" onClick={onAddDog}>
          Add Dog
        </button>
      </div>

      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}

      {dogs.length === 0 ? (
        <p>No dogs found.</p>
      ) : (
        <div className="row">
          {dogs.map((dog) => (
            <div key={dog.id} className="col-md-6 mb-3">
              <div className="card">
                <div className="card-body">
                  <h5 
                    className="card-title text-primary" 
                    style={{ cursor: "pointer" }}
                    onClick={() => onViewDog(dog.id)}
                  >
                    {dog.name}
                  </h5>
                  <p className="card-text">
                    <strong>City:</strong> {dog.city?.name || "Unknown"}<br />
                    <strong>Walker:</strong> {dog.walker?.name || "Not assigned"}
                  </p>
                  <button 
                    className="btn btn-danger btn-sm"
                    onClick={() => handleDeleteDog(dog.id, dog.name)}
                  >
                    Remove
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
