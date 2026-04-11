import { writable } from 'svelte/store';
import { createSudoku, createGame } from '../domain/index.js';

/**
 * 创建一个游戏 Store，内部持有 Game 实例，并暴露响应式状态
 * @param {number[][]} initialGrid 初始数独盘面
 */
export function createGameStore(initialGrid) {
    // 初始化领域对象
    let sudoku = createSudoku(initialGrid);
    let game = createGame({ sudoku });

    // 响应式状态（一个对象，包含 UI 需要的所有数据）
    const { subscribe, set, update } = writable({
        grid: game.getGrid(),
        invalidCells: game.getInvalidCells(),
        won: game.isWon(),
        canUndo: game.canUndo(),
        canRedo: game.canRedo()
    });

    // 刷新 store 中的数据（从当前 game 中读取）
    function refresh() {
        set({
            grid: game.getGrid(),
            invalidCells: game.getInvalidCells(),
            won: game.isWon(),
            canUndo: game.canUndo(),
            canRedo: game.canRedo()
        });
    }

    // 暴露给 UI 的方法
    return {
        subscribe,   // 让组件可以用 $gameStore 语法

        // 用户落子
        guess(row, col, value) {
            game.guess({ row, col, value });
            refresh();
        },

        undo() {
            game.undo();
            refresh();
        },

        redo() {
            game.redo();
            refresh();
        },

        // 开始新游戏（清空历史）
        newGame(initialGrid) {
            const newSudoku = createSudoku(initialGrid);
            game = createGame({ sudoku: newSudoku });
            refresh();
        },

        // 从 JSON 加载游戏
        loadFromJSON(json) {
            game = createGameFromJSON(json);
            refresh();
        },

        // 辅助方法：判断格子是否固定（不可修改）
        isFixed(row, col) {
            return game.isFixed(row, col);
        },

        // 获取当前游戏快照（用于保存）
        toJSON() {
            return game.toJSON();
        }
    };
}