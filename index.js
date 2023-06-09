const express = require('express');
const cors = require('cors')
require('dotenv').config();
const port = process.env.PORT || 5000;
const app = express();
// summercamp XwXfUJLk7xbloYjX
// middleware
app.use(cors());
app.use(express.json());

const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.gqju11e.mongodb.net/?retryWrites=true&w=majority`;

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
    const popularCourseCollection = client.db("summerCampDb").collection("popularCourse")
    const popularInstructorCollection = client.db("summerCampDb").collection("popularInstructor")

    app.get('/popularCourse', async(req, res) =>{
        const cursor = popularCourseCollection.find();
        const result = await cursor.toArray();
        res.send(result);
      })
      app.get('/popularInstructor', async(req, res) =>{
        const cursor = popularInstructorCollection.find();
        const result = await cursor.toArray();
        res.send(result);
      })

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get('/', (req, res) =>{
    res.send('Summer camp server is running');
})

app.listen(port, ()=>{
    console.log(`Server is running on port ${port}`);
})