const { Subject } = require("../models");

exports.createSubject = async (req, res) => {
  try {
    const subject = await Subject.create(req.body);
    res.status(201).json(subject);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.getSubjects = async (req, res) => {
  const subjects = await Subject.findAll();
  res.json(subjects);
};

exports.getSubjectById = async (req, res) => {
  const subject = await Subject.findByPk(req.params.id);
  if (!subject) return res.status(404).json({ message: "Subject not found" });
  res.json(subject);
};

exports.updateSubject = async (req, res) => {
  try {
    const { id } = req.params;

    const subject = await Subject.findByPk(id);
    if (!subject) {
      return res.status(404).json({ message: "Subject not found" });
    }

    await subject.update(req.body);
    res.json(subject);

  } catch (err) {
    console.error("Update subject error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};


exports.deleteSubject = async (req, res) => {
  const subject = await Subject.findByPk(req.params.id);
  if (!subject) return res.status(404).json({ message: "Subject not found" });

  await subject.destroy();
  res.json({ message: "Subject deleted" });
};
