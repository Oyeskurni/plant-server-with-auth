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
});

async function run() {
  try {
    await client.connect();
    const database = client.db("plant-server");
    const plantsCollection = database.collection("plants");

    // POST: Add a new plant
    app.post('/plants', async (req, res) => {
      const newPlant = req.body;
      const result = await plantsCollection.insertOne(newPlant);
      res.send(result);
    });

    // GET: All plants
    app.get('/plants', async (req, res) => {
      const cursor = plantsCollection.find();
      const plants = await cursor.toArray();
      res.send(plants);
    });

    // GET: Single plant by ID
    app.get('/plants/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const plant = await plantsCollection.findOne(query);
      res.send(plant);
    });

    // PUT: Update plant
    app.put('/plants/:id', async (req, res) => {
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
    });

    // DELETE: Remove plant
    app.delete('/plants/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await plantsCollection.deleteOne(query);
      res.send(result);
    });

    await client.db("admin").command({ ping: 1 });
    console.log("✅ Connected to MongoDB successfully!");
  } catch (error) {
    console.error("❌ MongoDB connection failed:", error);
  }
}
run().catch(console.dir);

// default route
app.get('/', (req, res) => {
  res.send('Plant Care Server is running successfully!');
});

// Listen (for local + Vercel)
app.listen(port, () => {
  console.log(` Server is running on port ${port}`);
});

// Export (for Vercel serverless support)
module.exports = app;
