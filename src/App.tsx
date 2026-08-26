import { BrowserRouter, Route, Routes } from "react-router-dom";
import { NavBar } from "./components/NavBar";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { Home } from "./pages/Home";
import { AreaProfile } from "./pages/AreaProfile";
import { SubmitReview } from "./pages/SubmitReview";
import { MyContributions } from "./pages/MyContributions";
import { Login } from "./pages/auth/Login";
import { Register } from "./pages/auth/Register";
import { GovDashboard } from "./pages/gov/Dashboard";
import { ResidencyConsent } from "./pages/onboarding/ResidencyConsent";

export default function App() {
  return (
    <BrowserRouter>
      <NavBar />
      <main className="mx-auto max-w-4xl px-6 py-8">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route
            path="/onboarding/consent"
            element={
              <ProtectedRoute allow={["resident"]}>
                <ResidencyConsent />
              </ProtectedRoute>
            }
          />
          <Route path="/areas/:id" element={<AreaProfile />} />
          <Route
            path="/areas/:id/review"
            element={
              <ProtectedRoute allow={["resident"]}>
                <SubmitReview />
              </ProtectedRoute>
            }
          />
          <Route
            path="/my-contributions"
            element={
              <ProtectedRoute allow={["resident"]}>
                <MyContributions />
              </ProtectedRoute>
            }
          />
          <Route
            path="/gov"
            element={
              <ProtectedRoute allow={["government"]}>
                <GovDashboard />
              </ProtectedRoute>
            }
          />
        </Routes>
      </main>
    </BrowserRouter>
  );
}
