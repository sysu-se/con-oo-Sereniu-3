import { Sudoku } from "./sudoku.js";
import { Game } from "./game.js";

/**
 * 创建一个新的数独实例
 * @param {number[][]} input - 9x9 初始数独盘面数组
 * @returns {Sudoku} 构建完成的数独对象
 */
export function createSudoku(input){
    return new Sudoku(input);
}

/**
 * 从 JSON 数据恢复数独实例
 * @param {Object | string} json - 序列化后的数独数据
 * @returns {Sudoku} 反序列化后的数独对象
 */
export function createSudokuFromJSON(json){
    const data = typeof json === 'string' ? JSON.parse(json) : json;
    return new Sudoku(data);
}

/**
 * 创建游戏实例
 * @param {Object} params - 配置项
 * @param {Sudoku} params.sudoku - 用于初始化游戏的数独实例
 * @returns {Game} 构建完成的游戏对象
 */
export function createGame({ sudoku }){
    return new Game(sudoku)
}

/**
 * 从 JSON 数据恢复游戏实例
 * @param {Object | string} json - 序列化后的游戏数据
 * @returns {Game} 反序列化后的游戏对象
 */
export function createGameFromJSON(json){
    const data = typeof json === 'string' ? JSON.parse(json) : json;
    const sudoku = createSudokuFromJSON(data.sudoku);

    const game = new Game(sudoku);
    game.restoreHistory(
        data.history.map(h => createSudokuFromJSON(h)),
        data.future.map(f => createSudokuFromJSON(f))
    )
    return game;
}