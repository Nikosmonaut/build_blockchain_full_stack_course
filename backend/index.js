const express = require('express');
const { json: bodyParserJSON } = require('body-parser');
const Blockchain = require('./blockchain');
const request = require('request');
const PubSub = require('./app/pubsub');

const DEFAULT_PORT = 3000;

let PEER_PORT;
if (process.env.GENERATE_PEER_PORT === 'true') {
  PEER_PORT = DEFAULT_PORT + Math.ceil(Math.random() * 1000);
}

const PORT = PEER_PORT || DEFAULT_PORT;

const app = express();
const blockchain = new Blockchain();
const pubsub = new PubSub({ blockchain });

const ROOT_NODE_ADDRESS = `http://localhost:${DEFAULT_PORT}`;

const syncChains = () => {
  request(
    { url: `${ROOT_NODE_ADDRESS}/api/blocks` },
    (error, response, body) => {
      if (!error && response.statusCode === 200) {
        const rootChain = JSON.parse(body);

        blockchain.replaceChain(rootChain);

        console.log('replace chain on a sync with', rootChain);
      }
    },
  );
};

app.use(bodyParserJSON({ extended: true }));

app.get('/api/blocks', (req, res) => {
  res.json(blockchain.chain);
});

app.post('/api/mine', (req, res) => {
  const { data } = req.body;

  blockchain.addBlock({ data });

  pubsub.broadcastChain();

  res.redirect('/api/blocks');
});

app.listen(PORT, () => {
  console.log(`listening at localhost:${PORT}`);
  if (PORT !== DEFAULT_PORT) {
    syncChains();
  }
});
