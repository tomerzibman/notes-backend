require('dotenv').config();
const express = require("express");
const cors = require("cors");
const app = express();
const Note = require('./models/note');

app.use(express.static("dist"));
app.use(express.json());
app.use(cors());


const unknownEndpoint = (req, res, next) => {
  res.status(404).send({ error: 'Unknown endpoint' });
}

const errorHandler = (err, req, res, next) => {
  console.log(err);

  if (err.name === 'CastError') {
    return res.status(400).send({ error: 'malformed id' });
  } else if (err.name === 'ValidationError') {
    return res.status(400).json({ error: err.message });
  }
  next(error);
}

app.get("/", (req, res, next) => {
  res.send("<h1>Hello World</h1>");
});

app.get("/api/notes", (req, res, next) => {
  Note.find({}).then((notes) => {
    res.json(notes);
  });
});

app.get("/api/notes/:id", (req, res, next) => {
  Note.findById(req.params.id).then(note => {
    if (note) {
      res.json(note);
    } else {
      res.status(404).end();
    }
  }).catch(err => next(err));
});

app.post("/api/notes", (req, res, next) => {
  const body = req.body;
  if (!body.content) {
    return res.status(400).json({
      error: "content missing",
    });
  }
  const note = new Note({
    content: body.content,
    important: body.important || false,
  });
  note.save().then(savedNote => {
    res.json(savedNote);
  }).catch(err => next(err));
});

app.put('/api/notes/:id', (req, res, next) => {
  const body = req.body;

  const note = {
    content: body.content,
    important: body.important
  };

  Note.findByIdAndUpdate(req.params.id, note, { new: true, runValidators: true, context: 'query' }).then(updatedNote => {
    res.json(updatedNote);
  }).catch(err => next(err));
});

app.delete("/api/notes/:id", (req, res, next) => {
  Note.findByIdAndDelete(req.params.id).then(result => {
    res.status(204).end();
  }).catch(err => next(err));
});

app.use(unknownEndpoint);
app.use(errorHandler);

const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`server running on port ${PORT}`);
});
