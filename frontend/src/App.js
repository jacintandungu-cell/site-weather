import React, { useState, useEffect } from "react";
import Navbar from "./components/Navbar";
import SearchBar from "./components/SearchBar";
import WeatherResults from "./components/WeatherResults";
import ForecastPanel from "./components/ForecastPanel";
import Footer from "./components/Footer";
import TaskForm from "./components/TaskForm";
import TaskList from "./components/TaskList";
import ErrorBanner from "./components/ErrorBanner";
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
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem("siteweather_theme") === "dark");
  const [sidebarOpen, setSidebarOpen] = useState(true);

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
  }, [view]);

  const userTasks = tasks.filter((task) => String(task.user_id) === String(activeUserId));
  const pendingTasks = userTasks.filter((task) => task.status === "pending").length;
  const weatherTasks = userTasks.filter((task) => task.weather_sensitive).length;

  const appClassName = darkMode ? "App theme-dark" : "App";

  if (view === "landing") {
    return <div className={appClassName}><LandingPage onLogin={() => setView("login")} onSignup={() => setView("signup")} darkMode={darkMode} onToggleTheme={() => setDarkMode((enabled) => !enabled)} /><Footer /></div>;
  }

  if (view === "login" || view === "signup") {
    return <div className={appClassName}><AuthPage mode={view} onAuthenticated={authenticate} onBack={() => setView("landing")} onSwitchMode={setView} /><Footer /></div>;
  }

  if (view === "settings") {
    return <div className={appClassName}><SettingsPage user={currentUser} onUpdated={updateCurrentUser} onClose={() => setView("dashboard")} /><Footer /></div>;
  }

  return (
    <div className={appClassName}>
      <main className={sidebarOpen ? "dashboard-shell" : "dashboard-shell sidebar-collapsed"}>
        <Navbar
          currentUser={currentUser}
          onLogout={logout}
          onSettings={() => setView("settings")}
          darkMode={darkMode}
          onToggleTheme={() => setDarkMode((enabled) => !enabled)}
          sidebarOpen={sidebarOpen}
          onToggleSidebar={() => setSidebarOpen((open) => !open)}
        />

        <section className="content">
        <header className="dashboard-heading">
          <div>
            <p className="eyebrow">FIELD DESK / TODAY</p>
            <h2>Plan the shift with a clearer view.</h2>
            <p>Check conditions, find the workable window, then keep the crew aligned.</p>
          </div>
          <div className="dashboard-tools">
            <button className="theme-toggle" type="button" onClick={() => setDarkMode((enabled) => !enabled)} aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}>
              <span className="theme-icon" aria-hidden="true">{darkMode ? "☀" : "☾"}</span>
              <span>{darkMode ? "Light mode" : "Dark mode"}</span>
            </button>
            <button className="notification-button" type="button" aria-label="Notifications" title="Notifications coming soon">
              <span aria-hidden="true">●</span> Notifications
            </button>
          </div>
        </header>

        <section id="site-conditions" className="dashboard-route-section">
          <SearchBar setCity={setCity} />

          {city ? (
            <WeatherResults city={city} />
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
        </section>

        {city && <ForecastPanel city={city} />}

        <section id="about" className="panel dashboard-about">
          <p className="eyebrow">ABOUT SITEWEATHER</p>
          <h2>Make the next site decision with evidence.</h2>
          <p>SiteWeather helps construction teams turn changing conditions into a practical plan, so people, materials, and weather-sensitive work are coordinated before the shift begins.</p>
        </section>

        <section className="operations-summary" aria-label="Operations summary">
          <article><span>MY TASKS</span><strong>{userTasks.length}</strong><small>Total assigned</small></article>
          <article><span>TO COMPLETE</span><strong>{pendingTasks}</strong><small>Pending actions</small></article>
          <article><span>WEATHER WATCH</span><strong>{weatherTasks}</strong><small>Weather-sensitive</small></article>
        </section>

        <section className="tasks-panel">
          <header className="tasks-heading">
            <div>
              <p className="eyebrow">TODAY'S DELIVERY</p>
              <h2>Shift plan</h2>
            </div>
            <span className="task-count">{userTasks.length} assigned</span>
          </header>
          <TaskForm setTasks={setTasks} setError={setError} users={users} selectedUserId={activeUserId} />
          {error && <ErrorBanner message={error} />}
          <TaskList tasks={userTasks} setTasks={setTasks} setError={setError} />
        </section>

        </section>
      </main>

      <Footer />
    </div>
  );
}

export default App;
