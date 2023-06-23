const express = require('express');
const multer = require('multer');
const { MongoClient, ObjectId } = require('mongodb');

const app = express();
const upload = multer();

// MongoDB connection URL
const MONGO_URL = 'mongodb://localhost:27017';
// Database name
const DB_NAME = 'your-database-name';

// Helper function to connect to MongoDB
async function connectToDatabase() {
  try {
    const client = await MongoClient.connect(MONGO_URL);
    return client.db(DB_NAME);
  } catch (error) {
    console.error('Failed to connect to the database:', error);
    process.exit(1);
  }
}

// GET /api/v3/app/events?id=:event_id
app.get('/api/v3/app/events', async (req, res) => {
  try {
    const eventId = req.query.id;
    const db = await connectToDatabase();
    const collection = db.collection('events');
    const event = await collection.findOne({ _id: ObjectId(eventId) });

    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    res.json(event);
  } catch (error) {
    console.error('Failed to fetch event:', error);
    res.status(500).json({ error: 'Failed to fetch event' });
  }
});

// GET /api/v3/app/events?type=latest&limit=5&page=1
app.get('/api/v3/app/events', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 5;
    const page = parseInt(req.query.page) || 1;
    const skip = (page - 1) * limit;

    const db = await connectToDatabase();
    const collection = db.collection('events');
    const events = await collection
      .find()
      .sort({ schedule: -1 })
      .skip(skip)
      .limit(limit)
      .toArray();

    res.json(events);
  } catch (error) {
    console.error('Failed to fetch events:', error);
    res.status(500).json({ error: 'Failed to fetch events' });
  }
});

// POST /api/v3/app/events
app.post('/api/v3/app/events', upload.single('image'), async (req, res) => {
  try {
    const { name, tagline, schedule, description, moderator, category, sub_category, rigor_rank } = req.body;
    const image = req.file;

    if (!name || !tagline || !schedule || !description || !moderator || !category || !sub_category || !rigor_rank || !image) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Save the event in the database
    const db = await connectToDatabase();
    const collection = db.collection('events');
    const result = await collection.insertOne({
      type: 'event',
      uid: 18,
      name,
      tagline,
      schedule,
      description,
      files: { image: image.buffer },
      moderator,
      category,
      sub_category,
      rigor_rank,
      attendees: [],
    });

    const insertedEvent = result.ops[0];
    res.status(201).json(insertedEvent);
  } catch (error) {
    console.error('Failed to create event:', error);
    res.status(500).json({ error: 'Failed to create event' });
  }
});

// PUT /api/v3/app/events/:id
app.put('/api/v3/app/events/:id', upload.single('image'), async (req, res) => {
  try {
    const eventId = req.params.id;
    const { name, tagline, schedule, description, moderator, category, sub_category, rigor_rank } = req.body;
    const image = req.file;

    if (!name || !tagline || !schedule || !description || !moderator || !category || !sub_category || !rigor_rank) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Update the event in the database
    const db = await connectToDatabase();
    const collection = db.collection('events');
    const result = await collection.findOneAndUpdate(
      { _id: ObjectId(eventId) },
      {
        $set: {
          name,
          tagline,
          schedule,
          description,
          moderator,
          category,
          sub_category,
          rigor_rank,
          files: image ? { image: image.buffer } : undefined,
        },
      },
      { returnOriginal: false }
    );

    const updatedEvent = result.value;

    if (!updatedEvent) {
      return res.status(404).json({ error: 'Event not found' });
    }

    res.json(updatedEvent);
  } catch (error) {
    console.error('Failed to update event:', error);
    res.status(500).json({ error: 'Failed to update event' });
  }
});

// DELETE /api/v3/app/events/:id
app.delete('/api/v3/app/events/:id', async (req, res) => {
  try {
    const eventId = req.params.id;

    const db = await connectToDatabase();
    const collection = db.collection('events');
    const result = await collection.findOneAndDelete({ _id: ObjectId(eventId) });

    const deletedEvent = result.value;

    if (!deletedEvent) {
      return res.status(404).json({ error: 'Event not found' });
    }

    res.json(deletedEvent);
  } catch (error) {
    console.error('Failed to delete event:', error);
    res.status(500).json({ error: 'Failed to delete event' });
  }
});

// Start the server
app.listen(3000, () => {
  console.log('Server is running on http://localhost:3000');
});
