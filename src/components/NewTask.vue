<template>
  <el-row justify="center"
          type="flex"
          :gutter="40">
    <el-col :span="18">
      <el-form label-position="right"
               label-width="90px"
               ref="task"
               :model="task"
               :inline-message="false"
               :status-icon="true"
               :rules="rules">
        <el-form-item label="任务名称"
                      prop="name">
          <el-input v-model="task.name"
                    :disabled="taskStart"></el-input>
        </el-form-item>
        <el-row>
          <el-col :span="12">
            <el-form-item label="任务类型"
                          prop="type">
              <el-select v-model="task.type"
                         placeholder="请选择任务类型"
                         style="width: 100%;"
                         :disabled="taskStart">
                <el-option label="发送X ETH"
                           value="sendXETH"></el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col v-if="task.type='sendXETH'"
                  :span="12">
            <el-form-item label="转账ETH数量"
                          label-width="150px"
                          prop="data.sendNum">
              <el-input-number v-model="task.data.sendNum"
                               style="width: 100%;"
                               :max="200"
                               :min="0"
                               :precision="4"
                               :step="0.0001"/>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row style="min-height: 62px;"
                :gutter="10">
          <el-col style="margin-top:10px"
                  :span="8">
            <el-switch v-model="task.data.autoGas"
                       active-text="自动GAS"
                       inactive-text="自定义GAS"/>
          </el-col>
          <el-col v-if="!task.data.autoGas"
                  :span="8">
            <el-form-item label="gasPrice(Gwei)"
                          label-width="100px"
                          prop="data.customGasPrice">
              <el-input-number v-model="task.data.customGasPrice"
                               style="width: 100%;"
                               :max="500"
                               :min="1"
                               :step="1"></el-input-number>
            </el-form-item>
          </el-col>
          <el-col v-if="!task.data.autoGas"
                  :span="8">
            <el-form-item label="gasLimit"
                          label-width="100px"
                          prop="data.customGasLimit">
              <el-input-number v-model="task.data.customGasLimit"
                               style="width: 100%;"
                               :max="1000000"
                               :min="1000"
                               :step="100"></el-input-number>
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item v-if="task.type='sendXETH'"
                      label="合约地址"
                      prop="data.contractAddress">
          <el-input v-model="task.data.contractAddress"
                    maxlength="42"
                    placeholder="合约地址"
                    :disabled="taskStart"></el-input>
        </el-form-item>
        <el-form-item v-if="task.type='sendXETH'"
                      label="打款地址"
                      prop="data.target">
          <el-input v-model="task.data.target"
                    maxlength="42"
                    placeholder="一般为合约地址"
                    :disabled="taskStart"></el-input>
        </el-form-item>
        <el-row :gutter="10">
          <el-col :span="9">
            <el-form-item label="主账号"
                          prop="data.main.address">
              <el-input v-model="task.data.main.address"
                        maxlength="42"
                        placeholder="地址,ERC20的币聚合地址,需要保证有足够的GAS"
                        :disabled="taskStart"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="9">
            <el-form-item label="主账号私钥"
                          label-width="100px"
                          prop="data.main.privateKey">
              <el-input v-model="task.data.main.privateKey"
                        placeholder="主账号私钥，仅保存在本地"
                        :disabled="taskStart"></el-input>
            </el-form-item>
          </el-col>
        </el-row>

        <el-table
          :data="task.data.origins"
          height="480"
          ref="table"
          border
          @select="selectRow"
          :row-key="rowKey"
          style="width: 100%">
          <el-table-column
            type="selection"
            label="是否启用"
            width="55">
          </el-table-column>
          <el-table-column
            label="临时钱包地址">
            <template slot-scope="scope">
              <el-form-item label-width="0px"
                            :prop="'data.origins.' + scope.$index + '.address'"
                            :rules="[{required: true, message: '请输入以太地址', trigger: 'blur'},
              {min: 42, max: 42, message: '长度42个字符', trigger: 'blur'}]">
                <el-input v-model="scope.row.address"
                          maxlength="42"
                          placeholder="地址"
                          :disabled="taskStart"></el-input>
              </el-form-item>
            </template>
          </el-table-column>
          <el-table-column label="私钥">
            <template slot-scope="scope">
              <el-form-item label-width="0px"
                            :prop="'data.origins.' + scope.$index + '.privateKey'"
                            :rules="[{required: true, message: '请输入私钥（仅保存在本地）', trigger: 'blur'}]">
                <el-input v-model="scope.row.privateKey"
                          placeholder="私钥，仅保存在本地"
                          :disabled="taskStart"></el-input>
              </el-form-item>
            </template>
          </el-table-column>
          <el-table-column label="状态">
            <template slot-scope="scope">
              {{logs[scope.$index]}}
            </template>
          </el-table-column>
          <el-table-column label="操作">
            <template slot-scope="scope">
              <el-button-group>
                <el-button v-if="scope.$index > 0 || task.data.origins.length > 1"
                           icon="el-icon-remove"
                           type="danger"
                           :disabled="taskStart"
                           @click="removeAddress(scope.$index)"></el-button>
                <el-button v-if="scope.$index ==  task.data.origins.length - 1"
                           icon="el-icon-circle-plus-outline"
                           type="primary"
                           :disabled="taskStart"
                           @click="addAddress"></el-button>
              </el-button-group>
            </template>
          </el-table-column>

        </el-table>

        <el-form-item>
          <el-button @click="saveTask">保存任务</el-button>
          <el-button :disabled="taskStart"
                     @click="startTask">开始任务
          </el-button>
          <el-button :disabled="taskStart"
                     @click="genWallet">生成钱包
          </el-button>
          <el-button :disabled="taskStart"
                     @click="sendContract">发送合约消息
          </el-button>
          <el-button @click="testSend">测试发送</el-button>
          <el-button @click="test">测试发送</el-button>

          <el-button @click="withdraw">test</el-button>
        </el-form-item>
      </el-form>
    </el-col>
    <el-col :span="6">
      <el-input v-model="logText"
                placeholder="log"
                type="textarea"
                :autosize="{ minRows : 15, maxRows : 15}"
                :disabled="true"
                :readonly="true">
      </el-input>
    </el-col>
  </el-row>


