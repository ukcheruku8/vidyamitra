"use client"

import { useState } from "react"
import api from "../api/axios.js"

export default function CourseBuilder() {
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [price, setPrice] = useState(0)
  const [language, setLanguage] = useState("en")
  const [thumbnail, setThumbnail] = useState("")
  const [published, setPublished] = useState(false)

  const [sections, setSections] = useState([])
  const [lecturesBySection, setLecturesBySection] = useState({})

  function addSection() {
    setSections((prev) => [...prev, { id: crypto.randomUUID(), title: "", order_index: prev.length }])
  }

  function updateSection(id, key, value) {
    setSections((prev) => prev.map((s) => (s.id === id ? { ...s, [key]: value } : s)))
  }

  function addLecture(sectionId) {
    setLecturesBySection((prev) => {
      const list = prev[sectionId] || []
      return {
        ...prev,
        [sectionId]: [
          ...list,
          {
            id: crypto.randomUUID(),
            title: "",
            content_type: "video",
            video_url: "",
            article_text: "",
            order_index: list.length,
            is_preview: false,
            duration_seconds: 0,
          },
        ],
      }
    })
  }

  async function handleCreate() {
    try {
      // Create course
      const courseRes = await api.post("/courses", {
        title,
        description,
        price_in_inr: Number(price),
        language,
        thumbnail_url: thumbnail,
        is_published: published,
      })
      const course = courseRes.data

      // Create sections and lectures
      for (const s of sections) {
        const sRes = await api.post(`/courses/${course.id}/sections`, {
          title: s.title,
          order_index: s.order_index,
        })
        const createdSection = sRes.data
        const lectures = lecturesBySection[s.id] || []
        for (const l of lectures) {
          await api.post(`/courses/sections/${createdSection.id}/lectures`, {
            title: l.title,
            content_type: l.content_type,
            video_url: l.video_url || null,
            article_text: l.article_text || null,
            order_index: l.order_index || 0,
            is_preview: !!l.is_preview,
            duration_seconds: Number(l.duration_seconds) || 0,
          })
        }
      }

      alert("Course created successfully!")
      // Optionally redirect to dashboard
      window.location.href = "/creator/dashboard"
    } catch (e) {
      alert(e.response?.data?.error || "Failed to create course")
    }
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold">Create Course</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-white border rounded-lg p-4">
        <div className="space-y-3">
          <input
            className="w-full rounded-md border-gray-300"
            placeholder="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <textarea
            className="w-full rounded-md border-gray-300"
            placeholder="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          <div className="grid grid-cols-2 gap-3">
            <input
              type="number"
              className="w-full rounded-md border-gray-300"
              placeholder="Price (INR)"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
            />
            <input
              className="w-full rounded-md border-gray-300"
              placeholder="Language (e.g., en, hi)"
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
            />
          </div>
          <input
            className="w-full rounded-md border-gray-300"
            placeholder="Thumbnail URL"
            value={thumbnail}
            onChange={(e) => setThumbnail(e.target.value)}
          />
          <label className="inline-flex items-center gap-2">
            <input type="checkbox" checked={published} onChange={(e) => setPublished(e.target.checked)} />
            <span>Publish</span>
          </label>
        </div>
        <div className="text-sm text-gray-600">
          <p>Tip: Add sections and lectures below. You can mark lectures as preview to allow marketplace previews.</p>
        </div>
      </div>

      <div className="bg-white border rounded-lg p-4 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold">Curriculum</h3>
          <button onClick={addSection} className="px-3 py-1.5 rounded-md bg-gray-900 text-white">
            Add Section
          </button>
        </div>

        <div className="space-y-4">
          {sections.map((s, idx) => (
            <div key={s.id} className="border rounded-md p-3">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <input
                  className="rounded-md border-gray-300"
                  placeholder="Section title"
                  value={s.title}
                  onChange={(e) => updateSection(s.id, "title", e.target.value)}
                />
                <input
                  type="number"
                  className="rounded-md border-gray-300"
                  placeholder="Order"
                  value={s.order_index}
                  onChange={(e) => updateSection(s.id, "order_index", Number(e.target.value))}
                />
                <button onClick={() => addLecture(s.id)} className="px-3 py-1.5 rounded-md bg-brand text-white">
                  Add Lecture
                </button>
              </div>

              <div className="mt-3 space-y-2">
                {(lecturesBySection[s.id] || []).map((l, i) => (
                  <div key={l.id} className="bg-gray-50 rounded-md p-3 grid grid-cols-1 md:grid-cols-6 gap-2">
                    <input
                      className="rounded-md border-gray-300 md:col-span-2"
                      placeholder="Lecture title"
                      value={l.title}
                      onChange={(e) => {
                        const copy = { ...l, title: e.target.value }
                        setLecturesBySection((prev) => ({
                          ...prev,
                          [s.id]: prev[s.id].map((x) => (x.id === l.id ? copy : x)),
                        }))
                      }}
                    />
                    <select
                      className="rounded-md border-gray-300"
                      value={l.content_type}
                      onChange={(e) => {
                        const copy = { ...l, content_type: e.target.value }
                        setLecturesBySection((prev) => ({
                          ...prev,
                          [s.id]: prev[s.id].map((x) => (x.id === l.id ? copy : x)),
                        }))
                      }}
                    >
                      <option value="video">Video</option>
                      <option value="article">Article</option>
                      <option value="quiz">Quiz</option>
                    </select>
                    <input
                      className="rounded-md border-gray-300"
                      placeholder="Video URL"
                      value={l.video_url}
                      onChange={(e) => {
                        const copy = { ...l, video_url: e.target.value }
                        setLecturesBySection((prev) => ({
                          ...prev,
                          [s.id]: prev[s.id].map((x) => (x.id === l.id ? copy : x)),
                        }))
                      }}
                    />
                    <input
                      className="rounded-md border-gray-300"
                      placeholder="Duration (sec)"
                      type="number"
                      value={l.duration_seconds}
                      onChange={(e) => {
                        const copy = { ...l, duration_seconds: e.target.value }
                        setLecturesBySection((prev) => ({
                          ...prev,
                          [s.id]: prev[s.id].map((x) => (x.id === l.id ? copy : x)),
                        }))
                      }}
                    />
                    <label className="inline-flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={l.is_preview}
                        onChange={(e) => {
                          const copy = { ...l, is_preview: e.target.checked }
                          setLecturesBySection((prev) => ({
                            ...prev,
                            [s.id]: prev[s.id].map((x) => (x.id === l.id ? copy : x)),
                          }))
                        }}
                      />
                      <span className="text-sm">Preview</span>
                    </label>
                    <textarea
                      className="rounded-md border-gray-300 md:col-span-6"
                      placeholder="Article text (if article)"
                      value={l.article_text}
                      onChange={(e) => {
                        const copy = { ...l, article_text: e.target.value }
                        setLecturesBySection((prev) => ({
                          ...prev,
                          [s.id]: prev[s.id].map((x) => (x.id === l.id ? copy : x)),
                        }))
                      }}
                    />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-end">
        <button onClick={handleCreate} className="px-4 py-2 rounded-md bg-accent text-white">
          Save Course
        </button>
      </div>
    </div>
  )
}
