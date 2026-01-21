const { Challenge } = require("../models");

exports.createChallenge = async (req, res) => {
  try {
    const challenge = await Challenge.create(req.body);
    res.status(201).json(challenge);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.getChallenges = async (req, res) => {
  const challenges = await Challenge.findAll({
    where: req.query.sectionId ? { sectionId: req.query.sectionId } : {},
    order: [["order", "ASC"]],
  });
  res.json(challenges);
};

exports.getChallengesBySectionId = async (req, res) => {   
  const challenges = await Challenge.findAll({
    where: { sectionId: req.params.sectionId },
    order: [["order", "ASC"]],
  });
  res.json(challenges);
};

exports.getChallengeById = async (req, res) => {
  const challenge = await Challenge.findByPk(req.params.id);
  if (!challenge) return res.status(404).json({ message: "Challenge not found" });
  res.json(challenge);
};

exports.updateChallenge = async (req, res) => {
  const challenge = await Challenge.findByPk(req.params.id);
  if (!challenge) return res.status(404).json({ message: "Challenge not found" });

  await challenge.update(req.body);
  res.json(challenge);
};

exports.deleteChallenge = async (req, res) => {
  const challenge = await Challenge.findByPk(req.params.id);
  if (!challenge) return res.status(404).json({ message: "Challenge not found" });

  await challenge.destroy();
  res.json({ message: "Challenge deleted" });
};
