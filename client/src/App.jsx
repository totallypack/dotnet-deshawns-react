import { useState } from "react";
import "./App.css";
import { CityList } from "./Components/cities/CityList";

function App() {
  const [currentView, setCurrentView] = useState("dogs"); // Start with dogs as home

  const renderCurrentView = () => {
    switch (currentView) {
      case "dogs":
        return <div><h2>Dogs (Coming Soon)</h2><p>This will be the home page with all dogs.</p></div>;
      case "walkers":
        return <div><h2>Walkers (Coming Soon)</h2></div>;
      case "cities":
        return <CityList />;
      default:
        return <div><h2>Dogs (Coming Soon)</h2></div>;
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
              className={`nav-link btn ${currentView === "dogs" ? "active" : ""}`}
              onClick={() => setCurrentView("dogs")}
            >
              Dogs
            </button>
            <button
              className={`nav-link btn ${currentView === "walkers" ? "active" : ""}`}
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
