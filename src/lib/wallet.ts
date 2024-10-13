import { CashuMint, CashuWallet, getEncodedToken, getDecodedToken, type Token, type Proof } from '@cashu/cashu-ts';
import init, { WasmEcashManager } from "../pkg/ecash_syncer"

const initPromise = await init();

export class Wallet {
  private _cashuWallet: CashuWallet;
  private _ecash_manager: WasmEcashManager;

  private constructor(mintUrl: string, ecash: WasmEcashManager) {
    this._cashuWallet = new CashuWallet(new CashuMint(mintUrl));
    this._ecash_manager = ecash;
  }

  static async init(mintUrl: string, mnemonic: string) {
    return new Wallet(mintUrl, await WasmEcashManager.new(mnemonic.split(" ")));
  }

  static validateMnemonic(mn: string) {
    WasmEcashManager.validate_mnemonic(mn);
  }

  static generateMnemonic(): string {
    return WasmEcashManager.generate_mnemonic();
  }

  async getBalance(): number {
    return (await this._ecash_manager.get_cached_notes()).reduce((sum, proof) => sum + JSON.parse(proof).amount, 0);
  }

  async send(amount: number): Promise<string> {
    if (amount <= 0 || amount > await this.getBalance()) {
      throw new Error('Invalid amount');
    }

    const selectedNotes = await this._ecash_manager.select_notes((notes) => {
      const parsedNotes = notes.map(JSON.parse);
      let sum = 0;
      const selected = [];
      for (const note of parsedNotes) {
        if (sum >= amount) break;
        sum += note.amount;
        selected.push(note);
      }
      return selected.map(JSON.stringify);
    });

    const parsedProofs = selectedNotes.map(JSON.parse);
    const { returnChange, send } = await this._cashuWallet.send(amount, parsedProofs);
    console.log('Return change:', returnChange);
    await this._ecash_manager.add_notes(returnChange.map(JSON.stringify));

    console.log('Proofs to send:', send);
    console.log('Mint URL:', this._cashuWallet.mint.mintUrl);
    const encodedToken = getEncodedToken({ token: [{ proofs: send, mint: this._cashuWallet.mint.mintUrl }] });
    console.log('Encoded token:', encodedToken);

    return encodedToken;
  }

  async receive(token: string): Promise<boolean> {
    try {
      const newProofs = await this._cashuWallet.receive(token);

      const stringifiedProofs = newProofs.map(JSON.stringify);
      console.log('Stringified proofs:', stringifiedProofs);
      await this._ecash_manager.add_notes(stringifiedProofs);
      return true;
    } catch (error) {
      console.error('Error receiving token:', error);
      return false;
    }
  }

  async refresh(): Promise<void> {
    await this._ecash_manager.refresh()
  }
}
