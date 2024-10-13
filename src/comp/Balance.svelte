<script lang="ts">
  import { createEventDispatcher, afterUpdate } from 'svelte';

  export let balance: number;
  export let refreshBalance: () => void;

  const dispatch = createEventDispatcher();
  let isUpdating = false;
  let previousBalance = balance;

  afterUpdate(() => {
    if (balance !== previousBalance) {
      isUpdating = true;
      previousBalance = balance;
      setTimeout(() => {
        isUpdating = false;
      }, 2000);
    }
  });

  async function handleRefresh() {
    dispatch('refresh');
    await refreshBalance();
  }
</script>

<div class="mb-8 text-center bg-white p-6 rounded-lg shadow">
  <div class="flex items-center justify-center">
    <p class="text-3xl font-bold mr-2">
      <span class="{isUpdating ? 'gradient-fill' : 'text-black'}">Balance: {balance.toLocaleString()} sats</span>
    </p>
    <button
      on:click={handleRefresh}
      class="text-blue-500 hover:text-blue-600 font-bold py-2 px-4 rounded-full transition duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-50 shadow-md"
    >
      <svg class="w-5 h-5 inline-block" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
      </svg>
    </button>
  </div>
</div>

<style>
  @keyframes gradientMove {
    0% {
      background-position: 0% 50%;
    }
    50% {
      background-position: 100% 50%;
    }
    100% {
      background-position: 0% 50%;
    }
  }

  .gradient-fill {
    background: linear-gradient(90deg, #22c55e, #3b82f6, #ec4899, #22c55e);
    background-size: 300% 100%;
    -webkit-background-clip: text;
    background-clip: text;
    color: transparent;
    animation: gradientMove 2s ease infinite;
  }
</style>
