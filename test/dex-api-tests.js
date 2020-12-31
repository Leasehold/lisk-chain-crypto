const assert = require('assert');
const LDPoSChainCrypto = require('../index');
const Channel = require('./utils/channel');

describe('DEX (ChainCrypto) API tests', async () => {
  let options;
  let chainCrypto;
  let channel;

  beforeEach(async () => {
    options = {
      chainSymbol: 'ldpos',
      chainOptions: {
        passphrase: 'clerk aware give dog reopen peasant duty cheese tobacco trouble gold angle'
      }
    };
    channel = new Channel();
    chainCrypto = new LDPoSChainCrypto(options);
    await chainCrypto.load(channel);
  });

  afterEach(async () => {
    await chainCrypto.unload();
  });

  describe('verifyTransactionSignature', async () => {

    beforeEach(async () => {

    });

    it('should return true if the signature belongs to the correct account and is valid', async () => {
      // let isValid = chainCrypto.verifyTransactionSignature(transaction, signaturePacket);
      // assert.equal(isValid, true);
    });

    it('should return false if the signature belongs to the correct account but is not valid', async () => {

    });

    it('should return false if the signature is valid but does not belong to the correct account', async () => {

    });

  });

  describe('prepareTransaction', async () => {

    beforeEach(async () => {

    });

    it('should prepare and sign transaction with all required properties', async () => {

    });

  });

});
