const express = require('express');
const request = require('request');
const cors = require('cors');

const CronJob = require('cron').CronJob;
const MongoClient = require('mongodb').MongoClient;
const ObjectID = require('mongodb').ObjectID;

const port = process.env.PORT | 80;
const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017';

const app = express();

app.use(cors());

app.use('/', express.static('public'));

new CronJob('*/10 * * * * *', function() {
    request.get('http://hn.algolia.com/api/v1/search_by_date?query=nodejs', { json: true }, (err, res, data) => {
        if (!err){
                MongoClient.connect(mongoURI, {useUnifiedTopology: true})
                .then(client => {
                    const db = client.db('dbNews');
                    const collection = db.collection('hits');
                    if(data.hits && data.hits.length > 0){
                        data.hits.forEach(item => {
                            collection.find({'created_at': item.created_at}).toArray(function(err, docs) {
                                if(!err){
                                    if(docs.length === 0){
                                        collection.insertOne(item, function(err, result) {
                                            if(!err) {
                                                console.log(result);
                                                client.close();
                                            }
                                        });
                                    }
                                }
                            });
                        });
                    }
                }).catch(err => {
                console.log('connection error: ', err)
            });
        } else {
            console.log("Api Inaccessible ", err);
        }
    });
}, function() {}, true);

app.get('/getNews', (req, res) => {
    MongoClient.connect(mongoURI, {useUnifiedTopology: true})
        .then(client => {
            const db = client.db('dbNews');
            const collection = db.collection('hits');
            collection.find({}).sort({created_at: -1}).toArray(function(err, docs) {
                if(!err){
                    res.send(docs);
                    client.close();
                }
            });
        }).catch(err => {
            res.send({status:'500', message: 'connection error:' + err})
    });
});

app.get('/noShowNews', (req, res) => {
    MongoClient.connect(mongoURI, {useUnifiedTopology: true})
        .then(client => {
            const db = client.db('dbNews');
            const collection = db.collection('hits');
            const id = new ObjectID(req.query.id);
            collection.findOneAndUpdate({'_id': id},{$set: {title: null, story_title: null}}, function(err, doc) {
                if (!err) {
                        res.send(doc);
                        client.close();
                    }
                });
            }).catch(err => {
        res.send({status:'500', message: 'connection error:' + err})
    });
});

app.listen(port, () => {
    console.log(`App listening at http://localhost:${port}`)
});
