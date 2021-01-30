const { createClient } = require('ldpos-client');

class LDPoSChainCrypto {
  constructor({chainSymbol, chainOptions}) {
    this.chainSymbol = chainSymbol;
    this.chainModuleAlias = chainOptions.moduleAlias;
    this.passphrase = chainOptions.passphrase;
    this.multisigAddress = chainOptions.walletAddress;
    this.memberAddress = chainOptions.memberAddress;
  }

  async load(channel) {
    this.ldposClient = createClient({
      adapter: {
        getNetworkSymbol: async () => {
          return this.chainSymbol;
        },
        getAccount: async (walletAddress) => {
          return channel.invoke(`${this.chainModuleAlias}:getAccount`, { walletAddress });
        }
      }
    });
    return this.ldposClient.connect({
      passphrase: this.passphrase,
      walletAddress: this.memberAddress
    });
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

  async prepareTransaction(transactionData) {
    let {
      recipientAddress,
      amount,
      fee,
      timestamp,
      message
    } = transactionData;

    let unsignedTransaction = {
      type: 'transfer',
      senderAddress: this.multisigAddress,
      recipientAddress,
      amount,
      fee,
      timestamp,
      message
    };

    let transaction = this.ldposClient.prepareMultisigTransaction(unsignedTransaction);
    let signature = await this.ldposClient.signMultisigTransaction(transaction);

    return {
      transaction,
      signature
    };
  }
}

module.exports = LDPoSChainCrypto;
