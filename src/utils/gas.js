const axios = require('axios');


export async function getCurrentGasPrices() {
  try {
    let response = await axios.get('https://ethgasstation.info/json/ethgasAPI.json');

    let prices = {
      low: response.data.average / 10,
      medium: response.data.average / 10,
      high: response.data.fast / 10
    };

    return prices;

  } catch (error) {
    throw error;
  }
}
