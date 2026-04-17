# con-oo-Sereniu-3 - Review

## Review 结论

当前实现已经有较明确的 `Sudoku`/`Game` 领域模型，也开始用自定义 store 把它接到棋盘渲染、输入和撤销重做上；但接入只完成了部分流程。开始新局、分享/加载、部分 header/modal 仍然走旧的 `@sudoku/game` 和 `@sudoku/stores/grid`，形成双状态源，因此还不能算满足“领域对象真正接入真实 Svelte 游戏流程”的核心要求。

## 总体评价

| 维度 | 评价 |
| --- | --- |
| OOP | good |
| JS Convention | fair |
| Sudoku Business | fair |
| OOD | fair |

## 缺点

### 1. 开始新局的主流程没有真正驱动领域对象

- 严重程度：core
- 位置：src/components/Modal/Types/Welcome.svelte:2-23, src/components/Header/Dropdown.svelte:2-65, src/components/Modal/Types/GameOver.svelte:15-17, src/App.svelte:22-23
- 原因：`Board` 和 `Controls` 消费的是 `gameStore`，但欢迎弹窗、顶部菜单、游戏结束后的“New Game”仍调用旧的 `@sudoku/game.startNew/startCustom`。这些调用只会修改旧的 `grid`/difficulty/timer 体系，不会替换当前 `Game` 实例，因此难度选择、输入分享码、新开一局等主流程与当前棋盘状态脱节，未满足作业要求中“开始一局游戏”和“真实界面主要流程使用领域对象”的要求。

### 2. 分享与加载流程和领域对象序列化协议断裂

- 严重程度：core
- 位置：src/components/Modal/Types/Share.svelte:3-17, src/App.svelte:29-37, src/stores/gameStore.js:60-63
- 原因：`Share.svelte` 从旧 `@sudoku/stores/grid` 生成 `sencode` 链接，而 `App.svelte` 却按 `base64(JSON)` 去解析 hash 并调用 `gameStore.loadFromJSON`；两边协议完全不一致。更严重的是 `gameStore.js` 内部调用了未导入的 `createGameFromJSON`，一旦走到该分支会触发 `ReferenceError`。这使“加载已有游戏/分享当前游戏”这条关键流程既不稳定，也没有围绕 `Game.toJSON()/fromJSON()` 建立闭环。

### 3. 领域命令缺少有效性契约，Undo/Redo 会记录无效操作

- 严重程度：major
- 位置：src/domain/game.js:36-42, src/domain/sudoku.js:40-56
- 原因：`Sudoku.guess()` 先调用 `isFixed(row, col)`，后检查坐标范围；当 `row/col` 越界时，会先在 `this.#fixed[row][col]` 处触发异常。与此同时，`Game.guess()` 在不知道操作是否有效、是否真的改变盘面之前，就先把当前状态压入 `history` 并清空 `future`。固定格、非法坐标甚至异常调用都可能污染撤销栈；另外 `value` 也没有被限制在数独允许的 `0-9` 范围内，领域层没有守住基本业务不变量。

### 4. Game 对传入 Sudoku 的拥有关系不够严格

- 严重程度：minor
- 位置：src/domain/game.js:18-21
- 原因：`Game` 构造函数直接保存外部传入的 `Sudoku` 引用而不 clone。只要调用方还持有这个 `Sudoku`，就可以在 `Game` 的 history/redo 机制之外直接调用 `guess()` 改写当前盘面。对聚合根来说，这会造成封装泄漏，削弱 `Game` 作为唯一游戏操作入口的设计。

## 优点

### 1. 领域对象有明确的封装边界和快照导出能力

- 位置：src/domain/sudoku.js:11-35, src/domain/sudoku.js:78-91, src/domain/game.js:87-101
- 原因：`Sudoku`/`Game` 使用私有字段保存内部状态，并通过 `getGrid()`、`clone()`、`toJSON()`、`fromJSON()` 导出副本或快照，而不是直接把可变内部数组暴露给 UI，这个方向符合 OOP 和后续 Undo/Redo 的需要。

### 2. Undo/Redo 责任被集中在 Game 中

- 位置：src/domain/game.js:48-80
- 原因：撤销、重做及其可用性判断都位于 `Game`，而不是散落在 Svelte 组件里。相比把历史栈写进事件处理函数，这样的职责边界更清楚，也更接近“UI 只发命令，领域对象管理状态演进”的设计。

### 3. 用 Store Adapter 连接可变领域对象与 Svelte 响应式

- 位置：src/stores/gameStore.js:13-31
- 原因：`createGameStore()` 内部持有 `Game`，每次操作后重新读取领域状态并 `set(...)` 一个新快照给 `writable`。这正是把面向对象模型接入 Svelte 3 store 机制的合理方式，也回答了“对象内部变化为什么需要额外桥接层才能驱动 UI 更新”。

### 4. 棋盘渲染、输入、撤销重做已经开始通过领域接口驱动

- 位置：src/components/Board/index.svelte:10-13, src/components/Controls/Keyboard.svelte:22-27, src/components/Controls/ActionBar/Actions.svelte:8-28
- 原因：当前棋盘显示来自 `$gameStore.grid`，键盘输入通过 `gameStore.guess(...)`，撤销/重做通过 `gameStore.undo()/redo()`。这部分已经避免了在组件里直接改二维数组，说明接入方向是对的。

## 补充说明

- 本次结论仅基于静态审查；按要求未运行 tests，也未实际操作页面，所有运行时判断都来自代码路径分析。
- 对“新游戏/分享/加载未真正接入领域对象”的判断，来自代码中同时存在 `gameStore` 与旧 `@sudoku/game` / `@sudoku/stores/grid` 两套独立状态源这一事实。
- 审查范围聚焦 `src/domain/*` 及其 Svelte 接入；引用 `src/node_modules/@sudoku/*` 仅用于确认接入链路是否绕过领域对象，没有扩展评价无关目录。
