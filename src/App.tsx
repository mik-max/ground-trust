import { BrowserRouter, Route, Routes, useLocation } from "react-router-dom";
import { NavBar } from "./components/NavBar";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { Home } from "./pages/Home";
import { Profile } from "./pages/Profile";
import { TalkAboutEnvironment } from "./pages/TalkAboutEnvironment";
import { ProposeArea } from "./pages/ProposeArea";
import { AreaProfile } from "./pages/AreaProfile";
import { CompareAreas } from "./pages/CompareAreas";
import { SubmitReview } from "./pages/SubmitReview";
import { MyContributions } from "./pages/MyContributions";
import { Login } from "./pages/auth/Login";
import { Register } from "./pages/auth/Register";
import { GovDashboard } from "./pages/gov/Dashboard";
import { ResidencyConsent } from "./pages/onboarding/ResidencyConsent";
import { AdminGovernmentAccounts } from "./pages/admin/GovernmentAccounts";
import { ModerationQueue } from "./pages/admin/ModerationQueue";

const CHROMELESS_PATHS = new Set(["/login", "/register"]);

// Login/Register render full-viewport (see AuthLayout) with no NavBar and
// none of the centered max-w-6xl column every other page sits inside — a
// single useLocation check here, rather than nested <Routes> trees, keeps
// the routing itself unambiguous.
function AppShell() {
  const location = useLocation();

  if (CHROMELESS_PATHS.has(location.pathname)) {
    return (
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Routes>
    );
  }

  return (
    <>
      <NavBar />
      <main className="mx-auto max-w-6xl px-6 py-8">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route
            path="/onboarding/consent"
            element={
              <ProtectedRoute allow={["resident"]}>
                <ResidencyConsent />
              </ProtectedRoute>
            }
          />
          <Route
            path="/share"
            element={
              <ProtectedRoute allow={["resident"]}>
                <TalkAboutEnvironment />
              </ProtectedRoute>
            }
          />
          <Route
            path="/areas/propose"
            element={
              <ProtectedRoute allow={["resident"]}>
                <ProposeArea />
              </ProtectedRoute>
            }
          />
          <Route path="/areas/:id" element={<AreaProfile />} />
          <Route
            path="/profile"
            element={
              <ProtectedRoute allow={["resident", "government", "admin"]}>
                <Profile />
              </ProtectedRoute>
            }
          />
          <Route path="/compare" element={<CompareAreas />} />
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
          <Route
            path="/admin/government-accounts"
            element={
              <ProtectedRoute allow={["admin"]}>
                <AdminGovernmentAccounts />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/moderation"
            element={
              <ProtectedRoute allow={["admin"]}>
                <ModerationQueue />
              </ProtectedRoute>
            }
          />
        </Routes>
      </main>
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppShell />
    </BrowserRouter>
  );
}
