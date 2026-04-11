# DESIGN.md

## 1. Sudoku / Game 职责边界

- **Sudoku**：负责数独盘面的数据管理，包含棋盘存储、落子操作、深拷贝、序列化与外表化展示。不处理历史记录。
- **Game**：负责一局游戏的完整生命周期管理，通过 `#history` / `#future` 栈实现撤销 / 重做，是 UI 与核心逻辑的接口。

## 2. 值对象Move

Move 是**值对象**，其仅包含 `row`、`col`、`value` 三个字段，无任何行为与方法，无唯一标识，仅用于描述并传递一次落子信息。

## 3. history 中存储内容

`history` 与 `future`存储的是 **Sudoku 实例的深拷贝快照**。

原因：

- 快照模式实现简洁、稳定性高。
- 每一步历史状态完全独立，避免引用共享导致的 Undo/Redo 异常。
- 对于 9×9 数独而言，每个快照仅 81 个整数，内存代价可忽略不计。

## 4. 复制策略

统一采用**深拷贝**策略，保证所有状态相互隔离、互不干扰。

需要深拷贝的位置：

- `constructor(grid)`：接收外部数组时深拷贝，防止外部修改影响内部状态
- `getGrid()`：返回给外部时深拷贝，防止外部篡改 `#grid`
- `clone()`：生成历史快照时深拷贝，保证快照与当前局面完全独立
- `#history` / `#future` 入栈：通过 `clone()` 深拷贝后压栈，确保入栈后的后续操作不影响已保存的历史

若误用浅拷贝，后续的 `guess()` 将同时修改历史栈中的数据，导致所有历史状态与当前局面完全一致，Undo/Redo 完全失效。

## 5. 序列化 / 反序列化设计

- **序列化**：`toJSON()` 将对象转为纯数据结构（9×9 数字数组），用于存储与传输。
- **反序列化**：`createSudokuFromJSON` 与 `createGameFromJSON` 从纯数据重建可运行对象。

## 6. 外表化接口设计

- **`toString()`**：输出格式化的数独棋盘文本，空格以 `·` 表示，便于调试与日志查看。
- **`toJSON()`**：输出纯数据结构，面向程序间通信，用于序列化、存储与传输。

## 7. 额外测试设计（Round-trip + 边界覆盖）

### 7.1 Round-trip 序列化往返测试（`06-round-trip.test.js`）

**测试目标：** 验证序列化与反序列化的完整性，确保对象转 JSON 再恢复后，盘面状态完全一致。

**测试逻辑：**

1. 创建 Sudoku / Game 并进行落子操作。
2. 调用 `toJSON()` 完成序列化。
3. 使用 `createSudokuFromJSON` / `createGameFromJSON` 恢复对象。
4. 对比恢复后的棋盘与原始棋盘完全相等。

### 7.2 游戏边界覆盖测试（`07-coverage.test.js`）

**测试目标：** 验证 undo/redo 在边界场景下的行为正确性，提升测试覆盖率。

**测试逻辑：**

1. **连续撤销测试：** 多次落子后连续 undo 至历史栈为空，验证 `canUndo()` 返回 `false`。
2. **连续重做测试：** 落子 → 撤销 → 重做至未来栈为空，验证 `canRedo()` 返回 `false`。
3. **分支清空测试：** 撤销后执行新落子，验证 redo 栈被自动清空，`canRedo()` 返回 `false`。

## 8. HW1改进说明

### 8.1 Sudoku

- 增加了 `#fixed` 字段，用于存储初始固定数字，防止用户修改预设题目。同时提供 `isFixed(row, col)` 方法，在 `guess()` 中调用，拒绝修改固定格子。
- `guess()` 增加了对 `row`、`col` 的范围校验，避免越界写入。由于用户只能通过页面数字按钮输入，数字本身合法（1–9），故未额外校验值域。
- 新增 `isWon()` 和 `getInvalidCells()`，分别用于判断是否胜利以及获取当前盘面中所有冲突格子的坐标列表，供 UI 高亮显示。

### 8.2 Game

- 修改 `getSudoku()` 的返回逻辑：不再直接返回内部持有的 `#current` 实例，而是返回其克隆（`#current.clone()`）。避免外部绕过历史机制直接修改盘面，破坏 Undo/Redo 状态。
- 完善了反序列化能力：`createGameFromJSON()` 现在能完整恢复当前盘面、历史栈（`history`）和重做栈（`future`），确保加载存档后 Undo/Redo 功能仍然可用。

