import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import LandingPage from "./pages/landing/LandingPage";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import RegisterTransportista from "./pages/auth/RegisterTransportista";
import VerificarEmail from "./pages/auth/VerificarEmail";
import ForgotPassword from "./pages/auth/ForgotPassword";
import ResetPassword from "./pages/auth/ResetPassword";
import Dashboard from "./pages/dashboard/Dashboard";
import OnboardingTransportista from "./pages/onboarding/OnboardingTransportista";
import OnboardingDador from "./pages/onboarding/OnboardingDador";
import AdminPanel from "./pages/admin/AdminPanel";
import ProtectedRoute from "./routes/ProtectedRoute";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/register/transportista" element={<RegisterTransportista />} />
        <Route path="/verificar-email" element={<VerificarEmail />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/onboarding/transportista" element={<ProtectedRoute><OnboardingTransportista /></ProtectedRoute>} />
        <Route path="/onboarding/dador" element={<ProtectedRoute><OnboardingDador /></ProtectedRoute>} />
        <Route path="/admin" element={<ProtectedRoute><AdminPanel /></ProtectedRoute>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
