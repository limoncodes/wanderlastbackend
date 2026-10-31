import express from "express"
import { MongoClient, ObjectId } from 'mongodb';
import 'dotenv/config'
import cors from "cors"
import { createRemoteJWKSet, jwtVerify } from "jose";
const app = express()
const port = process.env.PORT || 5000

app.use(cors())
app.use(express.json())


const client = new MongoClient(`mongodb+srv://${process.env.MONGODB_USERNAME}:${process.env.MONGODB_PASSWORD}@cluster0.4dwew1j.mongodb.net/`);

export async function connectToMongoDB() {
  try {
    await client.connect();
    console.log("You successfully connected to MongoDB!");
    return client;
  } catch (err) {
    console.dir(err);
  }
}
const mongoclient = await connectToMongoDB()
const db = mongoclient.db("wanderlust")
const destinationColection = db.collection("destination")
const bookingcolection = db.collection('bookings')

const verrifyAPI = async (req, res, next) => {
  const authHeader = req.headers.authorization
  if(!authHeader){
    return res.status(401).send({message:"Unauthorize"})
  }
  const token = authHeader.split(" ")[1]
  if(!token){ 
    return res.status(401).send({message:"Unauthorize"})

  }
  const JWKS= createRemoteJWKSet(new URL(`${process.env.CLIENT_URL}/api/auth/jwks`))
  try {
    const {payload} = await jwtVerify(token,JWKS)
      next()
    
  } catch (error) {
    return res.status(401).send({message:"Unauthorize"})

    
  }
  
 



}


  app.get('/', (req, res) => {
    res.send('Hello World!')
  })


app.post("/add-destination",verrifyAPI, async (req, res) => {
  const data = req.body
  const result = await destinationColection.insertOne(data)


  res.send(result)

})
app.patch('/add-destination/:id', async (req, res) => {
  const { id } = req.params
  const updatedata = req.body
  const result = await destinationColection.updateOne(
    { _id: new ObjectId(id) },
    { $set: updatedata }
  )
  res.json(result)
})
app.get("/add-destination/:id",verrifyAPI, async (req, res) => {

  
  const { id } = req.params
  const result = await destinationColection.findOne({ _id: new ObjectId(id) })

  res.send(result)

})
app.get('/add-destination', async (req, res) => {

  const result = await destinationColection.find().toArray()
  res.send(result)
})

app.get("/featured-destination", async (req, res)=>{
  const result = await destinationColection.find().limit(5).toArray()
  res.send(result)
})

app.delete("/add-destination/:id", async (req, res) => {

  const { id } = req.params
  const result = await destinationColection.deleteOne({ _id: new ObjectId(id) })

  res.json(result)
})
app.post('/booking', async (req, res) => {
  const data = req.body
  const result = await bookingcolection.insertOne(data)
  res.send(result)
})
app.get('/my-booking/:email', async (req, res) => {
  const { email } = req.params
  const result = await bookingcolection.find({ email: email }).toArray()
  res.send(result)
})
app.delete('/mybookings/:id', async (req, res) => {
  const { id } = req.params
  const result = await bookingcolection.deleteOne({ _id: new ObjectId(id) })
  res.send(result)

})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})