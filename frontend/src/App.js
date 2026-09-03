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
import UserList from "./components/UserList";
import { getApiStatus, getTasks, getUsers } from "./services/api";
import "./App.css";

function App() {
  const [city, setCity] = useState("");
  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState([]);
  const [error, setError] = useState("");
  const [activeUserId, setActiveUserId] = useState("");
  const [view, setView] = useState("landing");
  const [currentUser, setCurrentUser] = useState(null);
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem("siteweather_theme") === "dark");
  const [apiStatus, setApiStatus] = useState("checking");

  useEffect(() => {
    localStorage.setItem("siteweather_theme", darkMode ? "dark" : "light");
  }, [darkMode]);

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
    getApiStatus().then(() => setApiStatus("online")).catch(() => setApiStatus("offline"));
  }, [view]);

  const appClassName = darkMode ? "App theme-dark" : "App";

  if (view === "landing") {
    return <div className={appClassName}><LandingPage onLogin={() => setView("login")} onSignup={() => setView("signup")} /><Footer /></div>;
  }

  if (view === "login" || view === "signup") {
    return <div className={appClassName}><AuthPage mode={view} onAuthenticated={authenticate} onBack={() => setView("landing")} onSwitchMode={setView} /><Footer /></div>;
  }

  if (view === "settings") {
    return <div className={appClassName}><SettingsPage user={currentUser} onUpdated={updateCurrentUser} onClose={() => setView("dashboard")} /><Footer /></div>;
  }

  return (
    <div className={appClassName}>
      <Navbar
        currentUser={currentUser}
        onLogout={logout}
        onSettings={() => setView("settings")}
        darkMode={darkMode}
        onToggleTheme={() => setDarkMode((enabled) => !enabled)}
      />

      <main className="content">
        <header className="dashboard-heading">
          <div>
            <p className="eyebrow">FIELD DESK / TODAY</p>
            <h2>Plan the shift with a clearer view.</h2>
            <p>Check conditions, find the workable window, then keep the crew aligned.</p>
          </div>
          <div className="dashboard-side">
            <div className="dashboard-date" aria-label="Today's focus">
              <span>FOCUS</span>
              <strong>Weather-led work</strong>
            </div>
            <p className={"api-status api-status-" + apiStatus}>
              <span aria-hidden="true" /> API {apiStatus}
            </p>
            <div className="dashboard-actions">
              <button type="button" className="profile-button" onClick={() => setView("settings")}>Update profile</button>
              <button type="button" className="logout-button dashboard-logout" onClick={logout}>Log out</button>
            </div>
          </div>
        </header>

        <SearchBar setCity={setCity} />

        {city ? (
          <>
            <WeatherResults city={city} />
            <ForecastPanel city={city} />
          </>
        ) : (
          <section className="panel empty dashboard-empty">
            <span className="empty-mark" aria-hidden="true">01</span>
            <h2>Plan the shift before you lose it to the weather</h2>
            <p>
              Enter a site location to get a go / caution / stop call for each trade, the
              control measures to put in place, and the best working window over the next
              five days.
            </p>
          </section>
        )}

        <section className="tasks-panel">
          <header className="tasks-heading">
            <div>
              <p className="eyebrow">WORK QUEUE</p>
              <h2>Construction Tasks</h2>
            </div>
            <span className="task-count">{tasks.length} tracked</span>
          </header>
          <UserSelector users={users} selectedUserId={activeUserId} onChange={setActiveUserId} />
          <TaskForm setTasks={setTasks} setError={setError} users={users} selectedUserId={activeUserId} />
          {error && <ErrorBanner message={error} />}
          <TaskList tasks={activeUserId ? tasks.filter((task) => String(task.user_id) === String(activeUserId)) : tasks} setTasks={setTasks} setError={setError} />
        </section>

        <section className="users-panel">
          <UserList />
        </section>

      </main>

      <Footer />
    </div>
  );
}

export default App;
