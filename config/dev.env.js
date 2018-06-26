'use strict'
const merge = require('webpack-merge')
const prodEnv = require('./prod.env')

module.exports = merge(prodEnv, {
  NODE_ENV: '"development"',
  // NET_URL: '"https://mainnet.infura.io/RiYLMZ1WjxrI96ygP0sN"'
  NET_URL: '"https://rinkeby.infura.io/RiYLMZ1WjxrI96ygP0sN"'
})

