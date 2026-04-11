function isValidSet(numbers) {
    const set = new Set(numbers);
    if (set.has(0)) return false;
    if (set.size !== 9) return false;
    return true;
}

/**
 * 数独盘面类
 * 职责：管理盘面数据、落子、复制、序列化展示
 */
class Sudoku {
    // 内部存储的 9x9 数独网格
    #grid;
    #fixed;

    /**
     * 构造函数
     * @param {number[][]} grid - 初始二维数组
     */
    constructor(grid) {
        this.#grid = this.deepCopy(grid);
        this.#fixed = this.deepCopy(grid);
    }

    /**
     * 获取当前网格副本
     * @returns {number[][]}
     */
    getGrid() {
        return this.deepCopy(this.#grid);
    }

    /**
     * 判断是否是固定数字
     */
    isFixed(row, col){
        return this.#fixed[row][col]!=0
    }

    /**
     * 落子操作
     * @param {Object} move - { row, col, value }
     */
    guess(move) {
        const { row, col, value } = move;
        if (this.isFixed(row, col)) {return;}

        if (row < 0 || row >= 9 || col < 0 || col >= 9) {
            return;
        }

        this.#grid[row][col] = value;
    }

    /**
     * 深度拷贝 9x9 数组
     * @param {number[][]} original
     * @returns {number[][]} 新数组
     */
    deepCopy(original) {
        const copy = Array(9).fill().map(() => Array(9).fill(0));
        for (let i = 0; i < 9; i++) {
            for (let j = 0; j < 9; j++) {
                copy[i][j] = original[i][j];
            }
        }
        return copy;
    }

    /**
     * 创建当前盘面的全新副本
     * @returns {Sudoku}
     */
    clone() {
        const copy = new Sudoku(this.getGrid())
        copy.#fixed = this.deepCopy(this.#fixed)
        return copy;
    }

    /**
     * 序列化为纯数组格式
     * @returns {number[][]}
     */
    toJSON() {
        return this.getGrid();
    }

    /**
     * 转为可读字符串
     * @returns {string}
     */
    toString() {
        let s = "";
        for (let i = 0; i < 9; i++) {
            for (let j = 0; j < 9; j++) {
                s += (this.#grid[i][j] === 0 ? "·" : this.#grid[i][j]) + " ";
            }
            s += "\n";
        }
        return s;
    }

    /**
     * 判断当前盘面是否胜利
     */
    isWon() {
        const grid = this.#grid;

        // 检查每一行
        for (let r = 0; r < 9; r++) {
            if (!isValidSet(grid[r])) return false;
        }

        // 检查每一列
        for (let c = 0; c < 9; c++) {
            const col = grid.map(row => row[c]);
            if (!isValidSet(col)) return false;
        }

        // 检查每个 3×3 宫
        for (let boxRow = 0; boxRow < 3; boxRow++) {
            for (let boxCol = 0; boxCol < 3; boxCol++) {
                const box = [];
                for (let r = 0; r < 3; r++) {
                    for (let c = 0; c < 3; c++) {
                        box.push(grid[boxRow * 3 + r][boxCol * 3 + c]);
                    }
                }
                if (!isValidSet(box)) return false;
            }
        }

        return true;
    }

    getInvalidCells() {
        const invalid = [];
        const addInvalid = (x, y) => {
            const key = x + ',' + y;
            if (!invalid.includes(key)) invalid.push(key);
        };

        for (let y = 0; y < 9; y++) {
            for (let x = 0; x < 9; x++) {
                const value = this.#grid[y][x];
                if (!value) continue;

                for (let i = 0; i < 9; i++) {
                    if (i !== x && this.#grid[y][i] === value) addInvalid(x, y);
                    if (i !== y && this.#grid[i][x] === value) addInvalid(x, y);
                }

                const startY = Math.floor(y / 3) * 3;
                const startX = Math.floor(x / 3) * 3;
                for (let r = startY; r < startY + 3; r++) {
                    for (let c = startX; c < startX + 3; c++) {
                        if ((r !== y || c !== x) && this.#grid[r][c] === value) {
                            addInvalid(x, y);
                        }
                    }
                }
            }
        }
        return invalid;
    }
}

export { Sudoku };