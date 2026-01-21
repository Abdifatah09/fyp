const { Section } = require("../models");

exports.createSection = async (req, res) => {
  try {
    const section = await Section.create(req.body);
    res.status(201).json(section);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.getSections = async (req, res) => {
  const sections = await Section.findAll({
    where: req.query.difficultyId ? { difficultyId: req.query.difficultyId } : {},
    order: [["order", "ASC"]],
  });
  res.json(sections);
};

exports.getSectionById = async (req, res) => {
  const section = await Section.findByPk(req.params.id);
  if (!section) return res.status(404).json({ message: "Section not found" });
  res.json(section);
};

exports.getSectionsByDifficultyId = async (req, res) => {
  const sections = await Section.findAll({
    where: { difficultyId: req.params.difficultyId },
    order: [["order", "ASC"]],
  });
  res.json(sections);
};
exports.updateSection = async (req, res) => {
  const section = await Section.findByPk(req.params.id);
  if (!section) return res.status(404).json({ message: "Section not found" });

  await section.update(req.body);
  res.json(section);
};

exports.deleteSection = async (req, res) => {
  const section = await Section.findByPk(req.params.id);
  if (!section) return res.status(404).json({ message: "Section not found" });

  await section.destroy();
  res.json({ message: "Section deleted" });
};
