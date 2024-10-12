import { CashuWallet, getEncodedToken, getDecodedToken, type Token, type Proof } from '@cashu/cashu-ts';

export class Wallet {
  private _cashuWallet: CashuWallet;
  private _proofs: Proof[] = [];

  constructor(mintUrl: string) {
    this._cashuWallet = new CashuWallet(mintUrl);
  }

  get balance(): number {
    return this._proofs.reduce((sum, proof) => sum + proof.amount, 0);
  }

  async send(amount: number): Promise<string> {
    if (amount <= 0 || amount > this.balance) {
      throw new Error('Invalid amount');
    }

    const { token } = await this._cashuWallet.send(amount, this._proofs);

    // Update the wallet's proofs after sending
    this._proofs = this._proofs.filter(proof =>
      !token.token[0].proofs.some(sentProof => sentProof.secret === proof.secret)
    );

    return getEncodedToken(token);
  }

  async receive(encodedToken: string): Promise<boolean> {
    try {
      const token = getDecodedToken(encodedToken);
      const { newKeys, proofs: receivedProofs } = await this._cashuWallet.receive(token);

      this._proofs = [...this._proofs, ...receivedProofs];
      return true;
    } catch (error) {
      console.error('Error receiving token:', error);
      return false;
    }
  }
}
