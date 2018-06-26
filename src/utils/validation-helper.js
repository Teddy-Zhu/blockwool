import web3 from './web3-base.js';
/**
 * Validate inputs received from getBalance API.
 */
export function getBalanceValid(address) {
  if (!address) {
    return {status: false, message: "Please provide a wallet address"};
  }
  if (!web3.utils.isAddress(address)) {
    return {status: false, message: "Please provide a valid ether wallet address"};
  }
  return {status: true};
}


/**
 * Validate inputs received from sendTransaction API.
 */
export function sendTransactionValid(destination, privateKey) {

  if (destination && privateKey) {
    if (!web3.utils.isAddress(destination)) {
      return {status: false, message: "Please provide a valid ether wallet address"};
    }
    return {status: true};
  } else {
    return {
      status: false,
      message: "Please provide all required values(amount, privateKey and destination)"
    };
  }
}