### 8.3 为什么 HW1 的做法不足以支撑真实接入？
- 聚合边界泄漏：Game 直接暴露内部 Sudoku 实例，外部可绕过 Game.guess() 直接修改盘面，Undo/Redo 历史栈形同虚设。真实接入时，UI 一旦误用 getSudoku().guess()，历史记录就乱了。
- 序列化不对称：Game.toJSON() 保存了 history 和 future，但 createGameFromJSON() 只恢复了当前盘面。真实接入中，保存/加载游戏后 Undo/Redo 会失效，用户体验断裂。
- Sudoku 不承载数独规则：guess() 只是裸写数组，没有校验固定格子、行列宫冲突等。真实接入时，UI 必须自己实现这些规则，否则会产生非法盘面，领域对象退化为“哑数据容器”。
因此，HW1 的领域对象虽然“存在”，但因为边界脆弱、规则缺失、序列化不完整，无法作为可靠的后端被 UI 消费。UI 必须在外层做大量补偿逻辑，这违背了“领域对象负责核心规则”的初衷。

### 8.4 trade-off
- 直接暴露 Sudoku 实例 vs 返回克隆：选择返回克隆（getSudoku() 返回 #current.clone()），优点是防止外部绕过历史机制；缺点是每次调用都复制，增加开销（但对 9x9 可忽略）。

## 9. Svelte的响应机制与领域对象的协作

采用**方案 A**：领域对象保持纯净，不依赖任何 UI 框架；通过**适配器（Adapter）**——一个自定义的 Svelte store（`gameStore`）——来桥接领域对象与视图层。

- 适配器内部持有一个 `Game` 实例，并利用 Svelte 的 `writable` store 暴露响应式状态（如 `grid`、`invalidCells`、`won`、`canUndo`、`canRedo`）。
- 每次领域对象状态变更后，适配器调用 `refresh()` 函数，通过 `set()` 向 store 写入**全新的状态对象**。Svelte 检测到 store 值的变化，自动通知所有订阅该 store 的组件重新渲染。即依赖 Svelte 的 **`writable` store**、**`$` 前缀自动订阅**以及**重新赋值**

## 10. View层消费Sudoku/Game的方式

**View 层（Svelte 组件）不直接消费 `Sudoku` 或 `Game`**，而是消费适配层 `gameStore`：

- 组件通过 `export let gameStore` 接收 store 实例，并在模板中使用 `$gameStore` 语法自动订阅。
- 组件事件处理函数（如 `on:click`）调用 `gameStore.undo()`、`gameStore.redo()`、`gameStore.guess(row, col, value)`。这些方法内部会调用真实领域对象（`Game.undo()`、`Game.redo()`、`Game.guess()`）的方法，从而将用户意图准确传递给领域层。

## 11. Svelte 响应式机制的说明

1. 为什么修改对象内部字段后，界面不一定自动更新？

   Svelte的响应式基于赋值操作，编译器会分析哪些变量在 `$:` 或模板中被依赖，并在这些变量被重新赋值时触发更新。如果只是修改对象的某个属性（如 `game.current.grid[0][0] = 5`），而没有对变量本身重新赋值（如 `grid = newGrid`），Svelte 不会检测到变化。领域对象内部的状态变更对 Svelte 是不可见的。

2. 为什么直接改二维数组元素，有时 Svelte 不会按预期刷新？

   同样原因：`array[row][col] = newValue` 不是对数组变量本身的赋值，Svelte 无法追踪数组内部元素的变化。

3. 为什么 store 可以被 `$store` 消费？

   Svelte 编译器对 `$` 前缀有特殊处理：当你在组件中使用 `$store` 时，编译器会自动生成订阅代码（`store.subscribe(...)`）和取消订阅逻辑，并将 `$store` 转换为 store 当前值的引用。同时，当 store 调用 `set()` 时，Svelte 会重新运行依赖于 `$store` 的响应式语句和模板。

4. 为什么 `$:` 有时会更新，有时不会更新？

   `$:` 语句的触发条件是**其依赖的变量被重新赋值**。如果依赖的是一个对象的属性，而该属性是通过深层 mutation 改变的（没有重新赋值给依赖的变量），则 `$:` 不会触发。

5. 为什么“间接依赖”可能导致 reactive statement 不触发？

   如果 `$:` 语句依赖了某个变量 A，而 A 本身是通过 `$:` 从 B 计算得来的，且 B 的更新方式不是重新赋值（而是 mutation），那么 A 不会更新，进而 `$:` 也不会触发。我的方案中所有响应式数据都直接来源于 store 的 `set()`，没有长链条的间接依赖，因此避免了此问题。

6. 直接mutate内部对象的后果是？

   Svelte无法检查到变化，界面不会更新；同时领域对象内部状态和UI显示不同步，历史栈不会被记录，Undo/Redo失效；可能绕过固定格子的检查，破坏数独规则等。

8. 留着领域对象内部的状态
- `Sudoku.#grid`：当前盘面数据（二维数组）
- `Sudoku.#fixed`：固定数字标记（初始题目）
- `Game.#current`：当前持有的 `Sudoku` 实例
- `Game.#history`：历史快照栈（存储 `Sudoku` 对象）
- `Game.#future`：重做快照栈