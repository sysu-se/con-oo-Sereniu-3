<script>
    import { notes } from '@sudoku/stores/notes';
    import { settings } from '@sudoku/stores/settings';
    import { hints } from '@sudoku/stores/hints';   // 添加这一行

    export let gameStore;

    $: canUndo = $gameStore.canUndo;
    $: canRedo = $gameStore.canRedo;
    $: gameWon = $gameStore.won;
    $: hintsAvailable = $hints > 0;
</script>

<div class="action-buttons space-x-3">
    <button
            class="btn btn-round"
            on:click={() => gameStore.undo()}
            disabled={!canUndo || gameWon}
            title="Undo">
        <svg class="icon-outline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
        </svg>
    </button>

    <button
            class="btn btn-round"
            on:click={() => gameStore.redo()}
            disabled={!canRedo || gameWon}
            title="Redo">
        <svg class="icon-outline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 10h-10a8 8 90 00-8 8v2M21 10l-6 6m6-6l-6-6" />
        </svg>
    </button>

    <button class="btn btn-round btn-badge" disabled={true} title="Hints">
        <svg class="icon-outline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
        {#if $settings.hintsLimited}
            <span class="badge" class:badge-primary={hintsAvailable}>{$hints}</span>
        {/if}
    </button>

    <button
            class="btn btn-round btn-badge"
            on:click={notes.toggle}
            title="Notes ({$notes ? 'ON' : 'OFF'})">
        <svg class="icon-outline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
        </svg>
        <span class="badge tracking-tighter" class:badge-primary={$notes}>{$notes ? 'ON' : 'OFF'}</span>
    </button>
</div>