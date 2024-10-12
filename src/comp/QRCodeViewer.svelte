<script lang="ts">
  import QRCode from 'qrcode';
  import { onMount } from 'svelte';

  export let amount: number;
  export let qrCodeData: string;

  let qrCodeImage: string = '';

  onMount(async () => {
    try {
      qrCodeImage = await QRCode.toDataURL(qrCodeData);
    } catch (err) {
      console.error('Error generating QR code:', err);
    }
  });
</script>

<div class="bg-white p-6 rounded-lg shadow-md flex flex-col items-center mt-6 relative">
  <h2 class="text-xl font-semibold mb-4 text-center text-green-600">Your QR Code for {amount.toLocaleString()} sats</h2>
  {#if qrCodeImage}
    <img src={qrCodeImage} alt="QR Code" class="w-full h-64 object-contain rounded-lg" />
  {:else}
    <p class="text-center text-gray-600">Generating QR Code...</p>
  {/if}
</div>
