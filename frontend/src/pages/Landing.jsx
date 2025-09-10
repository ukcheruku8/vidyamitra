"use client"

import { useEffect, useState } from "react"
import api from "../api/axios.js"
import CourseCard from "../components/CourseCard.jsx"

export default function Landing() {
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api
      .get("/marketplace/courses")
      .then((res) => {
        setCourses(res.data)
      })
      .finally(() => setLoading(false))
  }, [])

  return (
    <section>
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-balance">Discover Top Courses from Premium Indian Creators</h1>
        <p className="text-gray-600 mt-2">Learn new skills with high-quality content across multiple providers.</p>
      </div>
      {loading ? (
        <div className="text-center text-gray-600">Loading...</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((c) => (
            <CourseCard key={c.id} course={c} />
          ))}
        </div>
      )}
    </section>
  )
}
