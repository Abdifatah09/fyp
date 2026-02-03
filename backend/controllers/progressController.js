const ChallengeAttempt = require("../models/challengeAttempt");
const Challenge = require("../models/challenge");
const Section = require("../models/section");
const Difficulty = require("../models/difficulty");
const Subject = require("../models/subject");

const keyOf = (v) => (v === null || v === undefined ? null : String(v));

async function getUserAttempts(userId) {
  return ChallengeAttempt.findAll({
    where: { userId },
    attributes: ["id", "challengeId", "isCorrect", "createdAt"],
    order: [["createdAt", "DESC"]],
  });
}

function buildCompletedChallengeSet(attempts) {
  return new Set(attempts.filter((a) => a.isCorrect).map((a) => keyOf(a.challengeId)));
}

function safeName(obj, fallback) {
  return obj?.name || obj?.title || fallback;
}

async function loadHierarchy() {
  const [subjects, difficulties, sections, challenges] = await Promise.all([
    Subject.findAll({ attributes: ["id", "name"], order: [["createdAt", "ASC"]] }),
    Difficulty.findAll({ attributes: ["id", "name", "subjectId"], order: [["createdAt", "ASC"]] }),
    Section.findAll({ attributes: ["id", "title", "difficultyId", "order"], order: [["order", "ASC"]] }),
    Challenge.findAll({ attributes: ["id", "title", "sectionId", "order"], order: [["order", "ASC"]] }),
  ]);

  const subjectById = new Map(subjects.map((s) => [keyOf(s.id), s]));
  const difficultyById = new Map(difficulties.map((d) => [keyOf(d.id), d]));
  const sectionById = new Map(sections.map((sec) => [keyOf(sec.id), sec]));
  const challengeById = new Map(challenges.map((c) => [keyOf(c.id), c]));

  const difficultiesBySubject = new Map(); 
  for (const d of difficulties) {
    const sid = keyOf(d.subjectId);
    const did = keyOf(d.id);
    if (!sid || !did) continue;
    if (!difficultiesBySubject.has(sid)) difficultiesBySubject.set(sid, []);
    difficultiesBySubject.get(sid).push(did);
  }

  const sectionsByDifficulty = new Map(); 
  for (const sec of sections) {
    const did = keyOf(sec.difficultyId);
    const secId = keyOf(sec.id);
    if (!did || !secId) continue;
    if (!sectionsByDifficulty.has(did)) sectionsByDifficulty.set(did, []);
    sectionsByDifficulty.get(did).push(secId);
  }

  const challengesBySection = new Map(); 
  for (const c of challenges) {
    const secId = keyOf(c.sectionId);
    const cid = keyOf(c.id);
    if (!secId || !cid) continue;
    if (!challengesBySection.has(secId)) challengesBySection.set(secId, []);
    challengesBySection.get(secId).push(cid);
  }

  return {
    subjects,
    difficulties,
    sections,
    challenges,
    subjectById,
    difficultyById,
    sectionById,
    challengeById,
    difficultiesBySubject,
    sectionsByDifficulty,
    challengesBySection,
  };
}

function computeSectionStats(sectionId, challengesBySection, completedChallengeSet) {
  const list = challengesBySection.get(sectionId) || [];
  const total = list.length;
  const completedCount = list.filter((cid) => completedChallengeSet.has(cid)).length;
  const remainingCount = total - completedCount;

  const completionPercent = total === 0 ? 0 : Math.round((completedCount / total) * 100);
  const isFinished = total > 0 && completedCount === total;

  return { total, completedCount, remainingCount, completionPercent, isFinished, challengeIds: list };
}


