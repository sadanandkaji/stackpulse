import { Navigate, Route, Routes } from "react-router-dom";
import ProtectedRoute from "./auth/ProtectedRoute";
import AppLayout from "./components/AppLayout";
import ComparePage from "./pages/ComparePage";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import PinsPage from "./pages/PinsPage";
import ProfilePage from "./pages/ProfilePage";
import SavedComparisonsPage from "./pages/SavedComparisonsPage";
import SignupPage from "./pages/SignupPage";

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />
      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/dev/:username" element={<ProfilePage />} />
          <Route path="/compare" element={<ComparePage />} />
          <Route path="/pins" element={<PinsPage />} />
          <Route path="/saved" element={<SavedComparisonsPage />} />
        </Route>
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}