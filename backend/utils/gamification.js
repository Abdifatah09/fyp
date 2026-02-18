function xpNeededForNextLevel(level) {
  return 100 + (level - 1) * 50;
}

function applyLevelUps({ xp, level }) {
  let next = xpNeededForNextLevel(level);
  while (xp >= next) {
    level += 1;
    next = xpNeededForNextLevel(level);
  }
  return { xp, level, nextLevelXp: next };
}

function toISODateOnly(d = new Date()) {
  return d.toISOString().slice(0, 10);
}

function yesterdayISO(dateOnly) {
  const d = new Date(dateOnly + "T00:00:00.000Z");
  d.setUTCDate(d.getUTCDate() - 1);
  return d.toISOString().slice(0, 10);
}

module.exports = { xpNeededForNextLevel, applyLevelUps, toISODateOnly, yesterdayISO };
