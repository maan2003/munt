<script lang="ts">
  export let value: number;
  export let max: number;
  export let onSubmit: () => void;

  let focused = false;
  let formattedValue = '';

  $: {
    if (!focused) {
      formattedValue = value.toLocaleString();
    }
  }

  function handleInput(event: Event) {
    const input = event.target as HTMLInputElement;
    const newValue = input.value.replace(/[^\d]/g, '');
    value = parseInt(newValue) || 0;
    formattedValue = newValue;
  }

  function handleFocus() {
    focused = true;
    formattedValue = value.toString();
  }

  function handleBlur() {
    focused = false;
    formattedValue = value.toLocaleString();
  }

  function handleSubmit() {
    if (value > 0 && value <= max) {
      onSubmit();
    } else {
      alert('Please enter a valid amount');
    }
  }
</script>

<div class="flex flex-col gap-4">
  <div class="relative flex items-center">
    <input
      type="text"
      bind:value={formattedValue}
      on:input={handleInput}
      on:focus={handleFocus}
      on:blur={handleBlur}
      class="w-full py-3 px-4 text-xl border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 transition-colors duration-200"
      placeholder="Enter amount"
    />
    <span class="absolute right-4 text-gray-500 text-base">sats</span>
  </div>
  <button
    on:click={handleSubmit}
    class="bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-4 rounded-lg transition-colors duration-200 cursor-pointer"
  >
    Generate QR Code
  </button>
</div>
