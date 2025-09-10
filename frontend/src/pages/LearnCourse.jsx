"use client"

import { useEffect, useMemo, useState } from "react"
import { useParams } from "react-router-dom"
import api from "../api/axios.js"

function idFromSlug(slug) {
  const parts = slug.split("-")
  return parts[parts.length - 1]
}

export default function LearnCourse() {
  const { slug } = useParams()
  const courseId = useMemo(() => idFromSlug(slug), [slug])
  const [data, setData] = useState(null)
  const [activeLecture, setActiveLecture] = useState(null)

  useEffect(() => {
    api
      .get(`/learning/course/${courseId}`)
      .then((res) => {
        setData(res.data)
        // set default lecture
        const firstLecture = res.data.lectures?.[0]
        if (firstLecture) setActiveLecture(firstLecture.id)
      })
      .catch((err) => {
        alert(err.response?.data?.error || "Failed to load course")
      })
  }, [courseId])

  const active = data?.lectures?.find((l) => l.id === activeLecture)

  async function markComplete(lectureId) {
    await api.post("/learning/progress", { lecture_id: lectureId, is_completed: true })
    // Optimistic update
    setData((prev) => ({
      ...prev,
      progress: [
        ...(prev.progress || []).filter((p) => p.lecture_id !== lectureId),
        { lecture_id: lectureId, is_completed: true, completed_at: new Date().toISOString() },
      ],
    }))
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      <aside className="lg:col-span-1 bg-white border rounded-lg p-4">
        <h3 className="font-semibold mb-3">Curriculum</h3>
        <div className="space-y-3">
          {data?.sections?.map((s) => (
            <div key={s.id}>
              <div className="text-sm font-medium text-gray-800">{s.title}</div>
              <div className="mt-2 space-y-1">
                {data.lectures
                  .filter((l) => l.section_id === s.id)
                  .map((l) => {
                    const prog = (data.progress || []).find((p) => p.lecture_id === l.id)
                    return (
                      <button
                        key={l.id}
                        onClick={() => setActiveLecture(l.id)}
                        className={`w-full text-left text-sm px-2 py-1 rounded ${activeLecture === l.id ? "bg-brand/10 text-brand" : "hover:bg-gray-100"}`}
                      >
                        {l.title} {prog?.is_completed ? "✅" : ""}
                      </button>
                    )
                  })}
              </div>
            </div>
          ))}
        </div>
      </aside>

      <section className="lg:col-span-3 bg-white border rounded-lg p-4">
        {active ? (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">{active.title}</h2>
            {active.content_type === "video" && active.video_url ? (
              <video controls className="w-full rounded-lg bg-black" src={active.video_url} />
            ) : active.content_type === "article" ? (
              <div className="prose max-w-none">
                <p className="whitespace-pre-wrap">{active.article_text || "No content."}</p>
              </div>
            ) : (
              <div className="text-gray-600">Content not available.</div>
            )}
            <div>
              <button onClick={() => markComplete(active.id)} className="px-3 py-2 rounded-md bg-accent text-white">
                Mark Complete
              </button>
            </div>
          </div>
        ) : (
          <div className="text-gray-600">Select a lecture.</div>
        )}
      </section>
    </div>
  )
}
