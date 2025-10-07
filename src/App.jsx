import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

function HomePage() {
  return (
    <div style={{ padding: 40 }}>
      <h1>Elevate for Humanity</h1>
      <p>Welcome to the Education Platform</p>
      <a href="/lms">Go to LMS</a>
    </div>
  );
}

function LMSPage() {
  return (
    <div style={{ padding: 40 }}>
      <h1>Learning Management System</h1>
      <p>LMS Dashboard - Coming Soon</p>
      <a href="/">Back to Home</a>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/lms" element={<LMSPage />} />
        <Route path="/lms/dashboard" element={<LMSPage />} />
        <Route path="/lms/courses" element={<LMSPage />} />
        <Route path="/lms/progress" element={<LMSPage />} />
        <Route path="*" element={<div style={{ padding: 40 }}>404 - Page Not Found</div>} />
      </Routes>
    </BrowserRouter>
  );
}
