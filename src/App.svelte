<script lang="ts">
  import AmountInput from './AmountInput.svelte';
  import QRCodeScanner from './QRCodeScanner.svelte';
  import QRCodeViewer from './QRCodeViewer.svelte';

  let balance: number = 100000000; // Example balance in sats (1 BTC = 100,000,000 sats)
  let showScanner: boolean = false;
  let showQRCode: boolean = false;
  let showAmountInput: boolean = false;
  let qrCodeData: string = '';
  let sendAmount: number = 0;

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

  function handleSendAmount() {
    if (sendAmount > 0 && sendAmount <= balance) {
      showQRCode = true;
      showAmountInput = false;
      generateQRCode();
    } else {
      alert('Please enter a valid amount');
    }
  }

  function generateQRCode() {
    qrCodeData = `wallet-address-${Math.random().toString(36).substring(7)}-amount-${sendAmount}`;
  }

  function handleScan(result: string) {
    console.log('Scanned QR code:', result);
    showScanner = false;
  }
</script>

<div class="max-w-md mx-auto my-8 p-8 bg-gray-50 rounded-lg shadow-lg sm:max-w-full sm:m-0 sm:rounded-none">
  <h1 class="text-3xl font-bold mb-6 text-center text-blue-600">My Wallet</h1>

  <div class="mb-8 text-center bg-white p-6 rounded-lg shadow">
    <p class="text-2xl font-semibold">Balance: <span class="text-green-600">{balance.toLocaleString()} sats</span></p>
  </div>

  <div class="flex justify-center space-x-6 mb-8">
    <button
      on:click={toggleScanner}
      class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition duration-300 ease-in-out transform hover:scale-105"
    >
      Receive
    </button>
    <button
      on:click={toggleAmountInput}
      class="bg-green-500 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg transition duration-300 ease-in-out transform hover:scale-105"
    >
      Send
    </button>
  </div>

  {#if showScanner}
    <QRCodeScanner onScan={handleScan} onClose={toggleScanner} />
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
</div>
