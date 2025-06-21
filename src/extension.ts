import * as vscode from 'vscode';

interface TerminalConfig {
  name: string;
  cwd?: string;
}

export function activate(context: vscode.ExtensionContext) {
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
}

export function deactivate() { }