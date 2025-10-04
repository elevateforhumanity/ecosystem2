/*
  Copyright (c) 2025 Elevate for Humanity
  Commercial License. No resale, sublicensing, or redistribution allowed.
  See LICENSE file for details.
*/
import React from "react";
import { Link } from "react-router-dom";
import AppLayout from "../layouts/AppLayout";

export default function AdminDashboard() {
  return (
    <AppLayout>
      <div style={{ maxWidth: 1400, margin: "0 auto", padding: 32 }}>
        <h1 style={{ fontSize: 32, fontWeight: 700, marginBottom: 32 }}>Admin Dashboard</h1>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: 20, marginBottom: 40 }}>
          {[
            { label: "Total Users", value: "12,458", color: "#007bff" },
            { label: "Active Courses", value: "342", color: "#28a745" },
            { label: "Revenue (MTD)", value: "$45,230", color: "#ffc107" },
            { label: "Support Tickets", value: "23", color: "#dc3545" },
          ].map((stat, i) => (
            <div key={i} style={{ backgroundColor: "#fff", padding: 24, borderRadius: 8, border: "1px solid #e0e0e0" }}>
              <div style={{ fontSize: 32, fontWeight: 700, color: stat.color, marginBottom: 8 }}>{stat.value}</div>
              <div style={{ fontSize: 14, color: "#666" }}>{stat.label}</div>
            </div>
          ))}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 24 }}>
          <Link to="/admin/users" style={{ backgroundColor: "#fff", padding: 24, borderRadius: 8, border: "1px solid #e0e0e0", textDecoration: "none", color: "inherit" }}>
            <div style={{ fontSize: 32, marginBottom: 12 }}>👥</div>
            <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>User Management</h3>
            <p style={{ fontSize: 14, color: "#666" }}>Manage users, roles, and permissions</p>
          </Link>

          <Link to="/admin/courses" style={{ backgroundColor: "#fff", padding: 24, borderRadius: 8, border: "1px solid #e0e0e0", textDecoration: "none", color: "inherit" }}>
            <div style={{ fontSize: 32, marginBottom: 12 }}>📚</div>
            <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>Course Management</h3>
            <p style={{ fontSize: 14, color: "#666" }}>Review and manage all courses</p>
          </Link>

          <Link to="/admin/analytics" style={{ backgroundColor: "#fff", padding: 24, borderRadius: 8, border: "1px solid #e0e0e0", textDecoration: "none", color: "inherit" }}>
            <div style={{ fontSize: 32, marginBottom: 12 }}>📊</div>
            <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>Analytics</h3>
            <p style={{ fontSize: 14, color: "#666" }}>View platform analytics and reports</p>
          </Link>

          <Link to="/admin/settings" style={{ backgroundColor: "#fff", padding: 24, borderRadius: 8, border: "1px solid #e0e0e0", textDecoration: "none", color: "inherit" }}>
            <div style={{ fontSize: 32, marginBottom: 12 }}>⚙️</div>
            <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>Platform Settings</h3>
            <p style={{ fontSize: 14, color: "#666" }}>Configure platform settings</p>
          </Link>
        </div>
      </div>
    </AppLayout>
  );
}
