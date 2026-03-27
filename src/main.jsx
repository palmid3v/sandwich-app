import './index.css'
import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom"
import App from "./App";
import OrderPage from "./pages/OrderPage";
import Login from "./pages/Login";

ReactDOM.createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<App />} />
      <Route path="/order" element={<OrderPage />} />
      <Route path="/login" element={<Login />} />
    </Routes>
  </BrowserRouter>
);