# ⚡ Generator Management Dashboard

A professional, high-performance desktop application for managing generator subscribers, billing, and system KPIs. Built with Electron, SQLite, and secured with HWID-based hardware activation.

---

## 🚀 Key Features

### 👤 User Roles & Security
- **Admin**: Full system access, including account management for admin and operators.
- **Operator**: Data entry access for customer management and payment processing.
- **Secure Authentication**: Encrypted credential storage with role-based UI restrictions.

### 📊 Management & Dashboard
- **Real-time KPIs**: Track total customers, revenue, and pending debts instantly.
- **Customer Management**: Full CRUD operations for subscriber details.
- **Billing System**: Automatic calculation of total prices based on Amper price and count.
- **Printable Receipts**: Professional, printable invoices for customer payments.

### 🔐 License Activation
- **Hardware Binding (HWID)**: Licenses are locked to the specific hardware of the installation.
- **Online Verification**: Secure activation check via Supabase backend.
- **Offline Resilience**: Once activated, the app operates completely offline for data management.

### 🎨 Premium Branding
- **Modern UI**: Dark-themed, RTL (Arabic) supported interface with smooth animations.
- **Custom Branding**: Integrated premium application icon and clean, menu-free dashboard view.

---

## 📦 Technology Stack

| Technology | Role |
| :--- | :--- |
| **Electron** | Desktop App Framework |
| **SQLite3** | Local Database Persistence |
| **Supabase** | License Activation Server |
| **Node Machine ID** | HWID Generation |
| **Electron Builder** | Production Packaging |

---

## 🛠️ Getting Started

### Development
```bash
# Install dependencies
npm install

# Start the app in development mode
npm start
```

### Production Build
To create a professional `.exe` installer for distribution:
```bash
npm run build
```
The output will be located in the `build_out/` directory.

---

## 💡 Developer Notes

### Data Persistence
The application stores local data (SQLite and Activation state) in the Windows `%APPDATA%` directory. 
- During development and testing on the same machine, the "built" version will share the same data folder as the development version.
- To simulate a **completely clean install**, delete the application folder in `%APPDATA%`.

### Build Optimization
The build process is configured in `package.json` to only bundle essential source files, ensuring a lightweight and secure distribution for customers.

---

## 📜 License
© 2026 Generator Management Team. All rights reserved.
