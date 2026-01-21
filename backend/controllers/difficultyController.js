const { Difficulty } = require("../models");

exports.createDifficulty = async (req, res) => {
  try {
    const difficulty = await Difficulty.create(req.body);
    res.status(201).json(difficulty);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.getDifficulties = async (req, res) => {
  const difficulties = await Difficulty.findAll({
    where: req.query.subjectId ? { subjectId: req.query.subjectId } : {},
  });
  res.json(difficulties);
};

exports.getDifficultyById = async (req, res) => {
  const difficulty = await Difficulty.findByPk(req.params.id);
  if (!difficulty) return res.status(404).json({ message: "Difficulty not found" });
  res.json(difficulty);
};

exports.deleteDifficulty = async (req, res) => {
  const difficulty = await Difficulty.findByPk(req.params.id);
  if (!difficulty) return res.status(404).json({ message: "Difficulty not found" });

  await difficulty.destroy();
  res.json({ message: "Difficulty deleted" });
};
