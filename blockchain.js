import CryptoJS from 'crypto-js'
import elliptic from 'elliptic'

const { ec : EC } = elliptic
const { SHA256 } = CryptoJS

const ec = new EC('secp256k1')

export class Transaction {
  constructor(fromAddress, toAddress, amount) {
    this.fromAddress = fromAddress
    this.toAddress = toAddress
    this.amount = amount
  }

  calculateHash() {
    return SHA256(this.fromAddress + this.toAddress + this.amount).toString()
  }

  signTransaction(signingKey) {
    if (signingKey.getPublic('hex') !== this.fromAddress) {
      throw new Error('You cannot sign transactions for other wallets.')
    }
    const hashTx = this.calculateHash()
    const sig = signingKey.sign(hashTx, 'base64')
    this.signature = sig.toDER('hex')
  }

  isValid() {
    if (this.fromAddress === null) {
      return true
    }

    if (!this.signature || this.signature.length === 0) {
      throw new Error('No signature in this transaction.')
    }

    const publicKey = ec.keyFromPublic(this.fromAddress, 'hex')
    return publicKey.verify(this.calculateHash(), this.signature)
  }
}

class Block {
  constructor(timeStamp, transactions, previousHash = '') {
    this.timeStamp = timeStamp
    this.transactions = transactions
    this.previousHash = previousHash
    this.hash = this.calculateHash()
    this.nonce = 0
  }
  
  calculateHash() {
    return SHA256(this.previousHash + this.timeStamp + JSON.stringify(this.data) + this.nonce).toString()
  }

  minedBlock(difficulty) {
    while (this.hash.substr(0, difficulty) !== Array(difficulty + 1).join("0")) {
      this.nonce++
      this.hash = this.calculateHash()
    }

    console.log(`Block mined: ${this.hash}`)
  }

  hasValidTransactions() {
    for (const tx of this.transactions) {
      if (!tx.isValid()) {
        return false
      }
    }

    return true
  }
}

export class BlockChain {
  constructor() {
    this.chain = [this.createGenesisBlock()]
    this.difficulty = 2
    this.pendingTransactions = []
    this.miningReward = 100
  }

  createGenesisBlock() {
    return new Block(Date.now(), 'Genesis Block', '')
  }

  getLatestBlock() {
    return this.chain[this.chain.length - 1]
  }

  minedPendingTransactions(miningRewardAddress) {
    const rewardTx = new Transaction(null, miningRewardAddress, this.miningReward)
    this.pendingTransactions.push(rewardTx)

    const block = new Block(Date.now(), this.pendingTransactions)
    block.minedBlock(this.difficulty)

    console.log(`Block successfully mined`)
    this.chain.push(block)

    this.pendingTransactions = []
  }

  addTransaction(transaction) {
    if (!transaction.fromAddress || !transaction.toAddress) {
      throw new Error('Transaction must include from and to address')
    }

    if (!transaction.isValid()) {
      throw new Error('Cannot add invalid transaction to chain')
    }

    this.pendingTransactions.push(transaction)
  }

  createTransaction(transaction) {
    this.pendingTransactions.push(transaction)
  }

  getBalanceOfAddress(address) {
    let balance = 0

    for (const block of this.chain) {
      for (const transaction of block.transactions) {
        if (transaction.fromAddress === address) {
          balance -= transaction.amount
        }

        if (transaction.toAddress === address) {
          balance += transaction.amount
        }
      } 
    }

    return balance
  }

  isChainValid() {
    for (let i = 1; i < this.chain.length; i++) {
      const currentBlock = this.chain[i]
      const previousBlock = this.chain[i - 1]

      if (!currentBlock.hasValidTransactions()) {
        return false
      }

      if (currentBlock.hash !== currentBlock.calculateHash()) {
        return false
      }

      if (currentBlock.previousHash !== previousBlock.hash) {
        return false
      }
    }

    return true
  }
}
