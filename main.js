import CryptoJS from 'crypto-js'

const { SHA256 } = CryptoJS

class Transaction {
  constructor(fromAddress, toAddress, amount) {
    this.fromAddress = fromAddress
    this.toAddress = toAddress
    this.amount = amount
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
}

class BlockChain {
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
    const block = new Block(Date.now(), this.pendingTransactions)
    block.minedBlock(this.difficulty)

    console.log(`Block successfully minned`)
    this.chain.push(block)

    this.pendingTransactions = [
      new Transaction(null, miningRewardAddress, this.miningReward)
    ]
  }

  createTransaction(transaction) {
    this.pendingTransactions.push(transaction)
  }

  getBalanaceOfAddress(address) {
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

const gCoin = new BlockChain()

gCoin.createTransaction(new Transaction('addres1', 'address2', 100))
gCoin.createTransaction(new Transaction('addres2', 'address1', 50))

console.log('\n Starting the miner...')
gCoin.minedPendingTransactions('alex-address')

console.log(`\nBalance of alex is ${gCoin.getBalanaceOfAddress('alex-address')}`)

gCoin.createTransaction(new Transaction('addres1', 'address2', 100))
gCoin.createTransaction(new Transaction('addres2', 'address1', 50))

console.log('\n Starting the miner...')
gCoin.minedPendingTransactions('alex-address')

console.log(`\nBalance of alex is ${gCoin.getBalanaceOfAddress('alex-address')}`)
