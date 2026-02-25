import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { subjectService } from "../services/subjectService";
import { difficultyService } from "../services/difficultyService";
import { sectionService } from "../services/sectionService";
import { useAuth } from "../context/AuthContext";
import { motion } from "framer-motion";
import logo from "../assets/logo.png";

const page = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: 0.25 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 14 },
  show: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, delay: 0.08 * i, ease: "easeOut" },
  }),
};

const inViewFadeUp = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: "easeOut" } },
};

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

  const subjectDifficulties = useMemo(
    () => difficulties.filter((d) => d.subjectId === activeSubject?.id),
    [difficulties, activeSubject]
  );

  const difficultySections = useMemo(
    () => sections.filter((s) => s.difficultyId === activeDifficulty?.id),
    [sections, activeDifficulty]
  );

  if (loading) {
    return <div className="p-8 text-gray-600">Loading curriculum...</div>;
  }

  if (error) {
    return <div className="p-8 text-red-600">{error}</div>;
  }

  return (
    <motion.div
      variants={page}
      initial="hidden"
      animate="show"
      className="space-y-16 pb-24"
    >
      {/* HERO */}
      <section className="bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white">
        <div className="max-w-6xl mx-auto px-6 py-20">
          <div className="grid items-center gap-10 lg:grid-cols-2">
            {/* Left: Text */}
            <div>
              <motion.h1
                variants={fadeUp}
                initial="hidden"
                animate="show"
                custom={0}
                className="text-4xl sm:text-5xl font-bold tracking-tight"
              >
                Learn to Code.<br />
                <span className="text-blue-400">One Path at a Time.</span>
              </motion.h1>

              <motion.p
                variants={fadeUp}
                initial="hidden"
                animate="show"
                custom={1}
                className="mt-6 max-w-xl text-white/80 text-lg"
              >
                HackPath guides you through structured coding challenges — from
                fundamentals to advanced concepts — with clear progress tracking.
              </motion.p>

              <motion.div
                variants={fadeUp}
                initial="hidden"
                animate="show"
                custom={2}
                className="mt-8 flex flex-wrap gap-4 justify-center sm:justify-start"
              >
                {user ? (
                  <motion.button
                    whileHover={{ y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => navigate("/dashboard")}
                    className="rounded-lg bg-blue-600 px-6 py-3 font-semibold hover:bg-blue-700 transition"
                  >
                    Go to Dashboard
                  </motion.button>
                ) : (
                  <>
                    <motion.button
                      whileHover={{ y: -2 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => navigate("/register")}
                      className="rounded-lg bg-blue-600 px-6 py-3 font-semibold hover:bg-blue-700 transition"
                    >
                      Get Started
                    </motion.button>
                    <motion.button
                      whileHover={{ y: -2 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => navigate("/login")}
                      className="rounded-lg border border-white/20 px-6 py-3 font-semibold hover:bg-white/10 transition"
                    >
                      Log In
                    </motion.button>
                  </>
                )}
              </motion.div>
            </div>

            {/* Right: Image */}
            <motion.div
              variants={fadeUp}
              initial="hidden"
              animate="show"
              custom={3}
              className="flex justify-center lg:justify-end"
            >
              <div className="relative w-full max-w-lg">
                {/* glow */}
                <motion.div
                  aria-hidden
                  className="absolute -inset-5 rounded-3xl bg-blue-500/20 blur-3xl"
                  animate={{ opacity: [0.45, 0.75, 0.45] }}
                  transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }}
                />
                <motion.img
                  src="https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=900&fit=crop"
                  // src= {logo}
                  alt="Gamified Coding Platform"
                  className="relative w-full rounded-3xl border border-white/10 shadow-2xl object-cover aspect-[4/3]"
                  loading="lazy"
                  whileHover={{ scale: 1.01 }}
                  transition={{ duration: 0.2 }}
                />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* SUBJECTS */}
      <motion.section
        variants={inViewFadeUp}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.2 }}
        className="max-w-6xl mx-auto px-6 space-y-6"
      >
        <div>
          <h2 className="text-2xl font-bold">Choose a Subject</h2>
          <p className="mt-2 text-gray-600">
            Select a subject to see its difficulty levels.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {subjects.map((s, i) => (
            <motion.button
              key={s.id}
              onClick={() => {
                setActiveSubject(s);
                setActiveDifficulty(null);
              }}
              whileHover={{ y: -3 }}
              whileTap={{ scale: 0.99 }}
              transition={{ duration: 0.15 }}
              className={`rounded-xl border p-6 text-left transition ${
                activeSubject?.id === s.id
                  ? "border-blue-600 ring-1 ring-blue-600"
                  : "hover:border-gray-300"
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <h3 className="font-semibold text-lg">{s.name}</h3>
                {activeSubject?.id === s.id && (
                  <span className="shrink-0 inline-flex items-center rounded-full border border-blue-200 bg-blue-50 px-2 py-0.5 text-xs font-semibold text-blue-700">
                    Selected
                  </span>
                )}
              </div>
              <p className="mt-2 text-sm text-gray-600">
                {s.description || "Explore this subject"}
              </p>
            </motion.button>
          ))}
        </div>
      </motion.section>

      {/* DIFFICULTIES */}
      {activeSubject && (
        <motion.section
          variants={inViewFadeUp}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.2 }}
          className="max-w-6xl mx-auto px-6 space-y-6"
        >
          <div>
            <h2 className="text-2xl font-bold">
              Difficulty Levels — {activeSubject.name}
            </h2>
            <p className="mt-2 text-gray-600">
              Pick a difficulty to reveal the sections inside this path.
            </p>
          </div>

          <div className="flex flex-wrap gap-4">
            {subjectDifficulties.map((d) => (
              <motion.button
                key={d.id}
                onClick={() => setActiveDifficulty(d)}
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.98 }}
                transition={{ duration: 0.15 }}
                className={`rounded-lg px-5 py-3 border font-medium transition ${
                  activeDifficulty?.id === d.id
                    ? "bg-blue-600 text-white border-blue-600"
                    : "hover:bg-gray-100"
                }`}
              >
                {d.name}
              </motion.button>
            ))}
          </div>
        </motion.section>
      )}

      {/* SECTIONS */}
      {activeDifficulty && (
        <motion.section
          variants={inViewFadeUp}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.2 }}
          className="max-w-6xl mx-auto px-6 space-y-6"
        >
          <div>
            <h2 className="text-2xl font-bold">
              What You’ll Learn — {activeDifficulty.name}
            </h2>
            <p className="mt-2 text-gray-600">
              Each section contains multiple challenges to complete.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {difficultySections.map((sec) => (
              <motion.div
                key={sec.id}
                whileHover={{ y: -3 }}
                transition={{ duration: 0.15 }}
                className="rounded-xl border p-6 flex flex-col justify-between bg-white"
              >
                <div>
                  <h3 className="font-semibold">{sec.title}</h3>
                  <p className="mt-2 text-sm text-gray-600">
                    Section challenges and exercises
                  </p>
                </div>

                <motion.button
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    if (!user) {
                      navigate("/login");
                    } else {
                      navigate(`/progress/sections/${sec.id}`);
                    }
                  }}
                  className="mt-6 text-left text-sm font-semibold text-blue-600 hover:underline"
                >
                  {user ? "View Section" : "Log in to start"}
                </motion.button>
              </motion.div>
            ))}
          </div>
        </motion.section>
      )}

      {/* FOOTER CTA */}
      {!user && (
        <motion.section
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.45, ease: "easeOut" }}
          className="bg-gray-50 border-t"
        >
          <div className="max-w-6xl mx-auto px-6 py-16 text-center">
            <h2 className="text-3xl font-bold">Ready to start learning?</h2>
            <p className="mt-4 text-gray-600">
              Create an account to track progress, complete challenges, and
              unlock your learning path.
            </p>
            <motion.button
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate("/register")}
              className="mt-6 rounded-lg bg-blue-600 px-8 py-3 font-semibold text-white hover:bg-blue-700 transition"
            >
              Create Account
            </motion.button>
          </div>
        </motion.section>
      )}
    </motion.div>
  );
}