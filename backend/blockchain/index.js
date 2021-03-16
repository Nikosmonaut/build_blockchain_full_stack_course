const Block = require('./block');
const cryptoHash = require('../util/crypto-hash');

class Blockchain {
  constructor() {
    this.chain = [Block.genesis()];
  }

  addBlock({ data }) {
    const newBlock = Block.mineBlock({
      lastBlock: this.chain[this.chain.length - 1],
      data,
    });

    this.chain.push(newBlock);
  }

  replaceChain(chain) {
    if (chain.length <= this.chain.length) {
      console.error('The incoming chain must be longer');
      return;
    }

    if (!Blockchain.isValidChain(chain)) {
      console.error('The incoming chain must be valid');
      return;
    }

    console.log('replacing chain with', chain);
    this.chain = chain;
  }

  static isValidChain(chain) {
    if (!chain instanceof Array || chain.length < 1) {
      return false;
    }

    if (JSON.stringify(chain[0]) !== JSON.stringify(Block.genesis())) {
      return false;
    }

    for (let i = 1; i < chain.length; i++) {
      const block = chain[i];
      const previous = chain[i - 1];
      const lastDifficulty = previous.difficulty;

      if (block.lastHash !== previous.hash) {
        return false;
      }

      const validHash = cryptoHash(
        block.timestamp,
        block.data,
        block.lastHash,
        block.nonce,
        block.difficulty,
      );

      if (validHash !== block.hash) {
        return false;
      }

      if (Math.abs(lastDifficulty - block.difficulty) > 1) {
        return false;
      }
    }

    return true;
  }
}

module.exports = Blockchain;