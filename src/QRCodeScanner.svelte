<script lang="ts">
  import { onMount } from 'svelte';
  import QrScanner from 'qr-scanner';

  export let onScan: (result: string) => void;
  export let onClose: () => void;

  let isMobile: boolean = false;
  let videoElement: HTMLVideoElement;
  let scanner: QrScanner | null = null;

  onMount(() => {
    isMobile = window.innerWidth <= 640;
    window.addEventListener('resize', () => {
      isMobile = window.innerWidth <= 640;
    });

    if (videoElement) {
      scanner = new QrScanner(
        videoElement,
        (result) => onScan(result.data),
        {
          highlightScanRegion: true,
          highlightCodeOutline: true,
          maxScansPerSecond: 5,
          preferredCamera: 'environment'
        }
      );
      scanner.start();
    }

    return () => {
      if (scanner) {
        scanner.stop();
        scanner.destroy();
      }
    };
  });
</script>

<div class={`flex flex-col items-center mt-6 relative w-full h-[300px] bg-black overflow-hidden ${isMobile ? 'fixed inset-0 z-50 h-full mt-0' : ''}`}>
  <button on:click={onClose} class="absolute top-4 right-4 text-white text-2xl bg-black bg-opacity-50 hover:bg-opacity-70 rounded-full w-10 h-10 flex items-center justify-center cursor-pointer z-60 transition-colors duration-200">
    &times;
  </button>
  <video bind:this={videoElement} class="w-full h-full object-cover absolute inset-0"></video>
</div>
