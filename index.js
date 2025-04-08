require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const bodyParser = require('body-parser');
const dns = require('dns');
const urlParser = require('url');

const port = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use('/public', express.static(`${process.cwd()}/public`));
app.use(express.urlencoded({ extended: false }));

// In-memory URL storage
const urlDatabase = [];
let id = 1;

// Homepage
app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// API: Shorten URL
app.post('/api/shorturl', function(req, res) {
  const originalUrl = req.body.url;
  const urlObject = urlParser.parse(originalUrl);

  // Validate the URL using DNS lookup
  dns.lookup(urlObject.hostname, (err, address) => {
    if (!address) {
      res.json({ error: 'invalid url' });
    } else {
      const shortUrl = id++;
      urlDatabase.push({ original_url: originalUrl, short_url: shortUrl });
      res.json({ original_url: originalUrl, short_url: shortUrl });
    }
  });
});

// API: Redirect to original URL
app.get('/api/shorturl/:shorturl', function(req, res) {
  const shortUrl = parseInt(req.params.shorturl);
  const found = urlDatabase.find(entry => entry.short_url === shortUrl);

  if (found) {
    res.redirect(found.original_url);
  } else {
    res.json({ error: 'No short URL found for the given input' });
  }
});

// Listen
app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});