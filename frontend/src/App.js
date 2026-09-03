import React, { useState, useEffect } from "react";
import Navbar from "./components/Navbar";
import SearchBar from "./components/SearchBar";
import WeatherResults from "./components/WeatherResults";
import ForecastPanel from "./components/ForecastPanel";
import Footer from "./components/Footer";
import TaskForm from "./components/TaskForm";
import TaskList from "./components/TaskList";
import ErrorBanner from "./components/ErrorBanner";
import UserSelector from "./components/UserSelector";
import LandingPage from "./components/LandingPage";
import AuthPage from "./components/AuthPage";
import SettingsPage from "./components/SettingsPage";
import { getTasks, getUsers } from "./services/api";
import "./App.css";

function App() {
  const [city, setCity] = useState("");
  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState([]);
  const [error, setError] = useState("");
  const [activeUserId, setActiveUserId] = useState("");
  const [view, setView] = useState("landing");
  const [currentUser, setCurrentUser] = useState(null);

  const authenticate = (user) => {
    localStorage.setItem("siteweather_user", JSON.stringify(user));
    setCurrentUser(user);
    setActiveUserId(String(user.id));
    setView("dashboard");
  };

  const logout = () => {
    localStorage.removeItem("siteweather_user");
    localStorage.removeItem("siteweather_token");
    setCurrentUser(null);
    setView("landing");
  };

  const updateCurrentUser = (user) => {
    setCurrentUser(user);
    localStorage.setItem("siteweather_user", JSON.stringify(user));
  };

  useEffect(() => {
    const savedUser = localStorage.getItem("siteweather_user");
    const savedToken = localStorage.getItem("siteweather_token");
    if (!savedUser || !savedToken) {
      localStorage.removeItem("siteweather_user");
      localStorage.removeItem("siteweather_token");
      return;
    }
    try {
      const user = JSON.parse(savedUser);
      setCurrentUser(user);
      setActiveUserId(String(user.id));
      setView("dashboard");
    } catch {
      localStorage.removeItem("siteweather_user");
    }
  }, []);

  useEffect(() => {
    if (view !== "dashboard") return;
    const fetchTasks = async () => {
      try {
        const data = await getTasks();
        setTasks(data);
      } catch {
        setError("Failed to load tasks");
      }
    };
    fetchTasks();
    getUsers().then(setUsers).catch((err) => setError(err.message || "Failed to load users"));
  }, [view]);

  if (view === "landing") {
    return <div className="App"><LandingPage onLogin={() => setView("login")} onSignup={() => setView("signup")} /><Footer /></div>;
  }

  if (view === "login" || view === "signup") {
    return <div className="App"><AuthPage mode={view} onAuthenticated={authenticate} onBack={() => setView("landing")} onSwitchMode={setView} /><Footer /></div>;
  }

  if (view === "settings") {
    return <div className="App"><SettingsPage user={currentUser} onUpdated={updateCurrentUser} onClose={() => setView("dashboard")} /><Footer /></div>;
  }

  return (
    <div className="App">
      <Navbar currentUser={currentUser} onLogout={logout} onSettings={() => setView("settings")} />

      <main className="content">
        <SearchBar setCity={setCity} />

        {city ? (
          <>
            <WeatherResults city={city} />
            <ForecastPanel city={city} />
          </>
        ) : (
          <section className="panel empty">
            <h2>Plan the shift before you lose it to the weather</h2>
            <p>
              Enter a site location to get a go / caution / stop call for each trade, the
              control measures to put in place, and the best working window over the next
              five days.
            </p>
          </section>
        )}

        <section className="tasks-panel">
          <h2>Construction Tasks</h2>
          <UserSelector users={users} selectedUserId={activeUserId} onChange={setActiveUserId} />
          <TaskForm setTasks={setTasks} setError={setError} users={users} selectedUserId={activeUserId} />
          {error && <ErrorBanner message={error} />}
          <TaskList tasks={activeUserId ? tasks.filter((task) => String(task.user_id) === String(activeUserId)) : tasks} setTasks={setTasks} setError={setError} />
        </section>

      </main>

      <Footer />
    </div>
  );
}

export default App;
