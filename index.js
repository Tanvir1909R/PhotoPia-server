const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config()
const app = express();
const port = process.env.PORT || 5000;

//middleware
app.use(cors())
app.use(express.json());


const uri = `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@cluster0.5ki2fpf.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });


app.get('/',(req,res)=>{    
    res.send('welcome to server')
})

const db = async ()=>{
    const servicesCollection = client.db('photoPia').collection('services');
    const reviewsCollection = client.db('photoPia').collection('reviews')
    app.get('/services', async(req, res)=>{
        const limitQuery = parseInt(req.query.limit)
        const filter = {};
        const result = servicesCollection.find(filter);
        if(limitQuery){
            const services = await result.limit(limitQuery).toArray();
            res.send(services)
        }else{
            const services = await result.toArray();
            res.send(services)
        }
    })

    app.get('/service/:id', async(req, res)=>{
        const id = req.params.id;
        const filter = {_id: ObjectId(id)}
        const service = await servicesCollection.findOne(filter)
        res.send(service)
    })

    app.post('/reviews', async(req, res)=>{
        const review = req.body;
        const result = await reviewsCollection.insertOne(review);
        res.send(result);
    })

    app.get('/reviews', async(req, res)=>{
        const name = req.query.name;
        const filter= { serviceName: name };
        const result = reviewsCollection.find(filter);
        const reviews = await result.toArray();
        res.send(reviews)
    })

}

db().catch(console.dir);

app.listen(port, ()=>{
    console.log('server is ready');
})