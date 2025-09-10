"use client"

import { Link, useNavigate } from "react-router-dom"
import { useEffect, useState } from "react"

export default function Navbar() {
  const [user, setUser] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    const u = localStorage.getItem("user")
    if (u) setUser(JSON.parse(u))
  }, [])

  function handleLogout() {
    localStorage.removeItem("token")
    localStorage.removeItem("user")
    setUser(null)
    navigate("/")
  }

  return (
    <header className="border-b bg-white">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link to="/" className="text-xl font-semibold text-brand">
          LMS
        </Link>
        <nav className="flex items-center gap-3">
          <Link className="text-gray-700 hover:text-brand" to="/">
            Marketplace
          </Link>
          {user?.role === "creator" && (
            <Link className="text-gray-700 hover:text-brand" to="/creator/dashboard">
              Creator
            </Link>
          )}
          {user?.role === "student" && (
            <Link className="text-gray-700 hover:text-brand" to="/my-courses">
              My Courses
            </Link>
          )}
          {!user ? (
            <Link to="/auth/login" className="px-3 py-1.5 rounded-md bg-brand text-white hover:opacity-90">
              Login
            </Link>
          ) : (
            <button onClick={handleLogout} className="px-3 py-1.5 rounded-md bg-gray-200 hover:bg-gray-300">
              Logout
            </button>
          )}
        </nav>
      </div>
    </header>
  )
}
