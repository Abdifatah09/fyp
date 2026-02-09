import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { progressService } from "../services/progressService";

export default function SectionsProgress() {
  const [rows, setRows] = useState([]);
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");

  useEffect(() => {
    progressService
      .getSectionsProgress()
      .then((data) => setRows(Array.isArray(data) ? data : []))
      .catch((e) => setErr(e?.message || "Failed to load sections progress"))
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    if (!query) return rows;
    return rows.filter((r) => {
      const sn = (r.sectionName || "").toLowerCase();
      const dn = (r.difficultyName || "").toLowerCase();
      return sn.includes(query) || dn.includes(query);
    });
  }, [rows, q]);

  if (loading) return <div className="p-6">Loading...</div>;
  if (err) return <div className="p-6 text-red-600">{err}</div>;

  return (
    <div className="p-6 space-y-4">
      <div>
        <h1 className="text-2xl font-bold">Sections Progress</h1>
        <p className="text-gray-600 text-sm">Completion by section</p>
      </div>

      <input
        className="w-full sm:w-96 border rounded-lg px-3 py-2"
        placeholder="Search section or difficulty..."
        value={q}
        onChange={(e) => setQ(e.target.value)}
      />

      <div className="overflow-x-auto rounded-xl border bg-white">
        <table className="min-w-full text-left">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-sm font-semibold text-gray-700">Difficulty</th>
              <th className="px-4 py-3 text-sm font-semibold text-gray-700">Section</th>
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
                  No sections found.
                </td>
              </tr>
            ) : (
              filtered.map((r) => (
                <tr key={r.sectionId} className="border-t">
                  <td className="px-4 py-3 text-sm">{r.difficultyName || "-"}</td>
                  <td className="px-4 py-3 text-sm font-medium">{r.sectionName}</td>
                  <td className="px-4 py-3 text-sm">{r.completedChallenges}</td>
                  <td className="px-4 py-3 text-sm">{r.totalChallenges}</td>
                  <td className="px-4 py-3 text-sm">{r.completionPercent}%</td>
                  <td className="px-4 py-3 text-sm">
                    <Link className="text-blue-600 hover:underline" to={`/progress/sections/${r.sectionId}`}>
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
