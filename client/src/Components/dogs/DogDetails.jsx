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
    } catch (err) {
      setError(err.message);
    } finally {
      setIsAssigning(false);
    }
  };

  const handleUnassignWalker = async () => {
    if (window.confirm(`Remove ${dog.walker.name} as ${dog.name}'s walker?`)) {
      await handleAssignWalker(null);
    }
  };

  if (isLoading) {
    return <div>Loading dog details...</div>;
  }

  if (error && !dog) {
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

      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}

      <div className="row">
        <div className="col-md-8">
          <div className="card">
            <div className="card-body">
              <h5 className="card-title">Basic Information</h5>
              <div className="row">
                <div className="col-md-6">
                  <p><strong>Name:</strong> {dog.name}</p>
                  <p><strong>City:</strong> {dog.city?.name || "Unknown"}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="card mt-3">
            <div className="card-body">
              <h5 className="card-title">Walker Assignment</h5>
              
              {dog.walker ? (
                <div>
                  <div className="alert alert-success">
                    <strong>Current Walker:</strong> {dog.walker.name}
                  </div>
                  <div className="d-flex gap-2">
                    <button 
                      className="btn btn-warning"
                      onClick={() => setShowWalkerSelection(!showWalkerSelection)}
                      disabled={isAssigning}
                    >
                      Change Walker
                    </button>
                    <button 
                      className="btn btn-outline-danger"
                      onClick={handleUnassignWalker}
                      disabled={isAssigning}
                    >
                      Remove Walker
                    </button>
                  </div>
                </div>
              ) : (
                <div>
                  <div className="alert alert-warning">
                    <strong>No walker assigned</strong>
                  </div>
                  <button 
                    className="btn btn-primary"
                    onClick={() => setShowWalkerSelection(!showWalkerSelection)}
                    disabled={isAssigning}
                  >
                    Assign Walker
                  </button>
                </div>
              )}

              {showWalkerSelection && (
                <div className="mt-3">
                  <h6>Available Walkers in {dog.city?.name}:</h6>
                  {availableWalkers.length === 0 ? (
                    <div className="alert alert-info">
                      No walkers available in {dog.city?.name}. 
                      Walkers must work in the same city as the dog.
                    </div>
                  ) : (
                    <div className="list-group">
                      {availableWalkers.map(walker => (
                        <div key={walker.id} className="list-group-item d-flex justify-content-between align-items-center">
                          <div>
                            <strong>{walker.name}</strong>
                            <br />
                            <small className="text-muted">
                              Works in: {walker.cities.map(c => c.name).join(", ")}
                            </small>
                          </div>
                          <button 
                            className="btn btn-success btn-sm"
                            onClick={() => handleAssignWalker(walker.id)}
                            disabled={isAssigning}
                          >
                            {isAssigning ? "Assigning..." : "Select"}
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                  <button 
                    className="btn btn-secondary btn-sm mt-2"
                    onClick={() => setShowWalkerSelection(false)}
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="col-md-4">
          <div className="card">
            <div className="card-body">
              <h6 className="card-title">Walker Assignment Rules</h6>
              <ul className="small">
                <li>Dogs can only be assigned to walkers who work in the same city</li>
                <li>Each dog can have at most one walker</li>
                <li>Walkers can walk multiple dogs</li>
                <li>Assignment is optional - dogs don't need to have a walker</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
