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

<div class="flex flex-col items-center relative">
  <div class="mt-4 w-full sm:w-3/4 md:w-1/2 lg:w-2/5 xl:w-1/3 max-w-[80vmin] aspect-square">
    <video bind:this={videoElement} class="w-full h-full object-cover bg-black"></video>
  </div>
</div>
