import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { subjectService } from "../services/subjectService";
import { difficultyService } from "../services/difficultyService";
import { sectionService } from "../services/sectionService";
import { useAuth } from "../context/AuthContext";
import logo from "../assets/logo.png";

export default function Home() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [subjects, setSubjects] = useState([]);
  const [difficulties, setDifficulties] = useState([]);
  const [sections, setSections] = useState([]);

  const [activeSubject, setActiveSubject] = useState(null);
  const [activeDifficulty, setActiveDifficulty] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const [subs, diffs, secs] = await Promise.all([
          subjectService.getAll(),
          difficultyService.getAll(),
          sectionService.getAll(),
        ]);

        setSubjects(subs);
        setDifficulties(diffs);
        setSections(secs);
      } catch (err) {
        setError("Failed to load curriculum");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const subjectDifficulties = difficulties.filter(
    (d) => d.subjectId === activeSubject?.id
  );

  const difficultySections = sections.filter(
    (s) => s.difficultyId === activeDifficulty?.id
  );

  if (loading) {
    return <div className="p-8 text-gray-600">Loading curriculum...</div>;
  }

  if (error) {
    return <div className="p-8 text-red-600">{error}</div>;
  }

  return (
    <div className="space-y-16 pb-24">
          {/* HERO */}
      <section className="bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white">
        <div className="max-w-6xl mx-auto px-6 py-20">
          <div className="grid items-center gap-10 lg:grid-cols-2">
            {/* Left: Text */}
            <div>
              <h1 className="text-4xl sm:text-5xl font-bold tracking-tight">
                Learn to Code.<br />
                <span className="text-blue-400">One Path at a Time.</span>
              </h1>

              <p className="mt-6 max-w-xl text-white/80 text-lg">
                HackPath guides you through structured coding challenges — from
                fundamentals to advanced concepts — with clear progress tracking.
              </p>

              <div className="mt-8 flex flex-wrap gap-4 justify-center sm:justify-start">
                {user ? (
                  <button
                    onClick={() => navigate("/dashboard")}
                    className="rounded-lg bg-blue-600 px-6 py-3 font-semibold hover:bg-blue-700 transition"
                  >
                    Go to Dashboard
                  </button>
                ) : (
                  <>
                    <button
                      onClick={() => navigate("/register")}
                      className="rounded-lg bg-blue-600 px-6 py-3 font-semibold hover:bg-blue-700 transition"
                    >
                      Get Started
                    </button>
                    <button
                      onClick={() => navigate("/login")}
                      className="rounded-lg border border-white/20 px-6 py-3 font-semibold hover:bg-white/10 transition"
                    >
                      Log In
                    </button>
                  </>
                )}
              </div>
            </div>

      {/* Right: Image */}
      <div className="flex justify-center lg:justify-end">
        <div className="relative w-full max-w-lg">
          {/* glow */}
          <div className="absolute -inset-5 rounded-3xl bg-blue-500/20 blur-3xl" />

          <img
            src="https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=900&fit=crop"
            // src= {logo}
            alt="Gamified Coding Platform"
            className="relative w-full rounded-3xl border border-white/10 shadow-2xl object-cover aspect-[4/3]"
            loading="lazy"
          />
        </div>
      </div>
    </div>
  </div>
</section>


      {/* SUBJECTS */}
      <section className="max-w-6xl mx-auto px-6 space-y-6">
        <h2 className="text-2xl font-bold">Choose a Subject</h2>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {subjects.map((s) => (
            <button
              key={s.id}
              onClick={() => {
                setActiveSubject(s);
                setActiveDifficulty(null);
              }}
              className={`rounded-xl border p-6 text-left transition ${
                activeSubject?.id === s.id
                  ? "border-blue-600 ring-1 ring-blue-600"
                  : "hover:border-gray-300"
              }`}
            >
              <h3 className="font-semibold text-lg">{s.name}</h3>
              <p className="mt-2 text-sm text-gray-600">
                {s.description || "Explore this subject"}
              </p>
            </button>
          ))}
        </div>
      </section>

      {/* DIFFICULTIES */}
      {activeSubject && (
        <section className="max-w-6xl mx-auto px-6 space-y-6">
          <h2 className="text-2xl font-bold">
            Difficulty Levels — {activeSubject.name}
          </h2>

          <div className="flex flex-wrap gap-4">
            {subjectDifficulties.map((d) => (
              <button
                key={d.id}
                onClick={() => setActiveDifficulty(d)}
                className={`rounded-lg px-5 py-3 border font-medium transition ${
                  activeDifficulty?.id === d.id
                    ? "bg-blue-600 text-white border-blue-600"
                    : "hover:bg-gray-100"
                }`}
              >
                {d.name}
              </button>
            ))}
          </div>
        </section>
      )}

      {/* SECTIONS */}
      {activeDifficulty && (
        <section className="max-w-6xl mx-auto px-6 space-y-6">
          <h2 className="text-2xl font-bold">
            What You’ll Learn — {activeDifficulty.name}
          </h2>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {difficultySections.map((sec) => (
              <div
                key={sec.id}
                className="rounded-xl border p-6 flex flex-col justify-between"
              >
                <div>
                  <h3 className="font-semibold">{sec.title}</h3>
                  <p className="mt-2 text-sm text-gray-600">
                    Section challenges and exercises
                  </p>
                </div>

                <button
                  onClick={() => {
                    if (!user) {
                      navigate("/login");
                    } else {
                      navigate(`/progress/sections/${sec.id}`);
                    }
                  }}
                  className="mt-6 text-sm font-semibold text-blue-600 hover:underline"
                >
                  {user ? "View Section" : "Log in to start"}
                </button>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* FOOTER CTA */}
      {!user && (
        <section className="bg-gray-50 border-t">
          <div className="max-w-6xl mx-auto px-6 py-16 text-center">
            <h2 className="text-3xl font-bold">Ready to start learning?</h2>
            <p className="mt-4 text-gray-600">
              Create an account to track progress, complete challenges, and
              unlock your learning path.
            </p>
            <button
              onClick={() => navigate("/register")}
              className="mt-6 rounded-lg bg-blue-600 px-8 py-3 font-semibold text-white hover:bg-blue-700 transition"
            >
              Create Account
            </button>
          </div>
        </section>
      )}
    </div>
  );
}
