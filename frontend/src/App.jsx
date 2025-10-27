import { useState } from "react";
import Editor from "@monaco-editor/react";

export default function App() {
  const [code, setCode] = useState('print("Hello, world!")');

  const run = () => {
    alert("Wire this to backend: POST /api/judge0/execute");
  };

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="mx-auto max-w-4xl space-y-4">
        <h1 className="text-3xl font-bold">FYP – Gamified Coding Platform</h1>
        <p className="text-slate-600">React + JSX + Tailwind 3.3.3 + Monaco</p>

        <div className="rounded-xl border shadow-sm">
          <Editor
            height="50vh"
            defaultLanguage="python"
            value={code}
            onChange={(v) => setCode(v || "")}
          />
        </div>

        <button
          onClick={run}
          className="rounded-lg bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700"
        >
          Run
        </button>
      </div>
    </div>
  );
}
