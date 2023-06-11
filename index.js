const express = require('express');
const cors = require('cors')
require('dotenv').config();
const port = process.env.PORT || 5000;
const app = express();

// middleware
app.use(cors());
app.use(express.json());

const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
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
    const courseCollection = client.db("summerCampDb").collection("courses")
    const instructorCollection = client.db("summerCampDb").collection("popularInstructor")
    const cartCollection = client.db("summerCampDb").collection("carts");
    const userCollection = client.db("summerCampDb").collection("users");

    app.get('/courses', async(req, res) =>{
        const cursor = courseCollection.find();
        const result = await cursor.toArray();
        res.send(result);
      })
      app.get('/instructor', async(req, res) =>{
        const cursor = instructorCollection.find();
        const result = await cursor.toArray();
        res.send(result);
      })

      app.post('/instructor', async( req, res) =>{
        const instructor = req.body;
        console.log(instructor);
        const result = await instructorCollection.insertOne(instructor);
        res.send(result);
      })
      app.post('/carts', async( req, res) =>{
        const item = req.body;
        console.log(item);
        const result = await cartCollection.insertOne(item);
        res.send(result);
      })

      app.get('/carts', async (req, res) => {
       
          const email = req.query.email;
          console.log(email);
          const query = { email: email };
          const result = await cartCollection.find(query).toArray();
          return res.send(result);
        
      });
      app.patch('/courses/:id', async (req, res) => {
        const id = req.params.id;
        const filter = { _id: new ObjectId(id) };
      
        try {
          const course = await courseCollection.findOne(filter);
          if (!course) {
            return res.status(404).send('Course not found');
          }
      
          const updatedAvailableSeats = course.available_seat - 1;
      
          const updateDoc = {
            $set: {
              available_seat: updatedAvailableSeats,
            },
          };
      
          const result = await courseCollection.updateOne(filter, updateDoc);
          res.send(result);
        } catch (error) {
          console.error(error);
          res.status(500).send('Internal Server Error');
        }
      });
      app.post('/courses', async( req, res) =>{
        const instructorClass = req.body;
        console.log(instructorClass);
        const result = await courseCollection.insertOne(instructorClass);
        res.send(result);
      })
      app.get('/courses/instructor/:email', async (req, res) => {
        const instructorEmail = req.params.email;
        try {
          const courses = await courseCollection.find({ instructorEmail }).toArray();
          res.json(courses);
        } catch (error) {
          console.error("Error fetching courses:", error);
          res.status(500).json({ error: "Internal server error" });
        }
      });
      
      
      app.get('/users', async(req, res) =>{
        const result = await userCollection.find().toArray();
        res.send(result);
      })
      app.post('/users', async(req, res) =>{
        const user =  req.body;
        console.log(user);
        const query = {email: user.email}
        const existingUser = await userCollection.findOne(query);
        console.log('Existing USER: ',existingUser);
        if(existingUser){
          return res.send({message: 'user already exist'})
        }
        const result = await userCollection.insertOne(user);
        res.send(result);
      })

      app.patch('/users/admin/:id', async(req, res) => {
        const id = req.params.id;
        const filter = {_id: new ObjectId(id)};
        const updateDoc = {
          $set: {
            role: 'admin'
          },
        };
        const result = await userCollection.updateOne(filter, updateDoc);
        res.send(result);
      })
      app.patch('/users/instructor/:id', async(req, res) => {
        const id = req.params.id;
        const filter = {_id: new ObjectId(id)};
        const updateDoc = {
          $set: {
            role: 'instructor'
          },
        };
        const result = await userCollection.updateOne(filter, updateDoc);
        res.send(result);
      })
      app.delete('/carts/:id', async(req, res) =>{
        const id = req.params.id;
        const query = {_id: new ObjectId(id)}
        const result = await cartCollection.deleteOne(query);
        res.send(result)
      } )
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