const Block = require('./block');
const Wallet = require('../wallet');
const Transaction = require('../wallet/transaction');
const { cryptoHash } = require('../util');
const { REWARD_INPUT, MINING_REWARD } = require('../config');

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

  replaceChain(chain, validateTransactions, onSuccess) {
    if (chain.length <= this.chain.length) {
      console.error('The incoming chain must be longer');
      return;
    }

    if (!Blockchain.isValidChain(chain)) {
      console.error('The incoming chain must be valid');
      return;
    }

    if (validateTransactions && !this.validTransactionData({ chain })) {
      console.error('The incoming chain has invalid data');
      return;
    }

    console.log('replacing chain with', chain);
    this.chain = chain;

    if (onSuccess) {
      onSuccess();
    }
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

  validTransactionData({ chain }) {
    for (let i = 1; i < chain.length; i++) {
      const block = chain[i];
      const transactionSet = new Set();

      let rewardTransactionCount = 0;

      for (let transaction of block.data) {
        if (transaction.input.address === REWARD_INPUT.address) {
          rewardTransactionCount++;

          if (rewardTransactionCount > 1) {
            console.error('Miner rewards exceed limit');

            return false;
          }

          if (Object.values(transaction.outputMap)[0] !== MINING_REWARD) {
            console.error('Miner reward amount is invalid');

            return false;
          }
        } else if (!Transaction.validTransaction(transaction, true)) {
          console.error('Invalid transaction');

          return false;
        } else {
          const trueBalance = Wallet.calculateBalance({
            chain: this.chain,
            address: transaction.input.address,
          });

          if (transaction.input.amount !== trueBalance) {
            console.error('Invalid input amount');

            return false;
          }

          if (transactionSet.has(transaction)) {
            console.error(
              'An identical transaction appears more than once in the block',
            );

            return false;
          } else {
            transactionSet.add(transaction);
          }
        }
      }
    }

    return true;
  }
}

module.exports = Blockchain;
