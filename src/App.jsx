import React from "react";
import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home.jsx";
import AdminLogin from "./pages/admin/AdminLogin.jsx";
import AdminLayout from "./pages/admin/AdminLayout.jsx";
import DashboardHome from "./pages/admin/DashboardHome.jsx";
import ManageSettings from "./pages/admin/ManageSettings.jsx";
import ManageCategories from "./pages/admin/ManageCategories.jsx";
import ManageServices from "./pages/admin/ManageServices.jsx";
import ManagePortfolio from "./pages/admin/ManagePortfolio.jsx";
import ManageTestimonials from "./pages/admin/ManageTestimonials.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import NotFound from "./pages/NotFound.jsx";
import CustomizeSite from "./pages/admin/CustomizeSite.jsx";
import SearchPage from "./pages/SearchPage.jsx";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/search" element={<SearchPage />} />
      <Route path="/admin/login" element={<AdminLogin />} />
      <Route
        path="/admin"
        element={
          <ProtectedRoute>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<DashboardHome />} />
        <Route path="settings" element={<ManageSettings />} />
        <Route path="customize" element={<CustomizeSite />} />
        <Route path="categories" element={<ManageCategories />} />
        <Route path="services" element={<ManageServices />} />
        <Route path="portfolio" element={<ManagePortfolio />} />
        <Route path="testimonials" element={<ManageTestimonials />} />
      </Route>
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
