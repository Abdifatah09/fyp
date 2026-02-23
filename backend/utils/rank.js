function getRankFromXp(xp) {
  const x = Number(xp || 0);

  if (x >= 3000) return { name: "Master", icon: "👑" };
  if (x >= 1500) return { name: "Diamond", icon: "🔥" };
  if (x >= 700) return { name: "Platinum", icon: "💎" };
  if (x >= 300) return { name: "Gold", icon: "🥇" };
  if (x >= 100) return { name: "Silver", icon: "🥈" };
  return { name: "Bronze", icon: "🥉" };
}

function applyRank(stats) {
  const currentRank = stats.rank || "Bronze";
  const next = getRankFromXp(stats.xp);

  const rankUp = currentRank !== next.name;

  stats.rank = next.name;

  return { rankUp, rank: next.name, rankIcon: next.icon };
}

module.exports = { getRankFromXp, applyRank };
