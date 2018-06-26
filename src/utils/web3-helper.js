const Web3 = require('web3');
import {getBalanceValid} from "./validation-helper";

const Tx = require('ethereumjs-tx');
const config = require('../../config');
const BigNumber = require('bignumber.js');
import web3 from './web3-base.js';

/**
 * Use web3s inbuilt methods to generate a address and privat-key,
 * Encrypt the private key and send it to the user.
 */
export function createWallet() {
  const {address, privateKey} = web3.eth.accounts.create();
  return {address, privateKey: privateKey.substring(2)};
}

export function de() {
  let {crypto: {mac}} = web3.eth.accounts.decrypt(privateKey, 'test!');
}


/**
 * Get the balance using web3 getBalance method,
 * Conver wei to ether using utils provided by web3.
 */
export async function getBalance(address) {
  try {
    const {status, message} = getBalanceValid(address);
    if (!status) return {message};
    let balance = await web3.eth.getBalance(address);
    return balance;
  } catch (error) {
    return {message: "Something went wrong"};
  }
}

const abi = [{
  "constant": true,
  "inputs": [],
  "name": "name",
  "outputs": [{
    "name": "",
    "type": "string"
  }],
  "payable": false,
  "stateMutability": "view",
  "type": "function"
}, {
  "constant": false,
  "inputs": [{
    "name": "_from",
    "type": "address"
  }, {
    "name": "_to",
    "type": "address"
  }, {
    "name": "_value",
    "type": "uint256"
  }],
  "name": "transferFrom",
  "outputs": [{
    "name": "success",
    "type": "bool"
  }],
  "payable": false,
  "stateMutability": "nonpayable",
  "type": "function"
}, {
  "constant": false,
  "inputs": [{"name": "_to", "type": "address"}, {"name": "_value", "type": "uint256"}],
  "name": "transfer",
  "outputs": [{"name": "success", "type": "bool"}],
  "payable": false,
  "stateMutability": "nonpayable",
  "type": "function"
}, {
  "constant": true,
  "inputs": [],
  "name": "decimals",
  "outputs": [{
    "name": "",
    "type": "uint8"
  }],
  "payable": false,
  "stateMutability": "view",
  "type": "function"
}, {
  "constant": true,
  "inputs": [{
    "name": "_owner",
    "type": "address"
  }],
  "name": "balanceOf",
  "outputs": [{
    "name": "balance",
    "type": "uint256"
  }],
  "payable": false,
  "stateMutability": "view",
  "type": "function"
}, {
  "constant": true,
  "inputs": [],
  "name": "symbol",
  "outputs": [{
    "name": "",
    "type": "string"
  }],
  "payable": false,
  "stateMutability": "view",
  "type": "function"
}];

export async function estimateEthGasLimit(opts) {
  let {
    address,
    privateKey,
    destination,
    contractAddress,
    gasPriceGWei,
    gasLimit,
    value
  } = opts;

  return web3.eth.estimateGas({
    to: contractAddress,
    gasPrice: web3.utils.toWei('10', 'gwei'),
    value: '0x0',
    data: "0x"
  });
}

export async function estimateTranferTokenGasLimit(opts) {
  let {
    address,
    privateKey,
    destination,
    contractAddress,
    gasPriceGWei,
    gasLimit,
    value,
    tokenValue
  } = opts;
  console.log('xxxx')
  let token = new web3.eth.Contract(abi, contractAddress);

  var tx = {
    from: address,
    to: contractAddress,
    data: token.methods.transfer(destination, tokenValue).encodeABI()
  }

  console.log('start')

  return new Promise((resolve, reject) => {
    web3.eth.estimateGas(tx).then(response => {
      resolve(response)
    }).catch(error => {
      console.log(error)
      reject(error)
    })
  })
}

export async function transFerToken(opts) {
  let {
    address,
    privateKey,
    destination,
    contractAddress,
    gasPriceGWei,
    gasLimit,
    value,
    tokenValue
  } = opts;

  let privateKeyBuf = new Buffer(privateKey, 'hex');

  let gasPrice = new BigNumber(gasPriceGWei).multipliedBy(1000000000);

  let nonce = await web3.eth.getTransactionCount(address);

  let token = new web3.eth.Contract(abi, contractAddress);

  //transform value to dest
  let tokenData = token.methods.transfer(destination, tokenValue).encodeABI();

  let rawTx = {
    nonce: web3.utils.toHex(nonce), // Nonce is the times the address has transacted, should always be higher than the last nonce 0x0#
    gasPrice: web3.utils.toHex(gasPrice.toString()), // X GWei
    gasLimit: web3.utils.toHex(gasLimit), // Limit
    to: contractAddress, // to contractAddress
    value: web3.utils.numberToHex(value),
    data: tokenData
  }

  let tx = new Tx(rawTx);
  tx.sign(privateKeyBuf);

  let serializedTx = tx.serialize();
  return new Promise(function (resolve, reject) {
    web3.eth.sendSignedTransaction('0x' + serializedTx.toString('hex'))
      .on('confirmation', function (number, receipt) {
        resolve({number, receipt});
      }).on('error', function (error) {
      console.error(error)
      reject({error, nonce})
    })
  })
}

export async function getContractBalance(address, contractAddress) {

  let token = new web3.eth.Contract(abi, contractAddress);

  let tokens = await token.methods.balanceOf(address).call();

  return tokens;
}

export async function sendEthTransaction(opts) {

  try {
    let {
      address,
      privateKey,
      destination,
      gasPriceGWei,
      gasLimit,
      value,
      ethNonce
    } = opts;
    // Used to sign the transaction. Obviously you SHOULD better secure this than just plain text
    let privateKeyBuf = new Buffer(privateKey, 'hex');

    let gasPrice = new BigNumber(gasPriceGWei).multipliedBy(1000000000);

    let nonce = await web3.eth.getTransactionCount(address);

    nonce = ethNonce ? ethNonce : nonce;
    let rawTx = {
      nonce: web3.utils.toHex(nonce), // Nonce is the times the address has transacted, should always be higher than the last nonce 0x0#
      gasPrice: web3.utils.toHex(gasPrice.toString()), // 10 GWe
      gasLimit: web3.utils.toHex(gasLimit), // Limit
      to: destination, // The receiving address of this transaction
      value: web3.utils.numberToHex(value), // The value we are sending '0x16345785d8a0000' which is 0.1 Ether
      data: '0x'
    }
    let tx = new Tx(rawTx);
    tx.sign(privateKeyBuf); // Here we sign the transaction with the private key
    let serializedTx = tx.serialize(); // Clean things up a bit
    return new Promise(function (resolve, reject) {
      web3.eth.sendSignedTransaction('0x' + serializedTx.toString('hex'))
        .on('confirmation', function (number, receipt) {
          resolve({
            number,
            receipt
          });
        }).on('error', function (error) {
        console.error(error)
        reject({error, nonce})
      })
    })
  } catch (error) {
    console.error(error)
    return {message: "Something went wrong"};
  }
};

