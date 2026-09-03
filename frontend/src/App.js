import React, { useState, useEffect } from "react";
import Navbar from "./components/Navbar";
import SearchBar from "./components/SearchBar";
import WeatherResults from "./components/WeatherResults";
import Forecast from "./components/Forecast";
import Footer from "./components/Footer";
import TaskForm from "./components/TaskForm";
import TaskList from "./components/TaskList";
import ErrorBanner from "./components/ErrorBanner";
import UserForm from "./components/UserForm";
import UserList from "./components/UserList";
import { getTasks } from "./services/api";
import "./App.css";

function App() {
  const [city, setCity] = useState("");
  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const data = await getTasks();
        setTasks(data);
      } catch {
        setError("Failed to load tasks");
      }
    };
    fetchTasks();
  }, []);

  return (
    <div className="App">
      <Navbar />

      <main className="content">
        <SearchBar setCity={setCity} />

        {city ? (
          <>
            <WeatherResults city={city} />
            <Forecast city={city} />
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
          <TaskForm setTasks={setTasks} setError={setError} />
          {error && <ErrorBanner message={error} />}
          <TaskList tasks={tasks} setTasks={setTasks} setError={setError} />
        </section>

        <section className="users-panel">
          <h2>Users</h2>
          <UserForm setUsers={setUsers} setError={setError} />
          <UserList />
        </section>
      </main>

      <Footer />
    </div>
  );
}

export default App;
