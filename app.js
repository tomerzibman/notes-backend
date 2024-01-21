const config = require('./utils/config');
const express = require('express');
const cors = require('cors');
const notesRouter = require('./controllers/notes');
const middleware = require('./utils/middleware');
const logger = require('./utils/logger');
const mongoose = require('mongoose');

mongoose.set('strictQuery', false);

logger.info('conecting to', config.MONGODB_URI);

mongoose
  .connect(config.MONGODB_URI)
  .then(() => {
    logger.info('connected to MongoDB');
  })
  .catch((err) => {
    logger.error('error connecting to MongoDB', err.message);
  });

const app = express();

app.use(express.static('dist'));
app.use(express.json());
app.use(cors());

app.use('/api/notes', notesRouter);
app.use(middleware.unknownEndpoint);
app.use(middleware.errorHandler);

module.exports = app;