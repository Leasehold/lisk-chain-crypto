const { LDPoSClient } = require('ldpos-client');

class LDPoSChainCrypto {
  constructor({chainSymbol, chainOptions}) {
    this.chainSymbol = chainSymbol;
    this.chainModuleAlias = chainOptions.moduleAlias;
    this.passphrase = chainOptions.passphrase;
  }

  async load(channel) {
    this.ldposClient = new LDPoSClient({
      passphrase: this.passphrase,
      adapter: {
        getNetworkSymbol: async () => {
          return this.chainSymbol;
        },
        getAccount: async (walletAddress) => {
          return channel.invoke(`${this.chainModuleAlias}:getAccount`, { walletAddress });
        }
      }
    });
    return this.ldposClient.connect();
  }

  async unload() {
    this.ldposClient.disconnect();
  }

  // This method checks that:
  // 1. The signerAddress corresponds to the publicKey.
  // 2. The publicKey corresponds to the signature.
  async verifyTransactionSignature(transaction, signaturePacket) {
    let { signerAddress, multisigPublicKey } = signaturePacket;
    let account = await this.ldposClient.getAccount(signerAddress);
    if (
      multisigPublicKey !== account.multisigPublicKey &&
      multisigPublicKey !== account.nextMultisigPublicKey
    ) {
      return false;
    }

    return this.ldposClient.verifyMultisigTransactionSignature(transaction, signaturePacket);
  }

  prepareTransaction(transactionData) {
    let {
      recipientAddress,
      amount,
      fee,
      timestamp,
      message
    } = transactionData;

    let unsignedTransaction = {
      type: 'transfer',
      recipientAddress,
      amount,
      fee,
      timestamp,
      message
    };

    let transaction = this.ldposClient.prepareMultisigTransaction(unsignedTransaction);
    let signature = this.ldposClient.signMultisigTransaction(transaction);

    return {
      transaction,
      signature
    };
  }
}

module.exports = LDPoSChainCrypto;
