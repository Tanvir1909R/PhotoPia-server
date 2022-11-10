const express = require("express");
const cors = require("cors");
const jwt = require('jsonwebtoken')
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
require("dotenv").config();
const app = express();
const port = process.env.PORT || 5000;
//middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@cluster0.5ki2fpf.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

app.get("/", (req, res) => {
  res.send("welcome to server");
});

app.post('/jwt', (req, res)=>{
  const user = req.body;
  const token = jwt.sign(user, process.env.TOKEN_SECRET, {expiresIn:'1d'});
  res.send({token})
})

const db = async () => {
  const servicesCollection = client.db("photoPia").collection("services");
  // const reviewsCollection = client.db("photoPia").collection("reviews");
  const serviceReviewsCollection = client.db('photoPia').collection('serviceReviews')
  const myReviewsCollection = client.db('photoPia').collection('myReviews')

  app.get("/services", async (req, res) => {
    const limitQuery = parseInt(req.query.limit);
    const result = servicesCollection.find({});
    if (limitQuery) {
      const services = await result.limit(limitQuery).toArray();
      res.send(services);
    } else {
      const services = await result.toArray();
      res.send(services);
    }
  });

  app.post('/services', async(req, res)=>{
    const service = req.body;
    const result = await servicesCollection.insertOne(service);
    res.send(result)
  })

  app.get("/service/:id", async (req, res) => {
    const id = req.params.id;
    const filter = { _id: ObjectId(id) };
    const service = await servicesCollection.findOne(filter);
    res.send(service);
  });

  // app.post("/reviews", async (req, res) => {
  //   const review = req.body;
  //   review.time = new Date();
  //   const result = await reviewsCollection.insertOne(review);
  //   res.send(result);
  // });

  app.get('/myreviews', async(req, res)=>{
    const email = req.query.email;
    const filter = { email:email }
    const result = myReviewsCollection.find(filter).sort({date:-1});
    const reviews = await result.toArray();
    res.send(reviews)
  })

  app.post('/myreviews', async(req, res)=>{
    const myReview = req.body;
    myReview.date = new Date()
    const result = myReviewsCollection.insertOne(myReview);
    res.send(result)
  })

  app.get('/servicereviews', async(req, res)=>{
    const name = req.query.name;
    const filter = { serviceName:name }
    const result = serviceReviewsCollection.find(filter).sort({date:-1});
    const reviews = await result.toArray();
    res.send(reviews)
  })

  app.post('/servicereviews', async(req, res)=>{
    const serviceReview = req.body;
    serviceReview.date = new Date()
    const result = await serviceReviewsCollection.insertOne(serviceReview)
    res.send(result);
  })

  // app.get("/reviews", async (req, res) => {
  //   const name = req.query.name;
  //   const email = req.query.email;
  //   let filter;
  //   if(name){
  //     filter={ serviceName:name }
  //   }else{
  //     filter = { email:email }
  //   }
  //   const result = reviewsCollection.find(filter).sort({time:-1});
  //   const reviews = await result.toArray();
  //   res.send(reviews);
  // });

  app.put("/reviews/:id", async (req, res) => {
    const review = req.body;
    const id = req.params.id;
    const filter = { _id: ObjectId(id) };
    const updateDoc = {
      $set: {
        message: review.message,
        rating: review.rating,
      },
    };
    const permission = { upsert: true };
    const result = await reviewsCollection.updateOne(filter, updateDoc, permission);
    res.send(result)
  });

  app.delete("/reviews/:id", async (req, res) => {
    const id = req.params.id;
    const filter = { _id: ObjectId(id) };
    const result = await reviewsCollection.deleteOne(filter);
    res.send(result);
  });
};

db().catch(console.dir);

app.listen(port, () => {
  console.log("server is ready");
});
