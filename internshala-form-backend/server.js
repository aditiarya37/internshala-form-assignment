const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

const cookieParser = require('cookie-parser');
app.use(cookieParser());


app.use(cors());
app.use(express.json());

const applicationsRouter = require('./routes/applications');
app.use('/api/applications', applicationsRouter);

const userRouter = require('./routes/user');
app.use('/api/users', userRouter);

app.get('/', (req, res) => {
  res.send('Internshala Form Backend is running!');
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
