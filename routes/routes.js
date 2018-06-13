const Web3 = require('web3')
const Tx = require('ethereumjs-tx')

var appRouter = function (app) {
  app.post("/transactions", function (req, res) {
    const addressTo = req.body.address
    const value = req.body.amount
    const addressFrom = req.body.from
    const privKey = req.body.key
    const web3 = new Web3(new Web3.providers.HttpProvider(`https://ropsten.infura.io/${req.body.api_key}`))

    function sendSigned(txData, cb) {
      const privateKey = new Buffer(privKey, 'hex')
      const transaction = new Tx(txData)
      transaction.sign(privateKey)
      const serializedTx = transaction.serialize().toString('hex')
      web3.eth.sendSignedTransaction('0x' + serializedTx, cb)
    }
    
    web3.eth.getTransactionCount(addressFrom).then(txCount => {
    
      const txData = {
        nonce: web3.utils.toHex(txCount),
        gasLimit: web3.utils.toHex(25000),
        gasPrice: web3.utils.toHex(10e9), // 10 Gwei
        to: addressTo,
        from: addressFrom,
        value: web3.utils.toHex(web3.utils.toWei(value, 'wei'))
      }

      sendSigned(txData, function(err, result) {
        if (err) return res.status(400).send(err);
        res.status(200).send({hash: result});
      })
    })
  });
}
module.exports = appRouter;