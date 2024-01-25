// File to interact with database (not used in actual code)
// Pay attention to the which database is being used

const mongoose = require('mongoose');
const Note = require('./models/note');
const User = require('./models/user');
const bcrypt = require('bcrypt');

require('dotenv').config();

const addNoteToUser = async (userId) => {
  await mongoose.connect(process.env.MONGODB_URI);
  const note = new Note({
    content: 'I am testing the app',
    important: true,
    user: userId,
  });
  const savedNote = await note.save();
  const user = await User.findById(userId);
  user.notes = user.notes.concat(savedNote._id);
  await user.save();
  mongoose.connection.close();
};

const createNewUser = async () => {
  const passwordHash = await bcrypt.hash('testing', 10);
  await mongoose.connect(process.env.MONGODB_URI);
  const user = new User({
    username: 'tomerzibman',
    name: 'Tomer Zibman',
    passwordHash: passwordHash,
  });
  await user.save();
  mongoose.connection.close();
};

addNoteToUser('65b2c0687d7dae05daf16f08');
