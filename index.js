const express = require('express');
const app = express();
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();

const port = process.env.PORT || 3001;

// middleware
app.use(cors());
app.use(express.json());

// MongoDB connection
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.cdpfqv1.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
  connectTimeoutMS: 60000, // 60 seconds
});

let plantsCollection;

// ✅ Function to connect to MongoDB safely (for Vercel)
async function connectDB() {
  try {
    if (!client.topology?.isConnected()) {
      await client.connect();
      console.log("✅ Connected to MongoDB");
    }
    const database = client.db("plant-server");
    plantsCollection = database.collection("plants");
  } catch (error) {
    console.error("❌ MongoDB connection error:", error);
  }
}

// ✅ Connect to database immediately
connectDB();

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
    const cursor = plantsCollection.find();
    const plants = await cursor.toArray();
    res.send(plants);
  } catch (error) {
    res.status(500).send({ message: "Error fetching plants", error });
  }
});

// GET: Single plant by ID
app.get('/plants/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const query = { _id: new ObjectId(id) };
    const plant = await plantsCollection.findOne(query);
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
    const filter = { _id: new ObjectId(id) };
    const options = { upsert: true };
    const updateDoc = {
      $set: {
        plantName: updatedPlant.plantName,
        plantImage: updatedPlant.plantImage,
        plantCategory: updatedPlant.plantCategory,
        wateringFrequency: updatedPlant.wateringFrequency,
        ownerName: updatedPlant.ownerName,
        plantDescription: updatedPlant.plantDescription,
        careLevel: updatedPlant.careLevel,
        healthStatus: updatedPlant.healthStatus,
        lastWatered: updatedPlant.lastWatered,
        nextWatering: updatedPlant.nextWatering,
        email: updatedPlant.email
      }
    };
    const result = await plantsCollection.updateOne(filter, updateDoc, options);
    res.send(result);
  } catch (error) {
    res.status(500).send({ message: "Error updating plant", error });
  }
});

// DELETE: Remove plant
app.delete('/plants/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const query = { _id: new ObjectId(id) };
    const result = await plantsCollection.deleteOne(query);
    res.send(result);
  } catch (error) {
    res.status(500).send({ message: "Error deleting plant", error });
  }
});

// Default route
app.get('/', (req, res) => {
  res.send('🌿 Plant Care Server is running successfully!');
});

// Listen (for local)
app.listen(port, () => {
  console.log(`🚀 Server is running on port ${port}`);
});

// Export for Vercel serverless function
module.exports = app;
