import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { adminAnalyticsService } from "../services/adminAnalyticsService";

export default function AdminAnalytics() {
  const navigate = useNavigate();
  const { user, isReady } = useAuth();

  const isAdmin = useMemo(() => user?.role === "admin", [user]);

  const [days, setDays] = useState(30);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [overview, setOverview] = useState(null);
  const [daily, setDaily] = useState([]);
  const [hardest, setHardest] = useState([]);
  const [avgAttempts, setAvgAttempts] = useState(null);
  const [avgTime, setAvgTime] = useState(null);

  /* ---------- Guard ---------- */
  useEffect(() => {
    if (!isReady) return;
    if (!user) navigate("/login");
    else if (user.role !== "admin") navigate("/");
  }, [isReady, user, navigate]);

  /* ---------- Load ---------- */
  useEffect(() => {
    if (!isReady || !isAdmin) return;
    load();
    // eslint-disable-next-line
  }, [isReady, isAdmin, days]);

  async function load() {
    try {
      setLoading(true);
      setError("");

      const [
        ov,
        dly,
        hard,
        avgAtt,
        avgT,
      ] = await Promise.all([
        adminAnalyticsService.getOverview(days),
        adminAnalyticsService.getDailyAttempts(days),
        adminAnalyticsService.getHardestChallenges(days),
        adminAnalyticsService.getAvgAttemptsUntilSuccess(days),
        adminAnalyticsService.getAvgTimeToComplete(days),
      ]);

      setOverview(ov);
      setDaily(dly?.data || []);
      setHardest(hard?.data || []);
      setAvgAttempts(avgAtt);
      setAvgTime(avgT);

    } catch (e) {
      setError(e?.response?.data?.message || "Failed to load analytics");
    } finally {
      setLoading(false);
    }
  }

  if (!isReady || !user || !isAdmin) return null;

  return (
    <div className="min-h-[calc(100vh-64px)] bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 py-6 space-y-6">

        {/* Header */}
        <div className="flex justify-between items-center">
          <h1 className="text-lg font-semibold text-gray-900">
            Analytics Dashboard
          </h1>

          <select
            value={days}
            onChange={(e) => setDays(Number(e.target.value))}
            className="rounded-lg border border-gray-200 px-3 py-2 text-sm"
          >
            <option value={7}>Last 7 days</option>
            <option value={30}>Last 30 days</option>
            <option value={90}>Last 90 days</option>
          </select>
        </div>

        {error && (
          <div className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg p-3">
            {error}
          </div>
        )}

        {/* KPI Cards */}
        <div className="grid grid-cols-3 gap-4">
          <KPI title="New Users" value={overview?.kpis?.newUsers} />
          <KPI title="Active Users" value={overview?.kpis?.activeUsers} />
          <KPI title="Accuracy %" value={overview?.kpis?.accuracy} />
          <KPI title="Attempts" value={overview?.kpis?.attemptsTotal} />
          <KPI title="Correct Attempts" value={overview?.kpis?.correctTotal} />
          <KPI
            title="Avg Attempts Until Success"
            value={
              avgAttempts?.avgAttemptsUntilSuccess
                ? avgAttempts.avgAttemptsUntilSuccess.toFixed(2)
                : "—"
            }
          />
          <KPI
            title="Avg Time To Complete (mins)"
            value={
              avgTime?.avgMinutes
                ? avgTime.avgMinutes.toFixed(2)
                : "—"
            }
          />
        </div>

        {/* Hardest Challenges */}
        <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
          <h2 className="text-sm font-semibold text-gray-900 mb-3">
            Hardest Challenges
          </h2>

          {loading ? (
            <div className="text-sm text-gray-500">Loading...</div>
          ) : hardest.length === 0 ? (
            <div className="text-sm text-gray-500">No data.</div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-500 border-b">
                  <th className="py-2">Title</th>
                  <th>Attempts</th>
                  <th>Correct</th>
                  <th>Accuracy %</th>
                </tr>
              </thead>
              <tbody>
                {hardest.map((h) => (
                  <tr key={h.challengeId} className="border-b">
                    <td className="py-2">{h.title}</td>
                    <td>{h.attempts}</td>
                    <td>{h.correct}</td>
                    <td>{h.accuracy}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

      </div>
    </div>
  );
}

/* ---------- KPI Component ---------- */

function KPI({ title, value }) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
      <div className="text-xs text-gray-500">{title}</div>
      <div className="text-xl font-semibold text-gray-900 mt-1">
        {value ?? "—"}
      </div>
    </div>
  );
}