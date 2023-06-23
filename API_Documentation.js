const express = require('express');
const multer = require('multer');
const { MongoClient, ObjectId } = require('mongodb');

// Set up Express
const app = express();
app.use(express.json());

// Set up multer for file uploads
const upload = multer({ dest: 'uploads/' });

// MongoDB Connection URL
const mongoURL = 'mongodb://localhost:27017';

// MongoDB Database Name
const dbName = 'mydatabase';

// MongoDB Collection Name for nudges
const nudgeCollectionName = 'nudges';

// Connect to MongoDB
MongoClient.connect(mongoURL, (err, client) => {
  if (err) {
    console.error('Failed to connect to MongoDB:', err);
    return;
  }

  console.log('Connected to MongoDB');

  const db = client.db(dbName);
  const nudgeCollection = db.collection(nudgeCollectionName);

  // Create a Nudge
  app.post('/api/v3/app/nudges', upload.single('image'), (req, res) => {
    const { event_id, title, send_time, description, icon, invitation } = req.body;
    const image = req.file;

    // Create a new nudge document
    const nudge = {
      type: 'nudge',
      event_id,
      title,
      send_time,
      description,
      icon,
      invitation,
      image: image ? image.path : '',
    };

    // Insert the nudge into the collection
    nudgeCollection.insertOne(nudge, (err, result) => {
      if (err) {
        console.error('Failed to create the nudge:', err);
        res.status(500).json({ error: 'Failed to create the nudge' });
        return;
      }

      res.status(201).json({ id: result.insertedId });
    });
  });

  // Retrieve a Nudge
  app.get('/api/v3/app/nudges/:id', (req, res) => {
    const { id } = req.params;

    // Find the nudge with the given ID
    nudgeCollection.findOne({ _id: new ObjectId(id) }, (err, nudge) => {
      if (err) {
        console.error('Failed to retrieve the nudge:', err);
        res.status(500).json({ error: 'Failed to retrieve the nudge' });
        return;
      }

      if (!nudge) {
        res.status(404).json({ error: 'Nudge not found' });
        return;
      }

      res.json(nudge);
    });
  });

  // Update a Nudge
  app.put('/api/v3/app/nudges/:id', upload.single('image'), (req, res) => {
    const { id } = req.params;
    const { event_id, title, send_time, description, icon, invitation } = req.body;
    const image = req.file;

    // Update the nudge document
    const updatedNudge = {
      event_id,
      title,
      send_time,
      description,
      icon,
      invitation,
      image: image ? image.path : '',
    };

    // Update the nudge in the collection
    nudgeCollection.updateOne({ _id: new ObjectId(id) }, { $set: updatedNudge }, (err) => {
      if (err) {
        console.error('Failed to update the nudge:', err);
        res.status(500).json({ error: 'Failed to update the nudge' });
        return;
      }

      res.status(204).end();
    });
  });

  // Delete a Nudge
  app.delete('/api/v3/app/nudges/:id', (req, res) => {
    const { id } = req.params;

    // Delete the nudge with the given ID
    nudgeCollection.deleteOne({ _id: new ObjectId(id) }, (err) => {
      if (err) {
        console.error('Failed to delete the nudge:', err);
        res.status(500).json({ error: 'Failed to delete the nudge' });
        return;
      }

      res.status(204).end();
    });
  });

  // Start the server
  app.listen(3000, () => {
    console.log('Server is listening on port 3000');
  });
});
