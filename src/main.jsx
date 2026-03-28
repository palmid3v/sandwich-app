import './index.css'
import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import App from "./App";
import OrderPage from "./pages/OrderPage";

ReactDOM.createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <Routes>

      {/* 🧾 CLIENTE */}
      <Route path="/" element={<OrderPage />} />

      {/* 🔐 VENDEDOR */}
      <Route path="/admin" element={<App />} />

    </Routes>
  </BrowserRouter>
);