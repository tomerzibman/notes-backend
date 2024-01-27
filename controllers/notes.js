const notesRouter = require('express').Router();
const Note = require('../models/note');
const { tokenExtractor, userExtractor } = require('../utils/middleware');

notesRouter.get('/', async (req, res) => {
  const notes = await Note.find({}).populate('user', { username: 1, name: 1 });
  res.json(notes);
});

notesRouter.get('/:id', async (req, res) => {
  const note = await Note.findById(req.params.id);
  if (note) {
    res.json(note);
  } else {
    res.status(404).end();
  }
});

notesRouter.post('/', tokenExtractor, userExtractor, async (req, res) => {
  const body = req.body;
  const note = new Note({
    content: body.content,
    important: body.important || false,
    user: req.user.id,
  });

  const savedNote = await note.save();
  req.user.notes = req.user.notes.concat(savedNote._id);
  await req.user.save();
  res.status(201).json(savedNote);
});

notesRouter.put('/:id', async (req, res) => {
  const body = req.body;

  const note = {
    content: body.content,
    important: body.important,
  };

  const updaetdNote = await Note.findByIdAndUpdate(req.params.id, note, {
    new: true,
    runValidators: true,
    context: 'query',
  });
  res.json(updaetdNote);
});

notesRouter.delete('/:id', async (req, res) => {
  const deletedNote = await Note.findByIdAndDelete(req.params.id);
  if (deletedNote) {
    res.status(204).end();
  } else {
    res.status(404).end();
  }
});

module.exports = notesRouter;
