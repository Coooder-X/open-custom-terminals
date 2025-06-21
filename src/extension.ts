import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';

interface TerminalConfig {
  name: string;
  cwd?: string;
}

export function activate(context: vscode.ExtensionContext) {
  // 注册可视化配置命令
  const configGuiDisposable = vscode.commands.registerCommand('open-custom-terminals.configGUI', () => {
    const panel = vscode.window.createWebviewPanel(
      'customTerminalsConfig',
      '自定义终端配置',
      vscode.ViewColumn.One,
      { enableScripts: true, localResourceRoots: [
        vscode.Uri.joinPath(context.extensionUri, 'media'),
        vscode.Uri.joinPath(context.extensionUri, 'media', 'dist'),
        vscode.Uri.joinPath(context.extensionUri, 'media', 'dist', 'assets'),
      ] }
    );

    // 读取当前配置
    const config = vscode.workspace.getConfiguration('customTerminals');
    const terminals: TerminalConfig[] = config.get('terminals', []);

    // 读取 HTML 文件内容
    // 读取 React 构建产物 index.html
    const distDir = path.join(context.extensionPath, 'media', 'dist');
    const htmlPath = path.join(distDir, 'index.html');
    let html = fs.readFileSync(htmlPath, 'utf8');

    // 替换静态资源路径（JS/CSS）为 webview 可访问的 asWebviewUri
    html = html.replace(/<script\s+type="module"\s+crossorigin\s+src="(.+?)"><\/script>/g, (match, src) => {
      const jsUri = panel.webview.asWebviewUri(vscode.Uri.file(path.join(distDir, src)));
      return `<script type="module" crossorigin src="${jsUri}"></script>`;
    });
    html = html.replace(/<link\s+rel="stylesheet"\s+href="(.+?)"\s*\/>/g, (match, href) => {
      const cssUri = panel.webview.asWebviewUri(vscode.Uri.file(path.join(distDir, href)));
      return `<link rel="stylesheet" href="${cssUri}" />`;
    });
    // 注入初始配置数据，保证为数组
    html = html.replace('</head>', `<script>window.initialTerminals = ${JSON.stringify(Array.isArray(terminals) ? terminals : [])};</script></head>`);
    panel.webview.html = html;

    // 首次主动发送配置到前端
    panel.webview.postMessage({ type: 'updateTerminals', terminals });

    // 监听 Webview 消息
    panel.webview.onDidReceiveMessage(async message => {
      if (message.command === 'saveConfig') {
        await vscode.workspace.getConfiguration().update(
          'customTerminals.terminals',
          message.terminals,
          vscode.ConfigurationTarget.Global
        );
        // 保存后立即推送新配置和弹窗
        panel.webview.postMessage({ type: 'updateTerminals', terminals: message.terminals });
        panel.webview.postMessage({ type: 'showInfo', text: '已保存自定义终端配置！' });
      } else if (message.command === 'requestConfig') {
        // 前端主动请求配置
        const latest = vscode.workspace.getConfiguration('customTerminals').get('terminals', []);
        panel.webview.postMessage({ type: 'updateTerminals', terminals: latest });
      }
    });
  });
  const disposable = vscode.commands.registerCommand('open-custom-terminals.openAll', async () => {
    const workspaceFolders = vscode.workspace.workspaceFolders;
    if (!workspaceFolders) {
      vscode.window.showErrorMessage('No workspace folder open.');
      return;
    }

    // 优先从 vscode 设置中读取配置
    const config = vscode.workspace.getConfiguration('customTerminals');
    const terminals: TerminalConfig[] = config.get('terminals', []);
    if (!terminals.length) {
      vscode.window.showErrorMessage('No custom terminals configured');
      return;
    }

    terminals.forEach((term) => {
      // 支持 ${workspaceFolder} 替换为实际根目录
      let cwd = term.cwd || workspaceFolders[0].uri.fsPath;
      cwd = cwd.replace(/\$\{workspaceFolder\}/g, workspaceFolders[0].uri.fsPath);
      const terminal = vscode.window.createTerminal({
        name: term.name,
        cwd: cwd,
      })
      terminal.show(false);
    });
  });

  context.subscriptions.push(disposable);
  context.subscriptions.push(configGuiDisposable);
}


export function deactivate() { }