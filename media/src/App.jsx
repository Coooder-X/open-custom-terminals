import { useState, useEffect } from 'react';
import './App.css';

function getInitialTerminals() {
  if (Array.isArray(window.initialTerminals)) {
    return window.initialTerminals;
  }
  return [];
}

// 只调用一次 acquireVsCodeApi，避免多次实例化报错
const vscode = window.acquireVsCodeApi ? window.acquireVsCodeApi() : null;

function App() {
  const [terminals, setTerminals] = useState(getInitialTerminals());
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    // 监听插件端消息（如配置变更、保存成功等）
    window.addEventListener('message', event => {
      const message = event.data;
      if (message && message.type === 'updateTerminals') {
        setTerminals(Array.isArray(message.terminals) ? message.terminals : []);
      }
      if (message && message.type === 'showInfo') {
        alert(message.text);
      }
    });
  }, []);

  const handleChange = (idx, key, value) => {
    const newTerminals = terminals.map((t, i) => i === idx ? { ...t, [key]: value } : t);
    setTerminals(newTerminals);
  };

  const handleAdd = () => {
    setTerminals([...terminals, { name: '', cwd: '${workspaceFolder}' }]);
  };


  const handleDelete = (idx) => {
    setTerminals(terminals.filter((_, i) => i !== idx));
  };

  const handleSave = (e) => {
    e.preventDefault();
    setSaving(true);
    if (vscode) {
      vscode.postMessage({ command: 'saveConfig', terminals });
    }
    setTimeout(() => setSaving(false), 1200);
  };

  return (
    <div style={{ padding: 24, fontFamily: 'sans-serif', maxWidth: 600, margin: '0 auto' }}>
      <h2>自定义终端配置</h2>
      <form onSubmit={handleSave}>
        <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 16 }}>
          <thead>
            <tr>
              <th style={{ border: '1px solid #ddd', padding: 8 }}>终端名</th>
              <th style={{ border: '1px solid #ddd', padding: 8 }}>工作目录(cwd)</th>
              <th style={{ border: '1px solid #ddd', padding: 8 }}>操作</th>
            </tr>
          </thead>
          <tbody>
            {terminals.map((t, idx) => (
              <tr key={idx}>
                <td style={{ border: '1px solid #ddd', padding: 8 }}>
                  <input
                    type="text"
                    value={t.name}
                    onChange={e => handleChange(idx, 'name', e.target.value)}
                    placeholder="终端名"
                    required
                  />
                </td>
                <td style={{ border: '1px solid #ddd', padding: 8 }}>
                  <input
                    type="text"
                    value={t.cwd}
                    onChange={e => handleChange(idx, 'cwd', e.target.value)}
                    placeholder="工作目录，如 ${workspaceFolder}"
                  />
                </td>
                <td style={{ border: '1px solid #ddd', padding: 8 }}>
                  <button type="button" onClick={() => handleDelete(idx)} style={{ color: 'red' }}>删除</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <button type="button" onClick={handleAdd} style={{ marginRight: 12 }}>添加终端</button>
        <button type="submit" disabled={saving}>{saving ? '保存中...' : '保存配置'}</button>
      </form>
      <p style={{ color: '#888', fontSize: 13, marginTop: 8 }}>
        配置会自动保存到 VS Code 设置（settings.json），可通过命令面板批量打开。
      </p>
    </div>
  );
}

export default App;
