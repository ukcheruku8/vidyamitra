import { Routes, Route, Navigate } from "react-router-dom"
import Navbar from "./components/Navbar.jsx"
import Landing from "./pages/Landing.jsx"
import AuthLogin from "./pages/AuthLogin.jsx"
import AuthOTP from "./pages/AuthOTP.jsx"
import CreatorDashboard from "./pages/CreatorDashboard.jsx"
import CourseBuilder from "./pages/CourseBuilder.jsx"
import LearnCourse from "./pages/LearnCourse.jsx"
import StudentDashboard from "./pages/StudentDashboard.jsx"
import ProtectedRoute from "./components/ProtectedRoute.jsx"

export default function App() {
  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <Navbar />
      <main className="max-w-6xl mx-auto px-4 py-6">
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/auth/login" element={<AuthLogin />} />
          <Route path="/auth/otp" element={<AuthOTP />} />
          <Route
            path="/creator/dashboard"
            element={
              <ProtectedRoute role="creator">
                <CreatorDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/creator/course/create"
            element={
              <ProtectedRoute role="creator">
                <CourseBuilder />
              </ProtectedRoute>
            }
          />
          <Route
            path="/learn/course/:slug"
            element={
              <ProtectedRoute role="student">
                <LearnCourse />
              </ProtectedRoute>
            }
          />
          <Route
            path="/my-courses"
            element={
              <ProtectedRoute role="student">
                <StudentDashboard />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  )
}
