# Open Custom Terminals

一个用于 VSCode 的插件，支持自定义终端配置，并可批量在不同工作目录下启动终端。

> 该项目完全由 AI 编写，目前仅是 MVP 版本，如有使用或体验问题欢迎在 Issues 区留言。

## 项目初衷
在开发过程中为了方便使用终端工具，会开启多个终端窗口并自定义命名，使用不同终端处理不同的工作。如 git、node、run、yalc 等。如果习惯同时使用多个终端，每次手动打开多个终端窗口并命名十分麻烦。因此借助 AI 快速开发了这个简单的插件。

## 功能特性
- 支持在 VSCode 内自定义多个终端配置（名称、工作目录等）
- 一键批量打开自定义终端
- 配置自动保存到 VSCode 的 settings.json
- 直观易用的 WebView 配置界面

## 安装方法
1. 克隆本项目到本地：
   ```bash
   git clone git@github.com:Coooder-X/open-custom-terminals.git
   ```
2. 在 VSCode 中打开本项目文件夹。
3. 运行依赖安装：
   ```bash
   npm install
   ```
4. 编译插件：
   ```bash
   npm run compile
   ```
5. 启动插件开发调试：
   - 按 F5 启动插件开发宿主窗口。
   - 在新窗口中按命令面板（Ctrl+Shift+P）输入并运行 `Open All Custom Terminals`。

## 使用说明
### 配置自定义终端
**方法1:**
打开 VSCode 配置文件 settings.json，添加配置
```json
"customTerminals.terminals": [
    {
      "name": "terminal 1",
      "cwd": "${workspaceFolder}"
    },
    {
      "name": "terminal 2",
      "cwd": "${workspaceFolder}"
    }
]
```
参数是一个数组，每个元素是一个对象，包含`name`和`cwd`两个属性，`name`为终端名称，`cwd`为工作目录,默认值是`${workspaceFolder}`，表示运行`Open Custom Terminals`命令时的当前文件夹路径。

**方法2:**
1. 在 VSCode 命令面板中搜索并运行 `配置自定义终端(可视化)`。

2. 在弹出的 WebView 页面中配置终端名称与工作目录。
3. 点击“添加终端”可批量添加配置。
4. 点击“保存配置”自动保存到 VSCode 设置。

## 批量打开自定义终端
通过命令面板可一键批量打开所有自定义终端：
   - 按 `Ctrl+Shift+P` 打开命令面板。
   - 输入并选择 `Open All Custom Terminals` 命令。
   - 插件会自动根据你配置的终端列表依次打开所有终端。

## 开发与调试
- 前端位于 `media/` 目录，基于 React + Vite。
- 插件主进程代码在 `src/extension.ts`。
- 修改前端代码后需 `npm run build`，再重载插件窗口。
- 推荐用 VSCode 插件调试模式（F5）开发。

## 贡献
欢迎 Issue 和 PR！

1. Fork 本仓库并新建分支。
2. 提交你的修改。
3. 发起 Pull Request。

## License
MIT

---

如有问题或建议，欢迎在 Issues 区留言。