</template>

<style>
  .el-table .cell .el-form-item {
    margin-bottom: 0px;
  }
</style>

<script>
  import {
    createWallet,
    estimateEthGasLimit,
    estimateTranferTokenGasLimit,
    getBalance,
    getContractBalance,
    sendEthTransaction,
    transFerToken
  } from '../utils/web3-helper';
  import {getCurrentGasPrices} from '../utils/gas';
  import web3 from '../utils/web3-base';

  const Tx = require('ethereumjs-tx');

  const BigNumber = require('bignumber.js');

  export default {
    name: "newTask",
    data() {

      return {
        taskStart: false,
        logText: '',
        rules: {
          customGasPrice: [{required: true, message: '请输入GasPrice,单位Gwei', trigger: 'blur'}],
          customGasLimit: [{required: true, message: '请输入GasLimit', trigger: 'blur'}],
          name: [
            {required: true, message: '请输入任务名称', trigger: 'blur'},
            {min: 1, max: 10, message: '长度在 1 到 10 个字符', trigger: 'blur'}
          ],
          type: [
            {required: true, message: '请输入任务类型', trigger: 'blur'}
          ],
          data: {
            contractAddress: [
              {required: true, message: '请输入以太地址', trigger: 'blur'},
              {min: 42, max: 42, message: '长度42个字符', trigger: 'blur'}
            ],
            sendNum: [
              {required: true, message: '请输入数字', trigger: 'blur'},
            ],
            target: [
              {required: true, message: '请输入以太地址', trigger: 'blur'},
              {min: 42, max: 42, message: '长度42个字符', trigger: 'blur'}
            ],
            main: {
              address: [
                {required: true, message: '请输入以太地址', trigger: 'blur'},
                {min: 42, max: 42, message: '长度42个字符', trigger: 'blur'}
              ],
              privateKey: [
                {required: true, message: '请输入私钥（仅保存在本地）', trigger: 'blur'}
              ]
            }
          }


        },
        logs: ['任务未进行。。。'],
        task: {
          name: 'default',
          type: 'sendXETH',
          progress: {
            params: {},
            step: -1 // -1 未启动 0 刚启动 1 步骤1已发送未返回
          },
          data: {
            autoGas: true,
            customGasPrice: '10',
            customGasLimit: '22000',
            sendNum: '0',
            contractAddress: '0x0F8B14a3eDc76Aa95F5d21bF5c7Bc125306DCe6A',
            main: {
              address: '0x72927dF62eD22430ECB168fd43eacaC264aB41BD',
              privateKey: '35694a4119ffbab2883771ebf8aa1bfd3c2da50d93fc1c5cf4fca6e666190d6b'
            },
            target: '0xD16E119f66Fbc6A2256F41054931F0BFb2106a8b',
            origins: [{
              key: Date.now(),
              select: true,
              address: '0xD469D82981C31BC0C9E3052946F26a4B6cfF2B3a',
              privateKey: 'ecc8200f8b8b87f5372505d003f66354118c758a238d044299ddeb074430b7dc'
            }, {
              key: Date.now() + 1,
              select: true,
              address: '0x89130E8F465f2310eFfeF2474F5Ed6baFBa68c58',
              privateKey: '90bffd3a6d3f5afb2f9e10d1f2a214a540ec034e4815d6ef9538172ec5957d50'
            }]
          }
        }
      }
    },
    mounted() {
      let that = this;
      this.task.data.origins.forEach(item => {
        if (item.select) {
          that.$refs.table.toggleRowSelection(item, item.select);
        }
      })
    },
    created() {

    },
    watch: {},
    methods: {
      async withdraw() {


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
          "constant": false,
          "inputs": [],
          "name": "withdrawal",
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
          "payable": true,
          "stateMutability": "payable",
          "type": "fallback"
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
        let token = new web3.eth.Contract(abi, "0x29669350334881F05247408EB69CcFf0FdA7104D");

        let privateKeyBuf = new Buffer("35694a4119ffbab2883771ebf8aa1bfd3c2da50d93fc1c5cf4fca6e666190d6b", 'hex');

        let gasPrices = await getCurrentGasPrices();

        let baseGasLimit = await estimateEthGasLimit({
          contractAddress: "0x29669350334881F05247408EB69CcFf0FdA7104D"
        })


        let gasPrice = new BigNumber(gasPrices.low).multipliedBy(1000000000);

        let nonce = await web3.eth.getTransactionCount("0x72927dF62eD22430ECB168fd43eacaC264aB41BD");

        //transform value to dest
        let tokenData = token.methods.withdrawal().encodeABI();

        let rawTx = {
          nonce: web3.utils.toHex(nonce), // Nonce is the times the address has transacted, should always be higher than the last nonce 0x0#
          gasPrice: web3.utils.toHex(gasPrice.toString()), // X GWei
          gasLimit: web3.utils.toHex(baseGasLimit+1000), // Limit
          to: "0x29669350334881F05247408EB69CcFf0FdA7104D", // to contractAddress
          value: '0x00',
          data: tokenData
        }
        let tx = new Tx(rawTx);
        tx.sign(privateKeyBuf);

        let serializedTx = tx.serialize();
        web3.eth.sendSignedTransaction('0x' + serializedTx.toString('hex'))
          .on('confirmation', function (number, receipt) {
            console.log('receipt:' + JSON.stringify(receipt))
          }).on('error', function (error) {
          console.error(error)
        })
      },
      print(index, msg) {
        console.log('[W' + index + ']:' + msg);
      },
      selectRow(selction, row) {
        row.select = !row.select;
      },
      rowKey(row) {
        return row.key;
      },
      test() {
        this.task.data.origins[0].select = !this.task.data.origins[0].select
      },
      async testSend() {

        let gasPrices = await getCurrentGasPrices();

        let tokeTransferGasLimit = await estimateTranferTokenGasLimit({
          destination: this.task.data.main.address,
          contractAddress: this.task.data.target,
          value: '0x00',
          tokenValue: '0x00'
        })

        transFerToken({
          address: this.task.data.origins[0].address,
          privateKey: this.task.data.origins[0].privateKey,
          destination: this.task.data.main.address,
          contractAddress: this.task.data.contractAddress,
          gasPriceGWei: gasPrices.low,
          gasLimit: new BigNumber(tokeTransferGasLimit).toString(),
          value: 1000
        }).then(response => {
          console.log("send token to main finish")
          console.log(JSON.stringify(response));
        })

      },
      async sendContract() {
        // getContractBalance("0x72927dF62eD22430ECB168fd43eacaC264aB41BD","0x0f8b14a3edc76aa95f5d21bf5c7bc125306dce6a")
        // let value = await getContractBalance("0x72927dF62eD22430ECB168fd43eacaC264aB41BD","0x0f8b14a3edc76aa95f5d21bf5c7bc125306dce6a");
        // let gasPrices = await getCurrentGasPrices();
        //
        // let gasLimit = '22000';
        //
        // transFerToken({
        //   address:"0x72927dF62eD22430ECB168fd43eacaC264aB41BD",
        //   privateKey:"35694a4119ffbab2883771ebf8aa1bfd3c2da50d93fc1c5cf4fca6e666190d6b",
        //   destination: "0x607F9D72120bf64942FFb5648D9A5ec364A1eD8f",
        //   contractAddress:"0x0f8b14a3edc76aa95f5d21bf5c7bc125306dce6a",
        //   gasPriceGWei:gasPrices,
        //   gasLimit:gasLimit,
        //   value:value
        // } ).then(response=>{
        //   console.log(JSON.stringify(response));
        // })


        var tabi = [{
          "constant": true,
          "inputs": [],
          "name": "name",
          "outputs": [{"name": "", "type": "string"}],
          "payable": false,
          "stateMutability": "view",
          "type": "function"
        }, {
          "constant": false,
          "inputs": [{"name": "_spender", "type": "address"}, {"name": "_value", "type": "uint256"}],
          "name": "approve",
          "outputs": [{"name": "", "type": "bool"}],
          "payable": false,
          "stateMutability": "nonpayable",
          "type": "function"
        }, {
          "constant": true,
          "inputs": [],
          "name": "totalSupply",
          "outputs": [{"name": "", "type": "uint256"}],
          "payable": false,
          "stateMutability": "view",
          "type": "function"
        }, {
          "constant": false,
          "inputs": [{"name": "_from", "type": "address"}, {"name": "_to", "type": "address"}, {
            "name": "_value",
            "type": "uint256"
          }],
          "name": "transferFrom",
          "outputs": [{"name": "", "type": "bool"}],
          "payable": false,
          "stateMutability": "nonpayable",
          "type": "function"
        }, {
          "constant": true,
          "inputs": [],
          "name": "decimals",
          "outputs": [{"name": "", "type": "uint8"}],
          "payable": false,
          "stateMutability": "view",
          "type": "function"
        }, {
          "constant": false,
          "inputs": [],
          "name": "unpause",
          "outputs": [],
          "payable": false,
          "stateMutability": "nonpayable",
          "type": "function"
        }, {
          "constant": true,
          "inputs": [],
          "name": "paused",
          "outputs": [{"name": "", "type": "bool"}],
          "payable": false,
          "stateMutability": "view",
          "type": "function"
        }, {
          "constant": false,
          "inputs": [{"name": "_spender", "type": "address"}, {"name": "_subtractedValue", "type": "uint256"}],
          "name": "decreaseApproval",
          "outputs": [{"name": "success", "type": "bool"}],
          "payable": false,
          "stateMutability": "nonpayable",
          "type": "function"
        }, {
          "constant": true,
          "inputs": [{"name": "_owner", "type": "address"}],
          "name": "balanceOf",
          "outputs": [{"name": "balance", "type": "uint256"}],
          "payable": false,
          "stateMutability": "view",
          "type": "function"
        }, {
          "constant": false,
          "inputs": [],
          "name": "pause",
          "outputs": [],
          "payable": false,
          "stateMutability": "nonpayable",
          "type": "function"
        }, {
          "constant": true,
          "inputs": [],
          "name": "owner",
          "outputs": [{"name": "", "type": "address"}],
          "payable": false,
          "stateMutability": "view",
          "type": "function"
        }, {
          "constant": true,
          "inputs": [],
          "name": "symbol",
          "outputs": [{"name": "", "type": "string"}],
          "payable": false,
          "stateMutability": "view",
          "type": "function"
        }, {
          "constant": false,
          "inputs": [{"name": "_to", "type": "address"}, {"name": "_value", "type": "uint256"}],
          "name": "transfer",
          "outputs": [{"name": "", "type": "bool"}],
          "payable": false,
          "stateMutability": "nonpayable",
          "type": "function"
        }, {
          "constant": false,
          "inputs": [{"name": "_spender", "type": "address"}, {"name": "_addedValue", "type": "uint256"}],
          "name": "increaseApproval",
          "outputs": [{"name": "success", "type": "bool"}],
          "payable": false,
          "stateMutability": "nonpayable",
          "type": "function"
        }, {
          "constant": true,
          "inputs": [{"name": "_owner", "type": "address"}, {"name": "_spender", "type": "address"}],
          "name": "allowance",
          "outputs": [{"name": "", "type": "uint256"}],
          "payable": false,
          "stateMutability": "view",
          "type": "function"
        }, {
          "constant": false,
          "inputs": [{"name": "newOwner", "type": "address"}],
          "name": "transferOwnership",
          "outputs": [],
          "payable": false,
          "stateMutability": "nonpayable",
          "type": "function"
        }, {
          "inputs": [],
          "payable": false,
          "stateMutability": "nonpayable",
          "type": "constructor"
        }, {"anonymous": false, "inputs": [], "name": "Pause", "type": "event"}, {
          "anonymous": false,
          "inputs": [],
          "name": "Unpause",
          "type": "event"
        }, {
          "anonymous": false,
          "inputs": [{"indexed": true, "name": "previousOwner", "type": "address"}, {
            "indexed": true,
            "name": "newOwner",
            "type": "address"
          }],
          "name": "OwnershipTransferred",
          "type": "event"
        }, {
          "anonymous": false,
          "inputs": [{"indexed": true, "name": "owner", "type": "address"}, {
            "indexed": true,
            "name": "spender",
            "type": "address"
          }, {"indexed": false, "name": "value", "type": "uint256"}],
          "name": "Approval",
          "type": "event"
        }, {
          "anonymous": false,
          "inputs": [{"indexed": true, "name": "from", "type": "address"}, {
            "indexed": true,
            "name": "to",
            "type": "address"
          }, {"indexed": false, "name": "value", "type": "uint256"}],
          "name": "Transfer",
          "type": "event"
        }];

        let tokeTransferGasLimit = await estimateTranferTokenGasLimit({
          address: '0x0944d75058e60a431697c37a09181640bd8d1e1f',
          destination: '0x0944d75058e60a431697c37a09181640bd8d1e1f',
          contractAddress: '0x45555629aabfea138ead1c1e5f2ac3cce2add830',
          value: '0x00',
          tokenValue: new BigNumber(50000).multipliedBy(Math.pow(10, 8)).toString()
        })

        console.log(tokeTransferGasLimit)

      },
      createNew(wallet) {
        if (!wallet) {
          wallet = createWallet();
        }
        wallet['select'] = true;
        wallet['key'] = Date.now();
        this.task.data.origins.push(wallet);
        this.$refs.table.toggleRowSelection(wallet, wallet.select)
      },
      genWallet() {

        this.$prompt('请输入生成数量', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          inputPattern: /^\d+?/,
          inputErrorMessage: '数字不正确'
        }).then(({value}) => {
          let num = parseInt(value);
          for (let i = 0; i < num; i++) {
            this.createNew();
          }
        }).catch(() => {

        });

      },
      log(text) {
        this.logText += text + '\n';
      },
      saveTask() {

      },
      async startTask() {
        //this.taskStart = true;
        console.log('send')
        const that = this;

        let gasPrices = await getCurrentGasPrices();

        let gasLimit = '25200';

        let baseGasLimit = await estimateEthGasLimit({
          contractAddress: this.task.data.target
        })

        let tokeTransferGasLimit = await estimateTranferTokenGasLimit({
          destination: this.task.data.main.address,
          contractAddress: this.task.data.contractAddress,
          value: '0x00',
          tokenValue: 0
        })

        let gasPriceGwei = new BigNumber(gasPrices.low).multipliedBy(1000000000);

        //send twice for send to contract and send to main address
        // common gas and token gasLimit
        let txValue = gasPriceGwei.multipliedBy(new BigNumber(gasLimit).plus(new BigNumber(baseGasLimit)).plus(new BigNumber(tokeTransferGasLimit))).toNumber();

        let nonce = await web3.eth.getTransactionCount(this.task.data.main.address);

        let num = this.task.data.origins.length;
        for (let i = 0; i < num; i++) {
          let cur = this.task.data.origins[i];

          if (cur.select) {
            this.sendFirstEth({
              opAddr: cur.address,
              opPriKey: cur.privateKey,
              ethGasPrice: gasPrices.low,
              ethGasLimit: gasLimit,
              tokenGasLimit: baseGasLimit + 3000,
              tokenTransferGasLimit: tokeTransferGasLimit + 5000,
              ethValue: txValue,
              index: i,
              ethNonce: nonce + i
            })
          }
        }

        //send eth to rand ethacocount

      },
      async sendFirstEth(opts) {
        let {
          opAddr,
          opPriKey,
          ethGasPrice,
          ethGasLimit,
          tokenGasLimit,
          tokenTransferGasLimit,
          ethValue,
          index,
          ethNonce
        } = opts;
        this.print(index, "send first eth")

        let lackEth = await getBalance(opAddr);

        let realEthValue = new BigNumber(lackEth).minus(ethValue).toNumber();
        this.print(index, 'real value:' + realEthValue)
        if (realEthValue >= 0) {
          this.print(index, 'send no eth')
          this.sendSecondEth({
            opAddr,
            opPriKey,
            ethGasPrice,
            tokenGasLimit,
            tokenTransferGasLimit,
            index
          });

        } else {
          this.print(index, 'send real eth value')
          sendEthTransaction({
            address: this.task.data.main.address,
            privateKey: this.task.data.main.privateKey,
            destination: opAddr,
            destinationPrivateKey: opPriKey,
            gasPriceGWei: ethGasPrice,
            gasLimit: new BigNumber(ethGasLimit).toString(),
            value: new BigNumber(realEthValue).absoluteValue().toNumber(),
            ethNonce: ethNonce
          }).then(({number, receipt}) => {
            this.print(index, "send first eth finish")
            if (receipt && receipt.status) {
              this.sendSecondEth({
                opAddr,
                opPriKey,
                ethGasPrice,
                tokenGasLimit,
                tokenTransferGasLimit,
                index
              });
            }
          }).catch(({error, nonce}) => {
            console.error(error);
            opts['ethNonce'] = nonce
            //this.sendFirstEth(opts)
          })
        }


      },
      sendSecondEth(opts) {
        let {
          opAddr,
          opPriKey,
          ethGasPrice,
          tokenGasLimit,
          tokenTransferGasLimit,
          index,
          ethNonce
        } = opts;
        //rand eth account send to contractAddress
        this.print(index, 'send 0 eth to cobtract');
        let that = this;
        sendEthTransaction({
          address: opAddr,
          privateKey: opPriKey,
          destination: this.task.data.target,
          gasPriceGWei: ethGasPrice,
          gasLimit: new BigNumber(tokenGasLimit).toString(),
          value: 0,
          ethNonce: ethNonce
        }).then(({number, receipt}) => {
          this.print(index, "send 0 eth to contract finish")
          if (receipt && receipt.status) {
            getContractBalance(opAddr, that.task.data.contractAddress)
              .then(tokenValue => {
                that.print(index, 'find token:' + tokenValue)
                that.sendThirdToken({
                  opAddr,
                  opPriKey,
                  ethGasPrice,
                  tokenTransferGasLimit,
                  tokenValue,
                  index
                });
              })
          }
        }).catch(({error, nonce}) => {
          opts['ethNonce'] = nonce
          //this.sendSecondEth(opts)
        })
      },
      async sendThirdToken(opts) {
        let {
          opAddr,
          opPriKey,
          ethGasPrice,
          tokenTransferGasLimit,
          tokenValue,
          index,
          ethNonce
        } = opts;
        this.print(index, 'send token to main');
        transFerToken({
          address: opAddr,
          privateKey: opPriKey,
          destination: this.task.data.main.address,
          contractAddress: this.task.data.contractAddress,
          gasPriceGWei: ethGasPrice,
          gasLimit: new BigNumber(tokenTransferGasLimit).toString(),
          tokenValue: tokenValue,
          value: 0,
          ethNonce: ethNonce
        }).then(({number, receipt}) => {
          this.print(index, "send token to main finish")
          this.print(index, JSON.stringify(receipt));
        }).catch((error, nonce) => {
          opts['ethNonce'] = nonce;
          //this.sendThirdToken(opts)
        })
      },
      addAddress() {
        this.createNew({});
      },
      removeAddress(index) {
        this.task.data.origins.splice(index, 1);
      },
      addTask() {

      }
    }
  }
</script>

