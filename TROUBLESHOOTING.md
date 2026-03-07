# Troubleshooting Guide: Frontend Won't Load

## Problem: `npm start` shows blank page or keeps loading

### Solution 1: Check Terminal for Errors

**IMPORTANT:** Look at your terminal where you ran `npm start`. There should be error messages there.

**Common errors to look for:**
- `Failed to compile`
- `Module not found`
- `Unexpected token`
- `TypeError`

---

### Solution 2: Clean and Reinstall (Most Likely Fix)

The issue is likely corrupted `node_modules`. Follow these steps:

1. **Stop the current server:**
   - Go to the terminal and press `Ctrl + C`

2. **Delete node_modules and package-lock.json:**
   ```bash
   cd "C:\Users\Prof. Timehin\Desktop\school-management-frontend"
   rmdir /s /q node_modules
   del package-lock.json
   ```

3. **Clear npm cache:**
   ```bash
   npm cache clean --force
   ```

4. **Reinstall dependencies:**
   ```bash
   npm install
   ```

5. **Start again:**
   ```bash
   npm start
   ```

---

### Solution 3: Check Browser Console

1. Open your browser (Chrome/Edge/Firefox)
2. Press `F12` to open Developer Tools
3. Go to **Console** tab
4. Look for red error messages
5. Take a screenshot or copy the error

---

### Solution 4: Check Port 3000

**Port 3000 might be blocked or in use:**

1. **Check if something is running on port 3000:**
   ```bash
   netstat -ano | findstr :3000
   ```

2. **If something is using it, kill the process:**
   ```bash
   taskkill /PID <THE_PID_NUMBER> /F
   ```

3. **Or use a different port:**
   - Create a file named `.env` in the frontend folder
   - Add this line: `PORT=3001`
   - Then run `npm start` and go to `http://localhost:3001`

---

### Solution 5: Check for reportWebVitals.js

The project references `reportWebVitals` but the file might be missing.

**Check if the file exists:**
```bash
dir "C:\Users\Prof. Timehin\Desktop\chool-management-frontend\src\reportWebVitals.js"
```

**If it's missing, create it:** (See reportWebVitals.js content below)

---

### Solution 6: React 19 Compatibility Issue

React 19 is very new and might have issues. Try downgrading to React 18:

1. **Stop the server** (Ctrl + C)

2. **Install React 18:**
   ```bash
   npm install react@^18.2.0 react-dom@^18.2.0
   ```

3. **Update index.js** to use React 18 syntax:
   ```javascript
   import React from 'react';
   import ReactDOM from 'react-dom/client';
   import './index.css';
   import App from './App';

   const root = ReactDOM.createRoot(document.getElementById('root'));
   root.render(
     <React.StrictMode>
       <App />
     </React.StrictMode>
   );
   ```

4. **Start again:**
   ```bash
   npm start
   ```

---

### Solution 7: Check Windows Firewall/Antivirus

Sometimes Windows Firewall or antivirus blocks React Dev Server.

1. **Temporarily disable antivirus**
2. **Allow React on Windows Firewall:**
   - Go to Windows Security → Firewall & network protection
   - Click "Allow an app through firewall"
   - Find "Node.js" and allow it

---

## Quick Diagnostic Commands

Run these commands one by one and share the output:

```bash
# 1. Check Node version
node --version

# 2. Check npm version
npm --version

# 3. Navigate to project
cd "C:\Users\Prof. Timehin\Desktop\school-management-frontend"

# 4. Check if dependencies are installed
dir node_modules

# 5. Try to start and capture errors
npm start 2>&1
```

---

## Most Common Error and Fix

### Error: "Something is already running on port 3000"

**Fix:**
```bash
# Kill process on port 3000
npx kill-port 3000

# Or use different port
set PORT=3001
npm start
```

---

### Error: "Cannot find module 'X'"

**Fix:**
```bash
npm install
# or if specific module
npm install <module-name>
```

---

### Error: "Failed to compile"

**Fix:**
Check the line number in the error message. The most common issues:
1. Missing import statement
2. Syntax error (missing bracket, comma, etc.)
3. Wrong component name
4. Undefined variable

---

## If Nothing Works

1. **Delete the entire project folder**
2. **Create a new React app:**
   ```bash
   npx create-react-app school-management-frontend-new
   cd school-management-frontend-new
   npm install @mui/material @emotion/react @emotion/styled @mui/icons-material react-router-dom axios
   ```
3. **Copy the src folder from the old project to the new one**

---

## Please Share:

When you ask for help, please share:
1. **Terminal output** (screenshot or copy-paste)
2. **Browser console errors** (F12 → Console tab)
3. **Node version:** `node --version`
4. **npm version:** `npm --version`

This will help identify the exact issue!
