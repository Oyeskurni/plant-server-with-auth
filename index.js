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
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.cdpfqv1.mongodb.net/?appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const plantsCollection = new MongoClient(uri).db("plantCareDB").collection("plants");

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

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
async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);


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
