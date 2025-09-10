// Simple role-protected route
import { Navigate } from "react-router-dom"

export default function ProtectedRoute({ role, children }) {
  const token = localStorage.getItem("token")
  const userStr = localStorage.getItem("user")
  if (!token || !userStr) return <Navigate to="/auth/login" replace />

  const user = JSON.parse(userStr)
  if (role && user.role !== role) {
    return <Navigate to="/" replace />
  }
  return children
}
