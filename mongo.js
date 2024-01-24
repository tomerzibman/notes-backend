// File to interact with database (not used in actual code)
// Pay attention to the which database is being used

const mongoose = require('mongoose');
const Note = require('./models/note');

require('dotenv').config();

mongoose.connect(process.env.TEST_MONGODB_URI).then(() => {
  const note1 = new Note({
    content: 'Test note 1',
    important: true,
  });
  note1
    .save()
    .then(() => {
      console.log('Note saved');
      mongoose.connection.close();
    })
    .catch((error) => console.error(error));
});
