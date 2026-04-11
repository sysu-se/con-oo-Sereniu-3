import {Sudoku} from "./sudoku";

/**
 * 游戏会话类
 * 职责：管理当前数独盘面、历史记录栈、撤销与重做功能
 */
class Game {
    // 当前正在进行的数独实例
    #current;
    // 历史快照栈，用于撤销操作
    #history;
    // 重做快照栈，用于重做操作
    #future;

    /**
     * 构造函数
     * @param {Sudoku} sudoku - 初始数独盘面
     */
    constructor(sudoku) {
        this.#current = sudoku;
        this.#history = [];
        this.#future = [];
    }

    /**
     * 获取当前数独实例
     * @returns {Sudoku} 当前数独对象
     */
    getSudoku() {
        const grid = this.#current.getGrid();
        return new Sudoku(grid)
    }

    /**
     * 落子并记录历史状态
     * @param {Object} move - 落子信息 { row, col, value }
     */
    guess(move) {
        // 保存当前状态到历史栈
        this.#history.push(this.#current.clone());
        // 清空重做栈
        this.#future = [];
        // 执行落子操作
        this.#current.guess(move);
    }

    /**
     * 撤销上一步操作
     */
    undo() {
        if (!this.canUndo()) return;
        // 将当前状态存入重做栈
        this.#future.push(this.#current.clone());
        // 从历史栈恢复上一步状态
        this.#current = this.#history.pop();
    }

    /**
     * 重做上一步撤销的操作
     */
    redo() {
        if (!this.canRedo()) return;
        // 将当前状态存入历史栈
        this.#history.push(this.#current.clone());
        // 从重做栈恢复状态
        this.#current = this.#future.pop();
    }

    /**
     * 判断是否可以撤销
     * @returns {boolean}
     */
    canUndo() {
        return this.#history.length > 0;
    }

    /**
     * 判断是否可以重做
     * @returns {boolean}
     */
    canRedo() {
        return this.#future.length > 0;
    }

    /**
     * 序列化游戏数据
     * @returns {Object} 包含当前盘面、历史、重做数据
     */
    toJSON() {
        return {
            sudoku: this.#current.toJSON(),
            history: this.#history.map(i => i.toJSON()),
            future: this.#future.map(i => i.toJSON()),
        };
    }

    isFixed(row, col) {
        return this.#current.isFixed(row, col);
    }

    restoreHistory(history, future) {
        this.#history = history;
        this.#future = future;
    }

    isWon(){
        return this.#current.isWon();
    }

    getInvalidCells() {
        return this.#current.getInvalidCells();
    }

    getGrid() {
        return this.#current.getGrid();
    }

}

export { Game };