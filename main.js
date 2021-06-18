import elliptic from 'elliptic'

import { BlockChain, Transaction } from './blockchain.js'

const { ec : EC } = elliptic

const ec = new EC('secp256k1')

const myKey = ec.keyFromPrivate('7edcdeabed8bb0b883d1ffe5109a8ded3d30cbc95d0d5e16bf860d2cf93aa347')
const myWalletAddress = myKey.getPublic('hex')

const gCoin = new BlockChain()

const tx1 = new Transaction(myWalletAddress, '043b3a4d7971da608b53f646db8f0f9ebd4d4f5bd8999a13295d9cc1a752ef0b15271a218687eb4eeab614a748e028cf3575c369fe4e1adad655e055c0f9fa2b79', 10)
tx1.signTransaction(myKey)
gCoin.addTransaction(tx1)

console.log('\n Starting the miner...')
gCoin.minedPendingTransactions(myWalletAddress)

console.log(`\nBalance of alex is ${gCoin.getBalanceOfAddress(myWalletAddress)}`)
console.log(JSON.stringify(gCoin.chain, null, 2))