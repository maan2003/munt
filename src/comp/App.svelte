<script lang="ts">
  import { onMount } from 'svelte';
  import AmountInput from './AmountInput.svelte';
  import QRCodeScanner from './QRCodeScanner.svelte';
  import QRCodeViewer from './QRCodeViewer.svelte';
  import Balance from './Balance.svelte';
  import { Wallet } from '../lib/wallet';

  let showScanner: boolean = false;
  let showQRCode: boolean = false;
  let showAmountInput: boolean = false;
  let qrCodeData: string = '';
  let sendAmount: number = 0;
  let wallet;
  let mnemonic: string;
  let mnemonicError: string = '';
  let balance: number = 0;
  let mintUrl: string = "https://mint.minibits.cash/Bitcoin";

  let activeTasks: Set<string> = new Set();

  onMount(() => {
    const storedMnemonic = localStorage.getItem('mnemonic');
    if (storedMnemonic) {
      mnemonic = storedMnemonic;
    } else {
      generateNewMnemonic();
    }
  });

  function generateNewMnemonic() {
    mnemonic = Wallet.generateMnemonic();
    localStorage.setItem('mnemonic', mnemonic);
  }

  async function updateWallet(mnemonic) {
    activeTasks.add('updateWallet');
    activeTasks = activeTasks;
    try {
      Wallet.validateMnemonic(mnemonic);
      mnemonicError = '';
      console.log(wallet);
      wallet = await Wallet.init(mintUrl, mnemonic);
      console.log(wallet);
      localStorage.setItem('mnemonic', mnemonic);
    } catch (error) {
      mnemonicError = error;
      wallet = undefined;
    } finally {
      activeTasks.delete('updateWallet');
      activeTasks = activeTasks;
    }
  }
  $: updateWallet(mnemonic);

  async function updateBalance(wallet) {
    if (wallet) {
      balance = await wallet.getBalance();
    } else {
      balance = 0;
    }
  }
  $: updateBalance(wallet);

  async function refreshBalance() {
    await wallet.refresh();
    balance = await wallet.getBalance();
    return balance;
  }

  function toggleScanner() {
    showScanner = !showScanner;
    showQRCode = false;
    showAmountInput = false;
  }

  function toggleAmountInput() {
    showAmountInput = !showAmountInput;
    showScanner = false;
    showQRCode = false;
    sendAmount = 0;
  }

  async function handleSendAmount() {
    activeTasks.add('sendAmount');
    activeTasks = activeTasks;
    try {
      const result = await wallet.send(sendAmount);
      qrCodeData = result;
      showQRCode = true;
      showAmountInput = false;
      wallet = wallet;
    } catch (error) {
      alert('Failed to send. Please check the amount.');
    } finally {
      activeTasks.delete('sendAmount');
      activeTasks = activeTasks;
    }
  }

  async function handleScan(result: string) {
    console.log('Scanned QR code:', result);
    if (!showScanner) return;
    showScanner = false;
    activeTasks.add('receiveAmount');
    activeTasks = activeTasks;
    try {
      const success = await wallet.receive(result);
      wallet = wallet;
    } catch (error) {
      console.error(error)
      alert('Error processing QR code');
    } finally {
      activeTasks.delete('receiveAmount');
      activeTasks = activeTasks;
    }
  }
</script>
<div class="max-w-md mx-auto my-8 p-8 bg-gray-50 rounded-lg shadow-lg sm:max-w-full sm:m-0 sm:rounded-none">
  <h1 class="text-3xl font-bold mb-6 text-center text-blue-600">My Wallet</h1>

  <div class="mb-4 text-center bg-white p-4 rounded-lg shadow">
    <h2 class="text-lg font-semibold mb-2 text-blue-600">Mint URL</h2>
    <p class="text-sm text-gray-600 break-all">{mintUrl}</p>
  </div>

  <Balance {balance} {refreshBalance} on:refresh={() => wallet = wallet} />

  <div class="mb-6 text-center bg-white p-4 rounded-lg shadow">
    <h2 class="text-xl font-semibold mb-2 text-blue-600">Mnemonic Phrase</h2>
    <div class="flex items-center">
      <input
        type="text"
        bind:value={mnemonic}
        placeholder="Enter your mnemonic phrase"
        class="flex-grow p-2 border rounded text-sm text-gray-600 {mnemonicError ? 'border-red-500' : ''}"
      />
      <button
        on:click={generateNewMnemonic}
        class="ml-2 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition duration-300 ease-in-out transform hover:scale-105"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
        </svg>
      </button>
    </div>
    {#if mnemonicError}
      <p class="text-red-500 text-sm mt-2">{mnemonicError}</p>
    {/if}
  </div>

  <div class="flex justify-center space-x-6 mb-8">
    <button
      on:click={toggleScanner}
      class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition duration-300 ease-in-out transform hover:scale-105"
      disabled={activeTasks.has('receiveAmount')}
    >
      Receive
    </button>
    <button
      on:click={toggleAmountInput}
      class="bg-green-500 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg transition duration-300 ease-in-out transform hover:scale-105"
      disabled={activeTasks.has('sendAmount')}
    >
      Send
    </button>
  </div>

  {#if showScanner}
    <QRCodeScanner onScan={handleScan} />
  {/if}

  {#if showAmountInput}
    <div class="bg-white p-6 rounded-lg shadow-md">
      <h2 class="text-xl font-semibold mb-4 text-center text-green-600">Enter Amount to Send</h2>
      <AmountInput bind:value={sendAmount} max={balance} onSubmit={handleSendAmount} />
    </div>
  {/if}

  {#if showQRCode}
    <QRCodeViewer amount={sendAmount} qrCodeData={qrCodeData} />
  {/if}

  <div class="mt-4 text-center p-2 rounded-lg h-12 flex items-center justify-center text-gray-500 text-xs">
      {#if activeTasks.size > 0}
        <h3 class="font-medium mr-2">Active Tasks:</h3>
      {/if}
    <ul class="flex space-x-2">
      {#each Array.from(activeTasks) as task}
        <li>{task}</li>
      {/each}
    </ul>
  </div>
</div>
