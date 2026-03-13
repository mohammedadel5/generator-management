# 🔐 HWID License Activation Guide

This document serves as a reference for implementing a secure, hardware-locked license activation system in Electron applications using Supabase as the backend.

---

## 🏗️ Architecture Overview

The system relies on three pillars:
1.  **Hardware Binding (HWID)**: Unique machine identifier generated from local hardware.
2.  **Remote Validation**: Supabase database storing unique license keys and their bound machine IDs.
3.  **Local Persistence**: Encrypted/Local JSON state to allow offline operation after the first activation.

---

## 📦 Required Dependencies

Add these to your `package.json`:
```bash
npm install @supabase/supabase-js node-machine-id
```

---

## 🛠️ Core Components

### 1. The Activation Repository (`activationRepository.js`)
This is the heart of the system. It handles:
- **HWID Generation**: Using `node-machine-id`.
- **Status Verification**: Checks local state file and verifies against Supabase.
- **Activation Logic**: Validates a new key and binds the HWID if it's the first use.

#### Key Functions:
- `verifyLicenseStatus()`: Ran on every app startup.
- `activateLicense(key)`: Ran when the user enters a key.
- `getHWID()`: Generates the unique signature for the current computer.

### 2. Main Process Integration (`main.js`)
At app startup, you must determine which screen to show:
```javascript
const activation = require('./db/activationRepository');

async function createWindow() {
  const isActivated = await activation.verifyLicenseStatus();
  if (isActivated) {
    mainWindow.loadFile('index.html'); // Safe to use the app
  } else {
    mainWindow.loadFile('activation.html'); // Force activation
  }
}
```

### 3. Database Schema (Supabase)
Your `licenses` table should follow this structure:

| Column | Type | Description |
| :--- | :--- | :--- |
| `id` | UUID | Primary Key |
| `key` | Text | The unique license code (e.g., DASH-XXXX) |
| `machine_id` | Text | Stores the HWID after first activation |
| `is_active` | Boolean | Kill-switch to disable keys remotely |
| `customer_name` | Text | Name for branding/personalization |
| `activated_at` | Timestamp | Track when the key was used |

---

## 🛡️ Security Best Practices

1.  **Kill-Switch**: Always check the `is_active` flag in Supabase even for "activated" machines. This allows you to revoke access if a customer cancels their subscription.
2.  **Offline Resilience**: If the internet is down, trust the local `activation.json` for a grace period (or indefinitely) to prevent blocking paying customers during outages.
3.  **HWID Mismatch**: If the local `machine_id` doesn't match the current hardware, delete the local activation file and force re-activation. This prevents users from simply copying the installation folder to another PC.
4.  **Supabase RLS**: Configure Row Level Security (RLS) policies on Supabase to ensure users can only "Select/Update" keys if they know the secret key.

---

## 🚀 Implementation Checklist

- [ ] Setup Supabase Project & Table.
- [ ] Implement HWID generation utility.
- [ ] Create the Activation Repository logic.
- [ ] Design the Activation UI (`activation.html`).
- [ ] Integrate startup-check in `main.js`.
- [ ] Test "Hardware Transfer" (Ensure code fails if machine ID changes).
- [ ] Test "Remote Revoke" (Ensure app locks if `is_active` = false).

---
*Created for the Generator Management Dashboard Project - 2026 Reference*
