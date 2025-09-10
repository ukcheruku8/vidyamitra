"use client"

import { useLocation, useNavigate } from "react-router-dom"
import { useEffect, useState } from "react"
import api from "../api/axios.js"

export default function AuthOTP() {
  const location = useLocation()
  const navigate = useNavigate()
  const [mobile, setMobile] = useState(location.state?.mobile_number || "")
  const [code, setCode] = useState("")
  const [registerMode, setRegisterMode] = useState(!!location.state?.fromRegister)
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [role, setRole] = useState("student")
  const [tenantName, setTenantName] = useState("")

  useEffect(() => {
    // If register mode and mobile present, send an OTP too (optional UX)
  }, [])

  async function handleVerify() {
    try {
      const res = await api.post("/auth/otp/verify", { mobile_number: mobile, code })
      localStorage.setItem("token", res.data.token)
      localStorage.setItem("user", JSON.stringify(res.data.user))
      navigate("/")
    } catch (e) {
      alert(e.response?.data?.error || "OTP verify failed")
    }
  }

  async function handleRegister(e) {
    e.preventDefault()
    try {
      const payload = {
        name,
        email,
        mobile_number: mobile,
        password,
        role,
      }
      if (role === "creator" && tenantName) {
        payload.tenant = { name: tenantName }
      }
      const res = await api.post("/auth/register", payload)
      localStorage.setItem("token", res.data.token)
      localStorage.setItem("user", JSON.stringify(res.data.user))
      navigate("/")
    } catch (e) {
      alert(e.response?.data?.error || "Registration failed")
    }
  }

  return (
    <div className="max-w-md mx-auto bg-white border rounded-lg p-6 space-y-4">
      <h2 className="text-xl font-semibold">{registerMode ? "Register" : "OTP Verification"}</h2>

      <input
        className="w-full rounded-md border-gray-300"
        placeholder="Mobile (+91XXXXXXXXXX)"
        value={mobile}
        onChange={(e) => setMobile(e.target.value)}
      />

      {registerMode ? (
        <form onSubmit={handleRegister} className="space-y-3">
          <input
            className="w-full rounded-md border-gray-300"
            placeholder="Full name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <input
            className="w-full rounded-md border-gray-300"
            placeholder="Email (optional)"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            className="w-full rounded-md border-gray-300"
            placeholder="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <div>
            <label className="text-sm text-gray-700">Role</label>
            <select
              className="w-full rounded-md border-gray-300"
              value={role}
              onChange={(e) => setRole(e.target.value)}
            >
              <option value="student">Student</option>
              <option value="creator">Creator</option>
            </select>
          </div>
          {role === "creator" && (
            <input
              className="w-full rounded-md border-gray-300"
              placeholder="Tenant/Brand Name"
              value={tenantName}
              onChange={(e) => setTenantName(e.target.value)}
            />
          )}
          <button className="w-full py-2 rounded-md bg-accent text-white">Register</button>
        </form>
      ) : (
        <div className="space-y-3">
          <input
            className="w-full rounded-md border-gray-300"
            placeholder="6-digit OTP"
            value={code}
            onChange={(e) => setCode(e.target.value)}
          />
          <button onClick={handleVerify} className="w-full py-2 rounded-md bg-brand text-white">
            Verify OTP
          </button>
        </div>
      )}
    </div>
  )
}
