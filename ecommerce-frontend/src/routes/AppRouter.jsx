import { Routes, Route } from "react-router-dom";

// pages publiques
import Shop from "../pages/Shop";
import SearchPage from "../pages/SearchPage";
import Profile from "../pages/Profile";

// admin
import AdminLayout from "../admin/layout/AdminLayout";
import AdminDashboard from "../admin/pages/Dashboard";

export default function AppRouter() {
  return (
    <Routes>
      {/* SITE PUBLIC */}
      <Route path="/" element={<Shop />} />
      <Route path="/search" element={<SearchPage />} />
      <Route path="/profile" element={<Profile />} />

      {/* ADMIN */}
      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<AdminDashboard />} />
      </Route>
    </Routes>
  );
}
