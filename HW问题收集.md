## HW 问题收集

列举在HW 1、HW1.1过程里，你所遇到的2\~3个通过自己学习已经解决的问题，和2\~3个尚未解决的问题与挑战

### 已解决

1.  前端 Store 在领域对象被修改后如何响应？
   1. **上下文**：实现 Undo/Redo 后，发现领域对象的状态变了，但 Svelte 界面没有自动更新。需要设计一种机制让 UI 响应领域对象的变化。
   2. **解决手段**：查看网页资料 + 查阅Svelte官方文档关于writable store的说明
2. 聚合边界泄漏问题如何解决?
   1. **上下文**：Review 指出 `Game` 的 `getSudoku()` 直接返回内部 `#current` 实例，外部可以绕过 `Game.guess()` 直接修改盘面，破坏 Undo/Redo 历史栈。
   2. **解决手段**：返回克隆而非原始引用

3. `Sudoku.guess()`只是裸写数组，如何承载数独规则？
   1. **上下文**：Review 指出 `Sudoku.guess()` 直接写入 `#grid[row][col] = value`，没有任何校验（固定格子、行列宫冲突等）。领域对象退化为“哑数据容器”，业务正确性只能依赖 UI 层保证。
   2. **解决手段**：参考数独游戏规则进行修改

### 未解决

1. 开始新局、分享/加载等主流程没有真正驱动领域对象？

   1. **上下文**：`Board` 和 `Controls` 已经消费 `gameStore`，但欢迎弹窗（`Welcome.svelte`）、顶部菜单（`Dropdown.svelte`）、游戏结束后的“New Game”（`GameOver.svelte`）仍然调用旧的 `@sudoku/game.startNew/startCustom`

   2. **尝试解决手段**：查阅资料  + 问AI无果
2. 分享与加载流程的序列化协议不一致 ?

   1. **上下文**：`Share.svelte` 从旧的 `@sudoku/stores/grid` 生成 `sencode` 链接；`App.svelte` 却按 `base64(JSON)` 去解析 hash 并调用 `gameStore.loadFromJSON`；两者协议不一致。
   2. **尝试解决手段**：查阅资料由于对svelte不了解，尚未找到解决方法。