require('dotenv').config();
const express = require("express");
const cors = require("cors");
const app = express();
const Note = require('./models/note');

app.use(express.static("dist"));
app.use(express.json());
app.use(cors());

// let notes = [
//   {
//     id: 1,
//     content: "HTML is easy",
//     important: true,
//   },
//   {
//     id: 2,
//     content: "Browser can execute only JavaScript",
//     important: false,
//   },
//   {
//     id: 3,
//     content: "GET and POST are the most important methods of HTTP protocol",
//     important: true,
//   },
// ];
const unknownEndpoint = (req, res, next) => {
  res.status(404).send({ error: 'Unknown endpoint' });
}

const errorHandler = (err, req, res, next) => {
  console.log(err);

  if (err.name === 'CastError') {
    return res.status(400).send({ error: 'malformed id' });
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

const generateId = () => {
  const maxId = notes.length > 0 ? Math.max(...notes.map((n) => n.id)) : 0;
  return maxId + 1;
};

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
  });
});

app.put('/api/notes/:id', (req, res, next) => {
  const body = req.body;

  const note = {
    content: body.content,
    important: body.important
  };

  Note.findByIdAndUpdate(req.params.id, note, { new: true }).then(updatedNote => {
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
