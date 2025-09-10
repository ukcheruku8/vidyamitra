"use client"

import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import api from "../api/axios.js"

export default function CreatorDashboard() {
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api
      .get("/courses/my-courses")
      .then((res) => setCourses(res.data))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-semibold">Creator Dashboard</h2>
        <Link to="/creator/course/create" className="px-3 py-2 rounded-md bg-brand text-white">
          Create Course
        </Link>
      </div>

      {loading ? (
        <div className="text-gray-600">Loading...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {courses.map((c) => (
            <div key={c.id} className="bg-white border p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">{c.title}</h3>
                <span
                  className={`text-xs px-2 py-0.5 rounded ${c.is_published ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"}`}
                >
                  {c.is_published ? "Published" : "Draft"}
                </span>
              </div>
              <p className="text-sm text-gray-600 mt-1">{c.description}</p>
              <div className="text-sm mt-2">
                ₹{c.price_in_inr} • {c.language?.toUpperCase()}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
