const express = require('express');
const app = express();
const mongoose = require('mongoose');
const asyncHandler = require('express-async-handler');
const User = require('./models/userModel');
const Exercise = require('./models/exerciseModel');
const cors = require('cors');
require('dotenv').config();

const connectDb = async () => {
  try {
    const connect = await mongoose.connect(process.env.CONNECTION_STRING);
    console.log(
      'Database connected',
      connect.connection.host,
      connect.connection.name
    )
  } catch (err) {
    console.log(err);
    process.exit(1);
  }
};

const clearDatabase = async () => {
  try { 
    await User.deleteMany({});
    await Exercise.deleteMany({});
    console.log('All collections cleared.');
  } catch (err) {
    console.error('Error clearing database:', err);
  }
}

connectDb();
clearDatabase();

app.use(cors())
app.use(express.urlencoded({ extended: true }))
app.use(express.static('public'))
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});

app.post('/api/users', asyncHandler(async (req, res) => {
  const username = req.body.username;
  if ( !username ) {
    res.status(400);
    throw new Error('Username field is mandatory!');
  };

  const availableUser = await User.findOne({ username });
  if ( availableUser ) {
    res.status(400);
    throw new Error('Username is already registered');
  };

  const user = await User.create({
    username,
  });

  console.log(`User successfully created ${user}`);
  if (user) {
    res.status(201).json({
      username: user.username,
      _id: user.id,
    });
  } else {
    res.status(400);
    throw new Error('User data is not valid');
  };

}));

app.get('/api/users', asyncHandler(async (req,res) => {
  const users = await User.find({}, { username: 1, _id: 1 });
  res.status(200).json(users);
  
}));

app.post('/api/users/:_id/exercises', asyncHandler(async (req, res) => {
  const { description, duration, date } = req.body;
  if ( !description || !duration ) {
    res.status(400);
    throw new Error('All fields are mandatory!');
  };

  const finalDate = date ? new Date(date) : new Date(); // this is a date object

  const user = await User.findById(req.params._id);
  if ( !user ) {
    res.status(404);
    throw new Error("This user doesn't exist!");
  };

  const exercise = await Exercise.create({
    user_id: user.id,
    description,
    duration,
    date: finalDate, // this is still a date object
  });
  
  const logs = {
    username: user.username,
    description: exercise.description,
    duration: exercise.duration,
    date: exercise.date.toDateString(), // i converted the date object to date string
    _id: user.id
  }

  res.status(201).json(logs);
  
  console.log('The exercise to be created is:', exercise);

}));

app.get('/api/users/:_id/logs', asyncHandler(async (req,res) => {
  const { _id } = req.params;
  const { from, to, limit } = req.query;
  
  const query = { user_id: _id };

  if ( from ) {
    query.date = { $gte: new Date(from) };
  };

  if ( to ) {
    query.date = { ...query.date, $lte: new Date(to) };
  };

  const user = await User.findById(_id);
  if ( !user ) {
    res.status(404);
    throw new Error("This user doesn't exist!");
  };

  const exercises = await Exercise.find(query).limit(parseInt(limit, 10) || 0);

  const logs = {
    username: user.username,
    count: exercises.length,
    _id: user.id,
    log: exercises.map(({ description, duration, date }) => ({ 
      description, 
      duration, 
      date: date.toDateString(),
    })),
  };

  res.status(200).json(logs);

}));



const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
