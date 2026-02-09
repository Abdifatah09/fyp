import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { progressService } from "../services/progressService";

export default function DifficultiesProgress() {
  const [rows, setRows] = useState([]);
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");

  useEffect(() => {
    progressService
      .getDifficultiesProgress()
      .then((data) => setRows(Array.isArray(data) ? data : []))
      .catch((e) => setErr(e?.message || "Failed to load difficulties progress"))
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    if (!query) return rows;
    return rows; return rows.filter((r) => {
      const dn = (r.difficultyName || "").toLowerCase();
      const sn = (r.subjectName || "").toLowerCase();
      return dn.includes(query) || sn.includes(query);
    });
  }, [rows, q]);

  if (loading) return <div className="p-6">Loading...</div>;
  if (err) return <div className="p-6 text-red-600">{err}</div>;

  return (
    <div className="p-6 space-y-4">
      <div>
        <h1 className="text-2xl font-bold">Difficulties Progress</h1>
        <p className="text-gray-600 text-sm">Completion by difficulty (under a subject)</p>
      </div>

      <input
        className="w-full sm:w-96 border rounded-lg px-3 py-2"
        placeholder="Search subject or difficulty..."
        value={q}
        onChange={(e) => setQ(e.target.value)}
      />

      <div className="overflow-x-auto rounded-xl border bg-white">
        <table className="min-w-full text-left">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-sm font-semibold text-gray-700">Subject</th>
              <th className="px-4 py-3 text-sm font-semibold text-gray-700">Difficulty</th>
              <th className="px-4 py-3 text-sm font-semibold text-gray-700">Completed</th>
              <th className="px-4 py-3 text-sm font-semibold text-gray-700">Total</th>
              <th className="px-4 py-3 text-sm font-semibold text-gray-700">Completion</th>
              <th className="px-4 py-3 text-sm font-semibold text-gray-700">Open</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td className="px-4 py-4 text-gray-500" colSpan={6}>
                  No difficulties found.
                </td>
              </tr>
            ) : (
              filtered.map((r) => (
                <tr key={r.difficultyId} className="border-t">
                  <td className="px-4 py-3 text-sm">{r.subjectName || "-"}</td>
                  <td className="px-4 py-3 text-sm font-medium">{r.difficultyName}</td>
                  <td className="px-4 py-3 text-sm">{r.completedChallenges}</td>
                  <td className="px-4 py-3 text-sm">{r.totalChallenges}</td>
                  <td className="px-4 py-3 text-sm">{r.completionPercent}%</td>
                  <td className="px-4 py-3 text-sm">
                    <Link
                      className="text-blue-600 hover:underline"
                      to={`/progress/difficulties/${r.difficultyId}`}
                    >
                      View
                    </Link>
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
