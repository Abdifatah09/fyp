require('dotenv').config();

const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const authRoutes = require('./routes/authRoutes');
const profileRoutes = require('./routes/profileRoutes');
const subjectRoutes = require('./routes/subjectRoutes');
const difficultyRoutes = require('./routes/difficultyRoutes');
const sectionRoutes = require('./routes/sectionRoutes');
const challengeRoutes = require('./routes/challengeRoutes');

const  {sequelize}  = require('./models');

const app = express();

app.use(cors({ origin: 'http://localhost:5173', credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use('/auth', authRoutes);
app.use('/profile', profileRoutes);
app.use('/subjects', subjectRoutes);
app.use('/difficulties', difficultyRoutes);
app.use('/sections', sectionRoutes);
app.use('/challenges', challengeRoutes);

(async () => {
  try {
    await sequelize.authenticate();
    console.log('DB connection OK');

    await sequelize.sync({ alter: true });
    console.log('Models synced');

    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () =>
      console.log(`Server is running on port ${PORT}`)
    );
  } catch (err) {
    console.error('Startup error:', err);
    process.exit(1);
  }
})();
