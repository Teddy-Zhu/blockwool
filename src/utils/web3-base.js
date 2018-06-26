const Web3 = require('web3');
const config = require('../../config');

let web3Conn = new Web3(new Web3.providers.HttpProvider(config.ethNetUrl));

export default web3Conn
