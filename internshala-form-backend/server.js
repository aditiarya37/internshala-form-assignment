// server.js
const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

const cookieParser = require('cookie-parser');
app.use(cookieParser());


// Middleware
app.use(cors());
app.use(express.json());

// Import and use the applications route
const applicationsRouter = require('./routes/applications');
app.use('/api/applications', applicationsRouter);

// Import and use the user authentication route
const userRouter = require('./routes/user'); // <-- Add this line
app.use('/api/users', userRouter);           // <-- And this line

app.get('/', (req, res) => {
  res.send('Internshala Form Backend is running!');
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
