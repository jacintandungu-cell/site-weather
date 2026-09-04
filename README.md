# 🏗️ Site Weather

A smart dashboard built for **construction engineers, project managers, and clients** to plan projects more effectively.  
This app combines **real‑time weather data** with **Google Maps directions** so teams can decide the best time and route for construction activities.

---

## 👥 Target Users

- **Construction Engineers**  
  Need accurate weather forecasts and site directions to plan safe and efficient work schedules.

- **Project Managers**  
  Use the dashboard to coordinate teams, avoid delays, and choose optimal times for construction activities.

- **Clients / Developers**  
  Gain visibility into site conditions and logistics, ensuring projects stay on track and resources are used wisely.

---

## 🛠️ Problem Being Solved

Construction projects are highly sensitive to **weather conditions** and **site accessibility**:

- 🌧️ Rain, humidity, or strong winds can delay work, damage materials, or create unsafe environments.  
- 🚧 Teams often waste time figuring out routes to construction sites, especially in busy urban areas.  

This dashboard solves these challenges by:
- Providing **real‑time weather data** (temperature, humidity, wind speed, forecasts).  
- Integrating **Google Maps directions** so constructors can quickly locate sites and plan routes.  
- Combining both insights in one place, helping teams make **data‑driven decisions** about when and how to build.  

---

## ✨ Features

- 🚦 **Site Guidance Engine**
  Turns the readings into a **go / caution / stop** call for each trade — concrete pours,
  roofing, crane lifts, painting, earthworks, scaffolding, masonry and general labour —
  with the control measures to put in place. Thresholds live in `src/utils/advisory.js`.

- 📋 **Actions for the shift**
  A short, de-duplicated action list (covers on standby, hydration breaks, tie-downs,
  lift-plan checks) ready for the morning toolbox talk.

- 🗓️ **Workable-hours scoring**
  Each of the next five days is scored for usable working hours, with a recommendation
  on which day to book weather-critical works and which to keep for indoor tasks.

- 🌦️ **Weather API Integration**  
  Displays live conditions (temperature, humidity, wind speed, etc.) for any site location.

- 🗺️ **Google Maps Directions** _(planned)_  
  Provides routes and site locations so constructors can easily navigate to projects.

- 🔍 **Search Bar**  
  Enter a city or site name to instantly see weather conditions and directions.

- 📊 **Forecast View**  
  Shows upcoming weather predictions to help plan ahead.

- 📱 **Responsive Design**  
  Works seamlessly on desktop and mobile devices.

---

## 🚀 Getting Started

### Requirements
- Node.js 18+
- npm or yarn
- Google Maps API key
- Weather API key (e.g., OpenWeatherMap)

### Installation
Clone the repository and install frontend dependencies:
```bash
git clone https://github.com/yourusername/construction-weather-dashboard.git
cd construction-weather-dashboard
cd frontend
npm install
```

Install backend dependencies:
```bash
pip install -r backend/requirements.txt
```
Configuration
Create a .env file in the root:

env
REACT_APP_WEATHER_API_KEY=your_weather_api_key
REACT_APP_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
Ensure your image assets (like construction-bg.jpg) are inside the public/ folder.

🧑‍💻 Usage
Start the development server:

bash
npm start
Open http://localhost:3000 in your browser.

Use the Search Bar to enter a city or site name.

The dashboard will show:

Current weather conditions

Forecast cards

A Google Map with directions to the site

## Deploy on Render

The repository includes `render.yaml` for a Render Blueprint with:

- a Python web service for the Flask API;
- a PostgreSQL database with migrations applied during deployment; and
- a static site for the React frontend.

In Render, choose **New > Blueprint**, connect this repository, and deploy the blueprint. In the API service's **Environment** tab, add `SECRET_KEY` and `JWT_SECRET_KEY` as long random values. These are required by the production guard in `backend/app.py` and must be stored in Render, never committed to the repository. Add `OPENWEATHER_API_KEY` to the API service to enable weather requests, and set `SMTP_HOST`, `SMTP_PORT`, `SMTP_USERNAME`, `SMTP_PASSWORD`, and `SMTP_FROM` if email password resets are enabled. Render provides the API and frontend URLs to each service automatically.

