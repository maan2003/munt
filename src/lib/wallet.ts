import { CashuMint, CashuWallet, getEncodedToken, getDecodedToken, type Token, type Proof } from '@cashu/cashu-ts';

export class Wallet {
  private _cashuWallet: CashuWallet;
  private _proofs: Proof[] = [];

  constructor(mintUrl: string) {
    this._cashuWallet = new CashuWallet(new CashuMint(mintUrl));
  }

  get balance(): number {
    return this._proofs.reduce((sum, proof) => sum + proof.amount, 0);
  }

  async send(amount: number): Promise<string> {
    if (amount <= 0 || amount > this.balance) {
      throw new Error('Invalid amount');
    }

    // TODO: more granular coin selection
    const { returnChange, send } = await this._cashuWallet.send(amount, this._proofs);

    // Update the wallet's proofs after sending
    this._proofs = returnChange;

    return getEncodedToken({ token: [{ proofs: send, mint: this._cashuWallet.mint.mintUrl }] });
  }

  async receive(token: string): Promise<boolean> {
    try {
      const newProofs = await this._cashuWallet.receive(token);

      this._proofs = [...this._proofs, ...newProofs];
      return true;
    } catch (error) {
      console.error('Error receiving token:', error);
      return false;
    }
  }
}
