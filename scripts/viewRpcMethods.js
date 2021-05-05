const Web3 = require('web3');

const web3 = new Web3(new Web3.providers.HttpProvider('http://localhost:9933'));

async function viewRpc() {
    output = await web3.eth.getTransactionCount("0x6be02d1d3665660d22ff9624b7be0551ee1ac91b");
    console.log(output);
}

viewRpc();

