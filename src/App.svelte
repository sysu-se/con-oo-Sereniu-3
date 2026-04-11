<script>
    import { onMount } from 'svelte';
    import { createGameStore } from './stores/gameStore.js';
    import { modal } from '@sudoku/stores/modal';
    import Board from './components/Board/index.svelte';
    import Controls from './components/Controls/index.svelte';
    import Header from './components/Header/index.svelte';
    import Modal from './components/Modal/index.svelte';

    const defaultInitialGrid = [
        [5, 3, 0, 0, 7, 0, 0, 0, 0],
        [6, 0, 0, 1, 9, 5, 0, 0, 0],
        [0, 9, 8, 0, 0, 0, 0, 6, 0],
        [8, 0, 0, 0, 6, 0, 0, 0, 3],
        [4, 0, 0, 8, 0, 3, 0, 0, 1],
        [7, 0, 0, 0, 2, 0, 0, 0, 6],
        [0, 6, 0, 0, 0, 0, 2, 8, 0],
        [0, 0, 0, 4, 1, 9, 0, 0, 5],
        [0, 0, 0, 0, 8, 0, 0, 7, 9]
    ];

    let gameStore = createGameStore(defaultInitialGrid);
    $: gameState = $gameStore;

    $: if (gameState.won) {
        modal.show('gameover');
    }

    onMount(() => {
        let hash = location.hash.slice(1);
        if (hash) {
            try {
                const json = JSON.parse(atob(hash));
                gameStore.loadFromJSON(json);
            } catch(e) {
                console.warn('Failed to load from hash', e);
            }
        }
        modal.show('welcome');
    });
</script>

<Header />
<section>
    <Board gameStore={gameStore} />
</section>
<footer>
    <Controls gameStore={gameStore} />
</footer>
<Modal />

<style global>
    @import "./styles/global.css";
</style>