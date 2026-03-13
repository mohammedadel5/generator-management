# 🛠️ Dashboard Project Template

Use this configuration for next project ( genrator Dashboard) to ensure compatibility and stability .

## 📦 Technology Stack
| Technology | Role | Version |
| :--- | :--- | :--- |
| **Electron** | App Framework | `^34.0.0` |
| **SQLite3** | Local Database | `^5.1.7` |
| **Supabase** | Activation Server | `^2.98.0` |
| **Node Machine ID** | HWID Generation | `^1.1.12` |
| **Electron Builder** | Packaging/Build | `^26.8.1` |
| **Electron Rebuild** | Native Modules | `^4.0.3` |

### First MVP
1- Auth ( admin and operator) with clear roles and permissions ( admin can do everything, operator can only do INSERT tasks)
2- Dashboard ( admin and operator) show Kpi (total customers, total paid, total unpaid, total revenue)
3- Customer Management ( admin and operator)
4- Uppaid customers list

### Data Modal
1- Customer management
    - name
    - phone
    - Amper price
    - Number of Ampers 
    - Total price
    - paid/unpaid
  


## ⚙️ Configuration Essentials

### Native Module Handling
When using `sqlite3`, always include these in `package.json`:
```json
"scripts": {
  "postinstall": "electron-builder install-app-deps"
}
```

### Electron Builder Settings
Recommended for Windows distribution:
```json
"build": {
  "appId": "com.yourname.dash",
  "win": {
    "target": "nsis",
    "verifyUpdateCodeSignature": false
  },
  "directories": {
    "output": "build_out"
  }
}
```

## 🚀 Quick Install Command
```bash
npm install electron@^34.0.0 sqlite3@^5.1.7 @supabase/supabase-js@^2.98.0 node-machine-id@^1.1.12
npm install --save-dev electron-builder@^26.8.1 @electron/rebuild@^4.0.3
```

## 💡 Best Practices
1. **Context Isolation**: Always use `contextIsolation: true` in `webPreferences`.
2. **Preload Script**: Keep all IPC logic in `src/renderer/preload.js`.
3. **Database Init**: Initialize SQLite on startup in the main process before creating the window.
