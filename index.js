const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3001;

// ======================
// Middleware
// ======================
app.use(cors());
app.use(express.json());

// ======================
// MongoDB Connection
// ======================
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.cdpfqv1.mongodb.net/?retryWrites=true&w=majority`;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

let plantsCollection;

async function connectDB() {
  try {
    await client.connect();
    const db = client.db("plantCareDB");
    plantsCollection = db.collection("plants");
    console.log("✅ MongoDB Connected Successfully");
  } catch (error) {
    console.error("❌ MongoDB connection error:", error);
  }
}

// Connect DB once
connectDB();

// ======================
// Routes
// ======================

// Root route
app.get('/', (req, res) => {
  res.send('🌿 Plant Care Server is running successfully!');
});

// POST: Add a new plant
app.post('/plants', async (req, res) => {
  try {
    const newPlant = req.body;
    const result = await plantsCollection.insertOne(newPlant);
    res.send(result);
  } catch (error) {
    res.status(500).send({ message: "Error adding plant", error });
  }
});

// GET: All plants
app.get('/plants', async (req, res) => {
  try {
    const plants = await plantsCollection.find().toArray();
    res.send(plants);
  } catch (error) {
    res.status(500).send({ message: "Error fetching plants", error });
  }
});

// GET: Single plant by ID
app.get('/plants/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const plant = await plantsCollection.findOne({ _id: new ObjectId(id) });
    res.send(plant);
  } catch (error) {
    res.status(500).send({ message: "Error fetching plant", error });
  }
});

// PUT: Update plant
app.put('/plants/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const updatedPlant = req.body;

    const result = await plantsCollection.updateOne(
      { _id: new ObjectId(id) },
      { $set: updatedPlant }
    );

    res.send(result);
  } catch (error) {
    res.status(500).send({ message: "Error updating plant", error });
  }
});

// DELETE: Remove plant
app.delete('/plants/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const result = await plantsCollection.deleteOne({ _id: new ObjectId(id) });
    res.send(result);
  } catch (error) {
    res.status(500).send({ message: "Error deleting plant", error });
  }
});

// ======================
// Server Listen
// ======================
app.listen(port, () => {
  console.log(`🚀 Server is running on port ${port}`);
});

// For Vercel
module.exports = app;
