"use client"

import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import api from "../api/axios.js"

export default function AuthLogin() {
  const [email, setEmail] = useState("")
  const [mobile, setMobile] = useState("")
  const [password, setPassword] = useState("")
  const [mode, setMode] = useState("password") // 'password' or 'otp'
  const navigate = useNavigate()

  async function handlePasswordLogin(e) {
    e.preventDefault()
    try {
      const res = await api.post("/auth/login", { email: email || null, mobile_number: mobile || null, password })
      localStorage.setItem("token", res.data.token)
      localStorage.setItem("user", JSON.stringify(res.data.user))
      navigate("/")
    } catch (e) {
      alert(e.response?.data?.error || "Login failed")
    }
  }

  async function handleSendOTP(e) {
    e.preventDefault()
    try {
      await api.post("/auth/otp/send", { mobile_number: mobile })
      navigate("/auth/otp", { state: { mobile_number: mobile } })
    } catch (e) {
      alert(e.response?.data?.error || "Failed to send OTP")
    }
  }

  return (
    <div className="max-w-md mx-auto bg-white border rounded-lg p-6">
      <h2 className="text-xl font-semibold mb-4">Login</h2>

      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setMode("password")}
          className={`px-3 py-1.5 rounded-md border ${mode === "password" ? "bg-brand text-white border-brand" : "bg-white"}`}
        >
          Password
        </button>
        <button
          onClick={() => setMode("otp")}
          className={`px-3 py-1.5 rounded-md border ${mode === "otp" ? "bg-brand text-white border-brand" : "bg-white"}`}
        >
          OTP
        </button>
      </div>

      {mode === "password" ? (
        <form onSubmit={handlePasswordLogin} className="space-y-3">
          <input
            className="w-full rounded-md border-gray-300"
            placeholder="Email (or leave blank)"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            className="w-full rounded-md border-gray-300"
            placeholder="Mobile (+91XXXXXXXXXX or 10 digits)"
            value={mobile}
            onChange={(e) => setMobile(e.target.value)}
          />
          <input
            className="w-full rounded-md border-gray-300"
            placeholder="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button type="submit" className="w-full py-2 rounded-md bg-brand text-white">
            Login
          </button>
        </form>
      ) : (
        <form onSubmit={handleSendOTP} className="space-y-3">
          <input
            className="w-full rounded-md border-gray-300"
            placeholder="Mobile (+91XXXXXXXXXX or 10 digits)"
            value={mobile}
            onChange={(e) => setMobile(e.target.value)}
          />
          <button type="submit" className="w-full py-2 rounded-md bg-brand text-white">
            Send OTP
          </button>
        </form>
      )}

      <div className="mt-4 text-sm text-gray-600">
        New user?{" "}
        <Link to="/auth/otp" state={{ fromRegister: true }} className="text-brand hover:underline">
          Register with OTP
        </Link>
      </div>
    </div>
  )
}
