/*
  Copyright (c) 2025 Elevate for Humanity
  Commercial License. No resale, sublicensing, or redistribution allowed.
  See LICENSE file for details.
*/
import React from "react";
import { Routes, Route } from "react-router-dom";
import Community from "./Community";
import Integrations from "./Integrations";
import Branding from "./Branding";
import MobileApp from "./MobileApp";
import AccessibilitySettings from "./AccessibilitySettings";
import Support from "./Support";
import Ecommerce from "./Ecommerce";
import CurriculumUpload from "./CurriculumUpload";
import Profile from "./Profile";
import Certificates from "./Certificates";
import Notifications from "./Notifications";
import Settings from "./Settings";

export default function App() {
  return (
    <main style={{ padding: 32, maxWidth: 600, margin: "0 auto" }}>
      <h1>Account Settings</h1>
      <ul>
        <li>Change password</li>
        <li>Two-factor authentication</li>
        <li>Notification preferences</li>
      </ul>
    </main>
  );
}
