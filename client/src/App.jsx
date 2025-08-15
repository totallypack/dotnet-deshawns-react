// client/src/App.jsx
import { useState } from "react";
import "./App.css";
import { CityList } from "./components/cities";
import { DogList } from "./components/dogs";
import { DogDetails } from "./components/dogs";
import { AddDogForm } from "./components/dogs";
import { WalkerList } from "./components/walkers";
import { AvailableDogsForWalker } from "./components/walkers";
import { EditWalkerForm } from "./components/walkers";

function App() {
  const [currentView, setCurrentView] = useState("dogs"); // Start with dogs as home
  const [selectedDogId, setSelectedDogId] = useState(null);
  const [selectedWalkerId, setSelectedWalkerId] = useState(null);
  const [selectedWalkerName, setSelectedWalkerName] = useState("");

  // Navigation handlers for dogs
  const handleViewDog = (dogId) => {
    setSelectedDogId(dogId);
    setCurrentView("dog-details");
  };

  const handleAddDog = () => {
    setCurrentView("add-dog");
  };

  const handleBackToDogs = () => {
    setSelectedDogId(null);
    setCurrentView("dogs");
  };

  const handleDogAdded = () => {
    setCurrentView("dogs"); // Go back to dogs list after adding
  };

  // Navigation handlers for walkers
  const handleViewAvailableDogs = (walkerId, walkerName) => {
    setSelectedWalkerId(walkerId);
    setSelectedWalkerName(walkerName);
    setCurrentView("available-dogs");
  };

  const handleEditWalker = (walkerId) => {
    setSelectedWalkerId(walkerId);
    setCurrentView("edit-walker");
  };

  const handleBackToWalkers = () => {
    setSelectedWalkerId(null);
    setSelectedWalkerName("");
    setCurrentView("walkers");
  };

  const handleDogAssigned = () => {
    setCurrentView("walkers"); // Go back to walkers list after assigning
  };

  const handleWalkerUpdated = () => {
    setCurrentView("walkers"); // Go back to walkers list after updating
  };

  const renderCurrentView = () => {
    switch (currentView) {
      case "dogs":
        return <DogList onViewDog={handleViewDog} onAddDog={handleAddDog} />;
      case "dog-details":
        return <DogDetails dogId={selectedDogId} onBack={handleBackToDogs} />;
      case "add-dog":
        return <AddDogForm onBack={handleBackToDogs} onDogAdded={handleDogAdded} />;
      case "walkers":
        return <WalkerList onViewAvailableDogs={handleViewAvailableDogs} onEditWalker={handleEditWalker} />;
      case "available-dogs":
        return (
          <AvailableDogsForWalker 
            walkerId={selectedWalkerId} 
            walkerName={selectedWalkerName}
            onBack={handleBackToWalkers} 
            onDogAssigned={handleDogAssigned}
          />
        );
      case "edit-walker":
        return (
          <EditWalkerForm 
            walkerId={selectedWalkerId}
            onBack={handleBackToWalkers} 
            onWalkerUpdated={handleWalkerUpdated}
          />
        );
      case "cities":
        return <CityList />;
      default:
        return <DogList onViewDog={handleViewDog} onAddDog={handleAddDog} />;
    }
  };

  return (
    <div className="App">
      {/* Navigation Bar */}
      <nav className="navbar navbar-expand-lg navbar-dark bg-primary">
        <div className="container-fluid">
          <span className="navbar-brand">DeShawn's Dog Walking</span>
          <div className="navbar-nav">
            <button
              className={`nav-link btn ${currentView === "dogs" || currentView === "dog-details" || currentView === "add-dog" ? "active" : ""}`}
              onClick={() => setCurrentView("dogs")}
            >
              Dogs
            </button>
            <button
              className={`nav-link btn ${currentView === "walkers" || currentView === "available-dogs" || currentView === "edit-walker" ? "active" : ""}`}
              onClick={() => setCurrentView("walkers")}
            >
              Walkers
            </button>
            <button
              className={`nav-link btn ${currentView === "cities" ? "active" : ""}`}
              onClick={() => setCurrentView("cities")}
            >
              Cities
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="container mt-4">
        {renderCurrentView()}
      </div>
    </div>
  );
}

export default App;
