const UserSubscription = require("../models/UserSubscription");
const Difficulty = require("../models/difficulty");
const Subject = require("../models/subject");

exports.subscribe = async (req, res) => {
  const { difficultyId } = req.params;
  const userId = req.user.userId;

  const difficulty = await Difficulty.findByPk(difficultyId);
  if (!difficulty) return res.status(404).json({ message: "Difficulty not found" });

  const sub = await UserSubscription.findOrCreate({
    where: { userId, difficultyId },
    defaults: { userId, difficultyId },
  });

  return res.json({ message: "Subscribed", subscribed: true });
};

exports.unsubscribe = async (req, res) => {
  const { difficultyId } = req.params;
  const userId = req.user.userId;

  await UserSubscription.destroy({ where: { userId, difficultyId } });
  return res.json({ message: "Unsubscribed", subscribed: false });
};

exports.mine = async (req, res) => {
  const userId = req.user.userId;

  const subs = await UserSubscription.findAll({
    where: { userId },
    include: [
      {
        model: Difficulty,
        include: [
          { model: Subject, as: "subject" }, 
        ],
      },
    ],
  });

  return res.json(subs);
};
