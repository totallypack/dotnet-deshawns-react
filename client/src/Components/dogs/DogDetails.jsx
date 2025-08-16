import { useState, useEffect } from "react";
import { getDog, assignWalker, getAvailableWalkersForDog } from "../../managers/dogManager.js";

export const DogDetails = ({ dogId, onBack }) => {
  const [dog, setDog] = useState(null);
  const [availableWalkers, setAvailableWalkers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAssigning, setIsAssigning] = useState(false);
  const [showWalkerSelection, setShowWalkerSelection] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    loadDogData();
  }, [dogId]);

  const loadDogData = async () => {
    try {
      const [dogData, walkersData] = await Promise.all([
        getDog(dogId),
        getAvailableWalkersForDog(dogId)
      ]);
      
      setDog(dogData);
      setAvailableWalkers(walkersData);
      setIsLoading(false);
    } catch (err) {
      setError("Failed to load dog details");
      setIsLoading(false);
    }
  };

  const handleAssignWalker = async (walkerId) => {
    setIsAssigning(true);
    setError("");

    try {
      const updatedDog = await assignWalker(dogId, walkerId);
      setDog(updatedDog);
      setShowWalkerSelection(false);
      // Refresh available walkers list
      const walkersData = await getAvailableWalkersForDog(dogId);
      setAvailableWalkers(walkersData);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsAssigning(false);
    }
  };

  const handleUnassignWalker = async () => {
    if (window.confirm(`Remove ${dog.walker.name} as ${dog.name}'s walker? 🐕`)) {
      await handleAssignWalker(null);
    }
  };

  if (isLoading) {
    return (
      <div className="loading">
        <div>Loading {dog?.name || "dog"} details...</div>
      </div>
    );
  }

  if (error && !dog) {
    return (
      <div className="text-center mt-5">
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
        <div>
          <h2 className="mb-1">🐕 {dog.name}'s Profile</h2>
          <p className="text-muted mb-0">Everything about this wonderful pup!</p>
        </div>
        <button className="btn btn-secondary" onClick={onBack}>
          ← Back to Dogs
        </button>
      </div>

      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}

      <div className="row">
        <div className="col-lg-8">
          {/* Basic Information */}
          <div className="card mb-4">
            <div className="card-body">
              <h5 className="card-title">📋 Basic Information</h5>
              <div className="row">
                <div className="col-md-6">
                  <div className="mb-3">
                    <span className="text-muted">🐕 Name:</span>
                    <div className="fw-bold fs-5">{dog.name}</div>
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="mb-3">
                    <span className="text-muted">🏙️ Location:</span>
                    <div className="fw-medium">{dog.city?.name || "Unknown"}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Walker Assignment */}
          <div className="card">
            <div className="card-body">
              <h5 className="card-title">🚶‍♀️ Walker Assignment</h5>
              
              {dog.walker ? (
                <div>
                  <div className="alert alert-success d-flex align-items-center">
                    <div className="flex-grow-1">
                      <strong>✅ Current Walker:</strong> {dog.walker.name}
                      <div className="small text-muted mt-1">
                        {dog.name} is in great hands with a trusted walker!
                      </div>
                    </div>
                  </div>
                  <div className="d-flex gap-2">
                    <button 
                      className="btn btn-warning"
                      onClick={() => setShowWalkerSelection(!showWalkerSelection)}
                      disabled={isAssigning}
                    >
                      🔄 Change Walker
                    </button>
                    <button 
                      className="btn btn-outline-danger"
                      onClick={handleUnassignWalker}
                      disabled={isAssigning}
                    >
                      ❌ Remove Walker
                    </button>
                  </div>
                </div>
              ) : (
                <div>
                  <div className="alert alert-warning d-flex align-items-center">
                    <div className="flex-grow-1">
                      <strong>⏳ No walker assigned</strong>
                      <div className="small text-muted mt-1">
                        Let's find {dog.name} a perfect walking companion!
                      </div>
                    </div>
                  </div>
                  <button 
                    className="btn btn-primary"
                    onClick={() => setShowWalkerSelection(!showWalkerSelection)}
                    disabled={isAssigning}
                  >
                    🎯 Find a Walker
                  </button>
                </div>
              )}

              {showWalkerSelection && (
                <div className="mt-4">
                  <h6 className="mb-3">Available Walkers in {dog.city?.name}:</h6>
                  {availableWalkers.length === 0 ? (
                    <div className="alert alert-info">
                      <strong>ℹ️ No walkers available</strong>
                      <div className="small mt-1">
                        No walkers are currently available in {dog.city?.name}. 
                        Walkers must work in the same city as the dog.
                      </div>
                    </div>
                  ) : (
                    <div className="row">
                      {availableWalkers.map(walker => (
                        <div key={walker.id} className="col-md-6 mb-3">
                          <div className="card border-primary">
                            <div className="card-body">
                              <h6 className="card-title mb-2">🚶‍♀️ {walker.name}</h6>
                              <p className="card-text small text-muted mb-3">
                                <strong>Service areas:</strong> {walker.cities.map(c => c.name).join(", ")}
                              </p>
                              <button 
                                className="btn btn-success w-100"
                                onClick={() => handleAssignWalker(walker.id)}
                                disabled={isAssigning}
                              >
                                {isAssigning ? "Assigning..." : `Choose ${walker.name}`}
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  <button 
                    className="btn btn-secondary btn-sm mt-3"
                    onClick={() => setShowWalkerSelection(false)}
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="col-lg-4">
          <div className="card">
            <div className="card-body">
              <h6 className="card-title">ℹ️ Assignment Guidelines</h6>
              <ul className="small mb-0">
                <li className="mb-2">Dogs can only be assigned to walkers who work in the same city 🏙️</li>
                <li className="mb-2">Each dog can have at most one walker 🚶‍♀️</li>
                <li className="mb-2">Walkers can walk multiple dogs 🐕</li>
                <li className="mb-0">Assignment is optional - dogs don't need to have a walker ✨</li>
              </ul>
            </div>
          </div>

          <div className="info-section mt-3">
            <h6 className="mb-2">🌟 Our Promise</h6>
            <p className="mb-0 small">
              Every walker is carefully vetted and insured. Your pup's safety and happiness 
              are our top priorities!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