📂 Project Structure
Code
construction-weather-dashboard/
├── frontend/
│   ├── public/
│   │   ├── construction-bg.jpg
│   │   └── index.html
│   └── src/
│   ├── components/
│   │   ├── Navbar.js
│   │   ├── SearchBar.js
│   │   ├── WeatherResults.js
│   │   ├── Forecast.js
│   │   └── Footer.js
│   ├── utils/
│   │   ├── advisory.js   # site thresholds & guidance rules
│   │   └── api.js        # weather API calls
│       ├── App.js
│       ├── App.css
│       └── index.js
├── backend/
│   ├── app.py
│   ├── config.py
│   ├── models.py
│   ├── routes.py
│   └── requirements.txt
├── package.json
└── README.md
👩‍💻 Author
Jacinta Ndungu  
Web Development Student at Moringa School
Passionate about building practical tools with React and APIs for real‑world use cases.

Weather-Aware Task Scheduling for Construction Teams

---

## 📌 Overview
SiteWeather helps construction site managers and foremen make fast, defensible go/no-go decisions by integrating weather forecasts directly into task scheduling.  

- **Phase 1**: Displayed current conditions and a 5-day forecast.  
- **Phase 2**: Adds task management with weather-sensitive risk flags, replacing manual forecast checks with built-in warnings.

---

## 🎯 Business Problem
Construction crews currently manage weather awareness and task scheduling separately. Wrong calls lead to rework, safety incidents, or wasted crew-hours.  

**Target users**: Site managers and foremen scheduling daily tasks across one or more active sites.  
**Value added**: Tasks marked weather-sensitive are automatically flagged when forecasted conditions pose a risk (e.g., rain on pour day, high wind on roofing day).

---

## 👥 User Stories
- As a **foreman**, I can create a task for a specific site and date so my crew has a clear schedule.  
- As a **foreman**, I can see weather-sensitive tasks checked against the forecast to anticipate delays.  
- As a **site manager**, I can update a task’s status (pending/completed/postponed).  
- As a **site manager**, I can edit or delete tasks without re-entering the schedule.

---

## 🛠️ Tech Stack
- **Backend**: Flask, Flask-SQLAlchemy, Flask-CORS, PostgreSQL  
- **Frontend**: React (function components, React Router, useState/useEffect)  
- **API Calls**: fetch/Axios  
- **Testing**: Postman  
- **Forecast Integration**: Phase 1 weather API reused  

---

## 📂 Data Models
**Users**  
- id, name, email, role, password_hash  

**Tasks**  
- id, title, description, location, scheduled_date, status, weather_sensitive, user_id (FK)  

**Relationships**  
- One-to-many: A User owns many Tasks; each Task belongs to exactly one User.

---

## 🖥️ React Component Plan
- **App** → Navbar, UserSelector, ForecastPanel  
- **Dashboard** → TaskForm, TaskList → TaskItem (status/risk badge/edit/delete)  
- **ErrorBanner** → Displays failed-request messages  

---

## 🚀 Build Steps (SDLC-Aligned)
1. **Design** → Data model, API routes, component tree  
2. **Backend** → Flask + SQLAlchemy models, CRUD endpoints, error handling  
3. **Frontend** → React fetches from Flask API, risk flags on tasks  
4. **Test & Ship** → Manual testing with Postman/browser, finalize docs/demo  

---

## ⚠️ Risks & Mitigations
- **Scope creep on risk logic** → Ship simple date/condition match first.  
- **Integration slipping** → Connect one real endpoint by Week 2.  
- **Schema changes mid-build** → Finalize schema in Week 1.  


## ✅ Rubric Alignment
- Full CRUD on custom resource → Tasks  
- 2+ relational resources → Users ↔ Tasks  
- SQLAlchemy/SQL storage → PostgreSQL persistence  
- Error handling → Explicit status codes + ErrorBanner UI  
- Optional API integration → Forecast API drives risk-flag feature
