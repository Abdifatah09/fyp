import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Editor from "@monaco-editor/react";
import { challengeService } from "../services/challengeService";
import { judgeService } from "../services/judgeService";

const normalize = (s) => String(s ?? "").replace(/\r\n/g, "\n").trim();

function judge0ToMonaco(languageId) {
  const id = Number(languageId);
  if (id === 91) return "java";
  if (id === 102) return "javascript";
  return "plaintext";
}

function languageLabel(languageId) {
  const id = Number(languageId);
  if (id === 91) return "Java";
  if (id === 102) return "JavaScript";
  return `Lang ${languageId}`;
}

export default function SolveChallenge() {
  const { id } = useParams(); // challengeId
  const navigate = useNavigate();

  const [challenge, setChallenge] = useState(null);
  const [code, setCode] = useState("");
  const [stdin, setStdin] = useState("");

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [err, setErr] = useState("");

  const [result, setResult] = useState(null);
  const [activeTab, setActiveTab] = useState("stdout"); // stdout | stderr | compile

  const monacoLang = useMemo(
    () => judge0ToMonaco(challenge?.languageId),
    [challenge?.languageId]
  );

  useEffect(() => {
    (async () => {
      try {
        setErr("");
        setLoading(true);
        setResult(null);

        const data = await challengeService.getById(id);
        setChallenge(data);

        setCode(data?.starterCode || "");
        setStdin("");
      } catch (e) {
        setErr(e?.response?.data?.message || "Failed to load challenge");
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const onSubmit = async () => {
    if (!challenge?.id) return;

    setSubmitting(true);
    setErr("");
    setResult(null);

    try {
      const res = await judgeService.submit({
        challengeId: challenge.id,
        languageId: challenge.languageId,
        sourceCode: code,
        stdin,
      });

      setResult(res);

      // auto switch to relevant tab if there is an error
      const hasCompile = normalize(res?.run?.compile_output);
      const hasStderr = normalize(res?.run?.stderr);
      if (hasCompile) setActiveTab("compile");
      else if (hasStderr) setActiveTab("stderr");
      else setActiveTab("stdout");
    } catch (e) {
      setErr(e?.response?.data?.message || "Submit failed");
    } finally {
      setSubmitting(false);
    }
  };

  const verdict = useMemo(() => {
    if (!result) return null;
    if (result?.gradable === false) return { text: "Ungradable", tone: "amber" };
    if (result?.isCorrect) return { text: "Correct ✅", tone: "green" };
    return { text: "Incorrect ❌", tone: "red" };
  }, [result]);

  const outputValue = useMemo(() => {
    if (!result) return "";
    if (activeTab === "stderr") return normalize(result?.run?.stderr);
    if (activeTab === "compile") return normalize(result?.run?.compile_output);
    return normalize(result?.run?.stdout);
  }, [result, activeTab]);

  const tabButton = (key, label) => {
    const isActive = activeTab === key;
    return (
      <button
        type="button"
        onClick={() => setActiveTab(key)}
        className={`rounded-lg px-3 py-1.5 text-sm font-semibold border transition ${
          isActive
            ? "bg-slate-900 text-white border-slate-900"
            : "hover:bg-gray-50"
        }`}
      >
        {label}
      </button>
    );
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="max-w-6xl mx-auto">
          <div className="rounded-2xl border p-6 animate-pulse">
            <div className="h-6 w-1/2 bg-gray-200 rounded" />
            <div className="mt-3 h-4 w-2/3 bg-gray-200 rounded" />
            <div className="mt-6 h-[420px] bg-gray-200 rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  if (err) {
    return (
      <div className="p-6">
        <div className="max-w-3xl mx-auto rounded-2xl border p-6">
          <p className="text-red-600 font-semibold">{err}</p>
          <button
            onClick={() => navigate(-1)}
            className="mt-4 rounded-lg border px-4 py-2 font-semibold hover:bg-gray-50 transition"
          >
            Back
          </button>
        </div>
      </div>
    );
  }

  if (!challenge) {
    return (
      <div className="p-6">
        <div className="max-w-3xl mx-auto rounded-2xl border p-6">
          <p className="font-semibold">Challenge not found</p>
          <button
            onClick={() => navigate(-1)}
            className="mt-4 rounded-lg border px-4 py-2 font-semibold hover:bg-gray-50 transition"
          >
            Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Top header */}
        <div className="rounded-2xl border bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-slate-900 text-white px-3 py-1 text-xs font-semibold">
                  {languageLabel(challenge.languageId)}
                </span>

                {verdict && (
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold border ${
                      verdict.tone === "green"
                        ? "bg-green-50 text-green-700 border-green-200"
                        : verdict.tone === "red"
                        ? "bg-red-50 text-red-700 border-red-200"
                        : "bg-amber-50 text-amber-800 border-amber-200"
                    }`}
                  >
                    {verdict.text}
                  </span>
                )}

                {result?.run?.time && (
                  <span className="rounded-full px-3 py-1 text-xs font-semibold bg-gray-50 border text-gray-700">
                    {result.run.time}s
                  </span>
                )}
                {result?.run?.memory && (
                  <span className="rounded-full px-3 py-1 text-xs font-semibold bg-gray-50 border text-gray-700">
                    {result.run.memory} KB
                  </span>
                )}
              </div>

              <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
                {challenge.title}
              </h1>
              <p className="text-gray-600">{challenge.description}</p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => navigate(-1)}
                className="rounded-lg border px-4 py-2 font-semibold hover:bg-gray-50 transition"
              >
                Back
              </button>

              <button
                onClick={onSubmit}
                disabled={submitting}
                className="rounded-lg bg-blue-600 px-5 py-2 font-semibold text-white hover:bg-blue-700 disabled:opacity-60 transition"
              >
                {submitting ? "Marking..." : "Submit"}
              </button>
            </div>
          </div>
        </div>

        {/* Main grid */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Left: editor + outputs */}
          <div className="xl:col-span-2 space-y-6">
            {/* Instructions */}
            <div className="rounded-2xl border bg-white p-6 shadow-sm">
              <h2 className="text-lg font-semibold">Instructions</h2>
              <pre className="mt-3 whitespace-pre-wrap text-sm text-gray-800 leading-relaxed">
                {challenge.instructions}
              </pre>
            </div>

            {/* Editor */}
            <div className="rounded-2xl border bg-white shadow-sm overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 border-b bg-gray-50">
                <p className="text-sm font-semibold text-gray-700">Editor</p>
                <div className="text-xs text-gray-500">
                  Auto-saved in state • Submit to get marked
                </div>
              </div>

              <Editor
                height="520px"
                language={monacoLang}
                value={code}
                onChange={(v) => setCode(v || "")}
                options={{
                  minimap: { enabled: false },
                  fontSize: 14,
                  scrollBeyondLastLine: false,
                  wordWrap: "on",
                  automaticLayout: true,
                }}
              />
            </div>

            {/* Output */}
            <div className="rounded-2xl border bg-white p-6 shadow-sm">
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                  <h2 className="text-lg font-semibold">Output</h2>
                  <p className="text-sm text-gray-600">
                    See what your code produced (and any errors).
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  {tabButton("stdout", "stdout")}
                  {tabButton("stderr", "stderr")}
                  {tabButton("compile", "compile")}
                </div>
              </div>

              <div className="mt-4 rounded-xl border bg-gray-50 p-4">
                <pre className="whitespace-pre-wrap text-sm text-gray-800 min-h-[120px]">
                  {outputValue || "—"}
                </pre>
              </div>

              {result?.feedback && (
                <div className="mt-4 rounded-xl border p-4">
                  <p className="font-semibold">Feedback</p>
                  <pre className="mt-2 whitespace-pre-wrap text-sm text-gray-800">
                    {result.feedback}
                  </pre>
                </div>
              )}
            </div>
          </div>

          {/* Right: stdin + help */}
          <div className="space-y-6">
            <div className="rounded-2xl border bg-white p-6 shadow-sm">
              <h2 className="text-lg font-semibold">Input (stdin)</h2>
              <p className="text-sm text-gray-600 mt-1">
                Leave empty unless the challenge expects input.
              </p>
              <textarea
                className="mt-3 w-full rounded-xl border p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600/30"
                rows={10}
                value={stdin}
                onChange={(e) => setStdin(e.target.value)}
                placeholder="Example:\n5\n10\n"
              />
            </div>
        

            {result?.expectedOutput && (
              <div className="rounded-2xl border bg-white p-6 shadow-sm">
                <h2 className="text-lg font-semibold">Expected Output</h2>
                <div className="mt-3 rounded-xl border bg-gray-50 p-4">
                  <pre className="whitespace-pre-wrap text-sm text-gray-800">
                    {normalize(result.expectedOutput) || "—"}
                  </pre>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Bottom spacer */}
        <div className="h-6" />
      </div>
    </div>
  );
}
