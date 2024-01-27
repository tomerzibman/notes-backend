const mongoose = require('mongoose');
const supertest = require('supertest');
const app = require('../app');
const Note = require('../models/note');
const User = require('../models/user');
const helper = require('./test_helper');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const api = supertest(app);
let user;
let token;

beforeEach(async () => {
  await User.deleteMany({});

  const passwordHash = await bcrypt.hash('password123', 10);
  user = new User({ username: 'root', passwordHash: passwordHash });
  await user.save();
  const userForToken = {
    username: user.username,
    id: user._id,
  };
  token = jwt.sign(userForToken, process.env.SECRET, {
    expiresIn: 60 * 60,
  });
  token = `Bearer ${token}`;

  await Note.deleteMany({});

  const noteObjects = helper.initialNotes.map((note) => {
    note.userId = user._id.toString();
    return new Note(note);
  });
  const promiseArray = noteObjects.map((note) => note.save());
  await Promise.all(promiseArray);
});

describe('when there is initially some notes saved', () => {
  test('notes are returned as json', async () => {
    await api
      .get('/api/notes')
      .expect(200)
      .expect('Content-Type', /application\/json/);
  });

  test('all notes are returned', async () => {
    const response = await api.get('/api/notes');

    expect(response.body).toHaveLength(helper.initialNotes.length);
  });

  test('a spesific note is within the returned notes', async () => {
    const response = await api.get('/api/notes');

    const contents = response.body.map((r) => r.content);
    expect(contents).toContain('Browser can execute only JavaScript');
  });
});

describe('viewing a spesific note', () => {
  test('succeeds with a valid id', async () => {
    const notesAtStart = await helper.notesInDb();
    const noteToView = notesAtStart[0];
    const resultNote = await api
      .get(`/api/notes/${noteToView.id}`)
      .expect(200)
      .expect('Content-Type', /application\/json/);

    expect(resultNote.body).toEqual(noteToView);
  });

  test('fails with statuscode 404 if note does not exist', async () => {
    const nonExisitingId = await helper.nonExisitingId();
    await api.get(`/api/notes/${nonExisitingId}`).expect(404);
  });

  test('fails with statuscode 400 if id is invalid', async () => {
    const invalidId = '5';
    await api.get(`/api/notes/${invalidId}`).expect(400);
  });
});

describe('addition of a new note', () => {
  test('succeeds with valid data and valid token', async () => {
    const newNote = {
      content: 'async/await simplifies making notes',
      important: true,
      userId: user._id.toString(),
    };

    await api
      .post('/api/notes')
      .send(newNote)
      .set({ Authorization: token })
      .expect(201)
      .expect('Content-Type', /application\/json/);

    const notesAtEnd = await helper.notesInDb();
    expect(notesAtEnd).toHaveLength(helper.initialNotes.length + 1);

    const contents = notesAtEnd.map((n) => n.content);
    expect(contents).toContain('async/await simplifies making notes');
  });

  test('fails with statuscode 400 if data is invalid and token is valid', async () => {
    const invalidNote = {
      important: true,
      userId: user._id.toString(),
    };

    await api
      .post('/api/notes')
      .send(invalidNote)
      .set({ Authorization: token })
      .expect(400);

    const notesAtEnd = await helper.notesInDb();

    expect(notesAtEnd).toHaveLength(helper.initialNotes.length);
  });
});

describe('deletion of a note', () => {
  test('succeeds with statuscode 204 if id is valid', async () => {
    const notesAtStart = await helper.notesInDb();
    const noteToDelete = notesAtStart[0];

    await api.delete(`/api/notes/${noteToDelete.id}`).expect(204);

    const notesAtEnd = await helper.notesInDb();
    expect(notesAtEnd).toHaveLength(notesAtStart.length - 1);

    const contents = notesAtEnd.map((n) => n.content);
    expect(contents).not.toContain(noteToDelete.content);
  });

  test('fails with statuscode 404 if id is invalid', async () => {
    const notesAtStart = await helper.notesInDb();
    const noteToDelete = notesAtStart[0];
    const invalidId = await helper.nonExisitingId();

    await api.delete(`/api/notes/${invalidId}`).expect(404);

    const notesAtEnd = await helper.notesInDb();
    expect(notesAtEnd).toHaveLength(notesAtStart.length);

    const contents = notesAtEnd.map((n) => n.content);
    expect(contents).toContain(noteToDelete.content);
  });
});

afterAll(async () => {
  await mongoose.connection.close();
});
