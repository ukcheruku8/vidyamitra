export default function Page() {
  return (
    <main className="min-h-[60vh] flex flex-col items-center justify-center gap-6 p-6">
      <h1 className="text-3xl font-semibold text-center">Multi-Tenant LMS</h1>
      <p className="text-gray-600 max-w-xl text-center">
        This project includes a complete backend (Express + PostgreSQL) and a frontend (React + Tailwind). Use the
        README in the repository for setup instructions.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-2xl">
        <div className="border rounded-lg p-4 bg-white">
          <h2 className="font-medium mb-2">Backend</h2>
          <ul className="text-sm text-gray-700 list-disc pl-5 space-y-1">
            <li>Express API with JWT auth, OTP mock, and PostgreSQL</li>
            <li>Run at http://localhost:4000</li>
            <li>See backend/.env.example for environment variables</li>
          </ul>
        </div>
        <div className="border rounded-lg p-4 bg-white">
          <h2 className="font-medium mb-2">Frontend</h2>
          <ul className="text-sm text-gray-700 list-disc pl-5 space-y-1">
            <li>React + react-router + axios + Tailwind</li>
            <li>Dev server at http://localhost:5173</li>
            <li>Connects to backend at /api</li>
          </ul>
        </div>
      </div>
      <div className="text-sm text-gray-500">Open README.md for end-to-end instructions.</div>
    </main>
  )
}
