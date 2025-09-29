const express = require('express');
const app = express();
const port = process.env.PORT || 3001;
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();

app.use(cors());
app.use(express.json());




const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.cdpfqv1.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {
        // Connect the client to the server	(optional starting in v4.7)
        await client.connect();
        const database = client.db("plant-server");
        const plantsCollection = database.collection("plants");

        app.post('/plants', async (req, res) => {
            const newPlant = req.body;
            const result = await plantsCollection.insertOne(newPlant);
            res.send(result);
        });

        app.get('/plants', async (req, res) => {
            const cursor = plantsCollection.find();
            const plants = await cursor.toArray();
            res.send(plants);
        });

        app.get('/plants/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const plant = await plantsCollection.findOne(query);
            res.send(plant);
        });

        app.put('/plants/:id', async (req, res) => {
            const id = req.params.id;
            const updatedPlant = req.body;
            const userEmail = req.query.email;

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


        app.delete('/plants/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const result = await plantsCollection.deleteOne(query);
            res.send(result);
        });


        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);


app.get('/', (req, res) => {
    res.send('Plant Care Server is running');
});

// ✅ Vercel এ app export করুন
module.exports = app;