exports.getMyProgress = async (req, res) => {
  try {
    const userId = req.user.userId;

    const attempts = await getUserAttempts(userId);
    const totalAttempts = attempts.length;
    const totalCorrect = attempts.filter((a) => a.isCorrect).length;
    const accuracy = totalAttempts === 0 ? 0 : Math.round((totalCorrect / totalAttempts) * 100);

    const completedSet = buildCompletedChallengeSet(attempts);

    return res.json({
      totalAttempts,
      totalCorrect,
      accuracy,
      completedChallenges: completedSet.size,
      completedChallengeIds: Array.from(completedSet),
      recentAttempts: attempts.slice(0, 10),
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};

exports.getMyProgressByChallenge = async (req, res) => {
  try {
    const userId = req.user.userId;
    const attempts = await getUserAttempts(userId);

    const map = new Map();

    for (const a of attempts) {
      const cid = keyOf(a.challengeId);
      if (!cid) continue;

      if (!map.has(cid)) {
        map.set(cid, {
          challengeId: cid,
          attempts: 0,
          correct: 0,
          accuracy: 0,
          lastAttemptAt: null,
          completed: false,
        });
      }

      const item = map.get(cid);
      item.attempts += 1;
      if (a.isCorrect) item.correct += 1;
      if (!item.lastAttemptAt) item.lastAttemptAt = a.createdAt; 
      if (a.isCorrect) item.completed = true;
    }

    const data = Array.from(map.values()).map((x) => ({
      ...x,
      accuracy: x.attempts === 0 ? 0 : Math.round((x.correct / x.attempts) * 100),
    }));

    data.sort((a, b) => new Date(b.lastAttemptAt) - new Date(a.lastAttemptAt));
    return res.json(data);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};

exports.getProgressBySection = async (req, res) => {
  try {
    const userId = req.user.userId;

    const attempts = await getUserAttempts(userId);
    const completedSet = buildCompletedChallengeSet(attempts);

    const {
      sections,
      difficulties,
      challengesBySection,
      difficultyById,
    } = await loadHierarchy();

    const result = [];

    for (const sec of sections) {
      const sectionId = keyOf(sec.id);
      const difficultyId = keyOf(sec.difficultyId);

      const stats = computeSectionStats(sectionId, challengesBySection, completedSet);
      const diff = difficultyById.get(difficultyId);

      result.push({
        sectionId,
        sectionName: safeName(sec, `Section ${sectionId}`),
        difficultyId,
        difficultyName: diff ? diff.name : null,
        totalChallenges: stats.total,
        completedChallenges: stats.completedCount,
        remainingChallenges: stats.remainingCount,
        completionPercent: stats.completionPercent,
        isFinished: stats.isFinished,
      });
    }

    return res.json(result);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};

exports.getSectionDetail = async (req, res) => {
  try {
    const userId = req.user.userId;
    const sectionId = keyOf(req.params.sectionId);

    const section = await Section.findByPk(sectionId);
    if (!section) return res.status(404).json({ message: "Section not found" });

    const [attempts, challenges] = await Promise.all([
      getUserAttempts(userId),
      Challenge.findAll({
        where: { sectionId },
        attributes: ["id", "title", "sectionId", "order"],
        order: [["order", "ASC"]],
      }),
    ]);

    const completedSet = buildCompletedChallengeSet(attempts);

    const completed = [];
    const remaining = [];

    for (const c of challenges) {
      const cid = keyOf(c.id);
      if (completedSet.has(cid)) completed.push(c);
      else remaining.push(c);
    }

    return res.json({
      section: {
        id: section.id,
        name: safeName(section, `Section ${section.id}`),
        difficultyId: section.difficultyId,
      },
      totals: {
        totalChallenges: challenges.length,
        completedChallenges: completed.length,
        remainingChallenges: remaining.length,
        completionPercent:
          challenges.length === 0 ? 0 : Math.round((completed.length / challenges.length) * 100),
        isFinished: challenges.length > 0 && completed.length === challenges.length,
      },
      completed,
      remaining,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};

exports.getProgressByDifficulty = async (req, res) => {
  try {
    const userId = req.user.userId;

    const attempts = await getUserAttempts(userId);
    const completedSet = buildCompletedChallengeSet(attempts);

    const {
      difficulties,
      sectionsByDifficulty,
      challengesBySection,
      subjectById,
    } = await loadHierarchy();

    const result = [];

    for (const d of difficulties) {
      const difficultyId = keyOf(d.id);
      const subjectId = keyOf(d.subjectId);

      const sectionIds = sectionsByDifficulty.get(difficultyId) || [];

      let totalChallenges = 0;
      let completedChallenges = 0;

      let finishedSections = 0;
      let totalSections = sectionIds.length;

      for (const secId of sectionIds) {
        const stats = computeSectionStats(secId, challengesBySection, completedSet);
        totalChallenges += stats.total;
        completedChallenges += stats.completedCount;
        if (stats.isFinished) finishedSections += 1;
      }

      const remainingChallenges = totalChallenges - completedChallenges;
      const completionPercent = totalChallenges === 0 ? 0 : Math.round((completedChallenges / totalChallenges) * 100);

      const isFinished = totalSections > 0 && finishedSections === totalSections;

      const subject = subjectById.get(subjectId);

      result.push({
        difficultyId,
        difficultyName: d.name,
        subjectId,
        subjectName: subject ? safeName(subject, `Subject ${subjectId}`) : null,

        totalSections,
        finishedSections,

        totalChallenges,
        completedChallenges,
        remainingChallenges,
        completionPercent,
        isFinished,
      });
    }

    return res.json(result);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};

exports.getDifficultyDetail = async (req, res) => {
  try {
    const userId = req.user.userId;
    const difficultyId = keyOf(req.params.difficultyId);

    const difficulty = await Difficulty.findByPk(difficultyId);
    if (!difficulty) return res.status(404).json({ message: "Difficulty not found" });

    const attempts = await getUserAttempts(userId);
    const completedSet = buildCompletedChallengeSet(attempts);

    const {
      sections,
      challengesBySection,
      sectionById,
    } = await loadHierarchy();

    const sectionIds = sections
      .filter((sec) => keyOf(sec.difficultyId) === difficultyId)
      .map((sec) => keyOf(sec.id));

    const perSection = [];

    for (const secId of sectionIds) {
      const stats = computeSectionStats(secId, challengesBySection, completedSet);
      const sec = sectionById.get(secId);

      perSection.push({
        sectionId: secId,
        sectionName: sec ? safeName(sec, `Section ${secId}`) : `Section ${secId}`,
        totalChallenges: stats.total,
        completedChallenges: stats.completedCount,
        remainingChallenges: stats.remainingCount,
        completionPercent: stats.completionPercent,
        isFinished: stats.isFinished,
      });
    }

    const finishedSections = perSection.filter((s) => s.isFinished);
    const remainingSections = perSection.filter((s) => !s.isFinished);

    return res.json({
      difficulty: {
        id: difficulty.id,
        name: difficulty.name,
        subjectId: difficulty.subjectId,
      },
      totals: {
        totalSections: perSection.length,
        finishedSections: finishedSections.length,
        remainingSections: remainingSections.length,
      },
      perSection,
      finishedSections,
      remainingSections,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};

exports.getProgressBySubject = async (req, res) => {
  try {
    const userId = req.user.userId;

    const attempts = await getUserAttempts(userId);
    const completedSet = buildCompletedChallengeSet(attempts);

    const {
      subjects,
      difficultiesBySubject,
      sectionsByDifficulty,
      challengesBySection,
    } = await loadHierarchy();

    const result = [];

    for (const s of subjects) {
      const subjectId = keyOf(s.id);
      const diffIds = difficultiesBySubject.get(subjectId) || [];

      let totalDifficulties = diffIds.length;
      let finishedDifficulties = 0;

      let totalSections = 0;
      let finishedSections = 0;

      let totalChallenges = 0;
      let completedChallenges = 0;

      for (const diffId of diffIds) {
        const sectionIds = sectionsByDifficulty.get(diffId) || [];
        totalSections += sectionIds.length;

        let diffFinishedSections = 0;

        for (const secId of sectionIds) {
          const stats = computeSectionStats(secId, challengesBySection, completedSet);
          totalChallenges += stats.total;
          completedChallenges += stats.completedCount;

          if (stats.isFinished) {
            finishedSections += 1;
            diffFinishedSections += 1;
          }
        }

        if (sectionIds.length > 0 && diffFinishedSections === sectionIds.length) {
          finishedDifficulties += 1;
        }
      }

      const remainingChallenges = totalChallenges - completedChallenges;
      const completionPercent = totalChallenges === 0 ? 0 : Math.round((completedChallenges / totalChallenges) * 100);

      const isFinished = totalDifficulties > 0 && finishedDifficulties === totalDifficulties;

      result.push({
        subjectId,
        subjectName: safeName(s, `Subject ${subjectId}`),

        totalDifficulties,
        finishedDifficulties,

        totalSections,
        finishedSections,

        totalChallenges,
        completedChallenges,
        remainingChallenges,
        completionPercent,
        isFinished,
      });
    }

    return res.json(result);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};

exports.getSubjectDetail = async (req, res) => {
  try {
    const userId = req.user.userId;
    const subjectId = keyOf(req.params.subjectId);

    const subject = await Subject.findByPk(subjectId);
    if (!subject) return res.status(404).json({ message: "Subject not found" });

    const attempts = await getUserAttempts(userId);
    const completedSet = buildCompletedChallengeSet(attempts);

    const {
      difficulties,
      sections,
      difficultiesBySubject,
      sectionsByDifficulty,
      challengesBySection,
      sectionById,
    } = await loadHierarchy();

    const diffIds = difficultiesBySubject.get(subjectId) || [];
    const diffsInSubject = difficulties.filter((d) => diffIds.includes(keyOf(d.id)));

    const perDifficulty = [];

    for (const d of diffsInSubject) {
      const difficultyId = keyOf(d.id);
      const sectionIds = sectionsByDifficulty.get(difficultyId) || [];

      let totalChallenges = 0;
      let completedChallenges = 0;

      const perSection = [];

      for (const secId of sectionIds) {
        const stats = computeSectionStats(secId, challengesBySection, completedSet);
        totalChallenges += stats.total;
        completedChallenges += stats.completedCount;

        const sec = sectionById.get(secId);

        perSection.push({
          sectionId: secId,
          sectionName: sec ? safeName(sec, `Section ${secId}`) : `Section ${secId}`,
          totalChallenges: stats.total,
          completedChallenges: stats.completedCount,
          remainingChallenges: stats.remainingCount,
          completionPercent: stats.completionPercent,
          isFinished: stats.isFinished,
        });
      }

      const remainingChallenges = totalChallenges - completedChallenges;
      const completionPercent = totalChallenges === 0 ? 0 : Math.round((completedChallenges / totalChallenges) * 100);
      const isFinished = sectionIds.length > 0 && perSection.every((s) => s.isFinished);

      perDifficulty.push({
        difficultyId,
        difficultyName: d.name,
        totalSections: sectionIds.length,
        finishedSections: perSection.filter((s) => s.isFinished).length,
        totalChallenges,
        completedChallenges,
        remainingChallenges,
        completionPercent,
        isFinished,
        sections: perSection,
      });
    }

    const finishedDifficulties = perDifficulty.filter((d) => d.isFinished);
    const remainingDifficulties = perDifficulty.filter((d) => !d.isFinished);

    return res.json({
      subject: {
        id: subject.id,
        name: safeName(subject, `Subject ${subject.id}`),
      },
      totals: {
        totalDifficulties: perDifficulty.length,
        finishedDifficulties: finishedDifficulties.length,
        remainingDifficulties: remainingDifficulties.length,
      },
      perDifficulty,
      finishedDifficulties,
      remainingDifficulties,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};
