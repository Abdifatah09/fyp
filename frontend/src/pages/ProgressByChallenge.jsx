import { useEffect, useMemo, useState } from "react";
import { progressService } from "../services/progressService";

export default function ProgressByChallenge() {
  const [rows, setRows] = useState([]);
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");

  useEffect(() => {
    progressService
      .getByChallenge()
      .then((data) => setRows(Array.isArray(data) ? data : []))
      .catch((e) => setErr(e?.message || "Failed to load challenge progress"))
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    if (!query) return rows;
    return rows.filter((r) => String(r.challengeId).toLowerCase().includes(query));
  }, [rows, q]);

  if (loading) return <div className="p-6">Loading...</div>;
  if (err) return <div className="p-6 text-red-600">{err}</div>;

  return (
    <div className="p-6 space-y-4">
      <div>
        <h1 className="text-2xl font-bold">Progress by Challenge</h1>
        <p className="text-gray-600 text-sm">Attempts and accuracy for each challenge</p>
      </div>

      <input
        className="w-full sm:w-96 border rounded-lg px-3 py-2"
        placeholder="Search by challenge ID..."
        value={q}
        onChange={(e) => setQ(e.target.value)}
      />

      <div className="overflow-x-auto rounded-xl border bg-white">
        <table className="min-w-full text-left">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-sm font-semibold text-gray-700">Challenge ID</th>
              <th className="px-4 py-3 text-sm font-semibold text-gray-700">Attempts</th>
              <th className="px-4 py-3 text-sm font-semibold text-gray-700">Correct</th>
              <th className="px-4 py-3 text-sm font-semibold text-gray-700">Accuracy</th>
              <th className="px-4 py-3 text-sm font-semibold text-gray-700">Status</th>
              <th className="px-4 py-3 text-sm font-semibold text-gray-700">Last Attempt</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td className="px-4 py-4 text-gray-500" colSpan={6}>
                  No challenges found.
                </td>
              </tr>
            ) : (
              filtered.map((r) => (
                <tr key={r.challengeId} className="border-t">
                  <td className="px-4 py-3 text-sm font-medium">{r.challengeId}</td>
                  <td className="px-4 py-3 text-sm">{r.attempts}</td>
                  <td className="px-4 py-3 text-sm">{r.correct}</td>
                  <td className="px-4 py-3 text-sm">{r.accuracy}%</td>
                  <td className="px-4 py-3 text-sm">
                    <span className={r.completed ? "text-green-600 font-semibold" : "text-gray-600"}>
                      {r.completed ? "Completed" : "Not completed"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm">
                    {r.lastAttemptAt ? new Date(r.lastAttemptAt).toLocaleString() : "-"}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
