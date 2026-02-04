import { Routes, Route } from "react-router-dom";
import { JobList } from "./pages/JobList";
import { ApplyWizard } from "./pages/ApplyWizard";
import { Thanks } from "./pages/Thanks";
import { Login } from "./pages/Login";
import { AdminPipeline } from "./pages/AdminPipeline";
import { AdminJobs } from "./pages/AdminJobs";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { AdminCandidate } from "./pages/AdminCandidate";
import { RecruiterProfile } from "./pages/RecruiterProfile";

function App() {
  return (
    <Routes>
      <Route path="/" element={<JobList />} />
      <Route path="/apply/:jobId" element={<ApplyWizard />} />
      <Route path="/thanks/:applicationId" element={<Thanks />} />
      <Route path="/login" element={<Login />} />
      <Route
        path="/admin"
        element={
          <ProtectedRoute>
            <AdminPipeline />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/jobs"
        element={
          <ProtectedRoute>
            <AdminJobs />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/candidates/:applicationId"
        element={
          <ProtectedRoute>
            <AdminCandidate />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/profile"
        element={
          <ProtectedRoute>
            <RecruiterProfile />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

export default App;
