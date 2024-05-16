require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const { MongoClient } = require('mongodb');
const client = new MongoClient(process.env.MONGODB_URL);
const db = client.db('urlshortener');
const urls = db.collection('urls');
const urlparser = require('url');
const dns = require('dns');
const { url } = require('inspector');
const { hostname } = require('os');

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({extended: true}));

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.post('/api/shorturl', function(req, res) {
  const url = req.body.url;
  const dnslookup = dns.lookup(urlparser.parse(url).hostname, async (err, address) => {
    if (!address){
      res.json({error: 'Invalid URL'});
    } else {
      const urlCount = await urls.countDocuments({});
      const urlDoc = {
        url,
        short_url: urlCount
      }

      const result = await urls.insertOne(urlDoc);
      console.log(result);
      res.json({ original_url: url, short_url: urlCount });
    }
  })
});

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
