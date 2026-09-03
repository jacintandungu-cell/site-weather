import React from "react";

function ErrorBanner({ message }) {
  return <div className="error-banner">⚠️ {message}</div>;
}

export default ErrorBanner;
