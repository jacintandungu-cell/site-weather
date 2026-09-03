import React, { useState } from "react";

const QUICK_SITES = ["Nairobi", "Mombasa", "Kisumu", "Nakuru", "Eldoret"];

function SearchBar({ setCity }) {
  const [input, setInput] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    const value = input.trim();
    if (value) setCity(value);
  };

  const pick = (site) => {
    setInput(site);
    setCity(site);
  };

  return (
    <div className="search">
      <form onSubmit={handleSubmit} className="search-bar">
        <input
          type="text"
          placeholder="Site location, e.g. Nakuru"
          aria-label="Site location"
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        <button type="submit">Assess site</button>
      </form>

      <div className="quick-sites">
        <span>Recent sites:</span>
        {QUICK_SITES.map((site) => (
          <button key={site} type="button" onClick={() => pick(site)}>
            {site}
          </button>
        ))}
      </div>
    </div>
  );
}

export default SearchBar;
