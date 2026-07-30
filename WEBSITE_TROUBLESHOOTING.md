# 🔧 Website Troubleshooting Guide

## ❌ Website Not Running? Here's How to Fix It

---

## ✅ Quick Fix (3 Methods)

### Method 1: Use Batch File (Easiest for Windows)

1. **Double-click** `run-website.bat` in the project folder
2. A command window will open
3. You'll see: `http://localhost:8000`
4. **Open your browser** and go to: `http://localhost:8000`
5. Done! Website is now running

### Method 2: Command Line

1. **Open Command Prompt** (Win+R → type `cmd` → Enter)
2. **Navigate to project folder**:
   ```
   cd C:\Users\lenovo\mine
   ```
3. **Start the web server**:
   ```
   cd web
   python -m http.server 8000
   ```
4. **Open browser** to: `http://localhost:8000`

### Method 3: VS Code Live Server

1. **Install** "Live Server" extension in VS Code
2. **Right-click** on `web/index.html`
3. **Select** "Open with Live Server"
4. Browser opens automatically with your website

---

## 🔍 Troubleshooting

### Problem: "Python is not recognized"

**Solution**: Python might not be installed or not in PATH

1. **Check if Python is installed**:
   ```
   python --version
   ```

2. **If not installed**, download from: https://www.python.org/downloads/

3. **Important**: During installation, CHECK ✓ "Add Python to PATH"

4. **Try again**:
   ```
   python -m http.server 8000
   ```

### Problem: "Port 8000 is already in use"

**Solution**: Another program is using port 8000

**Try a different port**:
```
python -m http.server 8001
```

Then visit: `http://localhost:8001`

### Problem: "Connection refused" or "Cannot connect"

**Solution**: Web server might not be running

1. Make sure command window is still open
2. Check no error messages
3. Try command again:
   ```
   cd web
   python -m http.server 8000
   ```

### Problem: Website loads but looks broken (no styling)

**Solution**: CSS file might not be loading

1. **Check if you're in correct directory**:
   ```
   cd web
   ```

2. **Verify CSS file exists**:
   ```
   dir assets
   ```

3. **Refresh browser**: Ctrl+Shift+R (hard refresh)

4. **Clear cache**:
   - Ctrl+Shift+Delete
   - Select "Cookies and site data"
   - Click "Clear"

---

## 📋 Step-by-Step Setup

### Windows Command Prompt

```
1. Press: Win+R
2. Type: cmd
3. Press: Enter

4. Type these commands one at a time:
   cd C:\Users\lenovo\mine
   cd web
   python -m http.server 8000

5. You'll see:
   Serving HTTP on 0.0.0.0 port 8000
   
6. Open browser to: http://localhost:8000
```

### PowerShell

```
1. Right-click on PowerShell
2. Select "Run as Administrator"

3. Type these commands:
   cd C:\Users\lenovo\mine\web
   python -m http.server 8000

4. Open browser to: http://localhost:8000
```

---

## ✅ Verify Everything Works

### Check These:

1. **Web folder exists**
   - Look for `C:\Users\lenovo\mine\web\`

2. **Files are there**
   - `web/index.html`
   - `web/assets/styles.css`
   - `web/assets/script.js`
   - `web/pages/` folder

3. **Server is running**
   - Command window shows no errors
   - Says "Serving HTTP on port 8000"

4. **Browser shows website**
   - Homepage loads
   - Logo appears
   - "Advanced Sorting for Google Sheets" headline
   - Navigation menu visible

---

## 🌐 Testing Website

### After website loads, test:

- [ ] **Homepage loads** - You see the hero section
- [ ] **Navigation works** - Click "Features" button
- [ ] **Download page** - Click "Get Started"
- [ ] **Features page** - Click "Learn More"
- [ ] **Styling visible** - Colors, fonts look right
- [ ] **Mobile view** - Press F12, resize window
- [ ] **Dark mode** - Works on dark backgrounds
- [ ] **Links work** - Can click and navigate

---

## 📱 Test on Mobile

### After website works on desktop:

1. **Find your computer's IP**:
   ```
   ipconfig
   ```

2. **Look for "IPv4 Address"** (example: 192.168.1.100)

3. **On mobile phone**, go to:
   ```
   http://192.168.1.100:8000
   ```

4. **Test on phone**:
   - Responsive design works
   - Touch navigation works
   - No styling issues

---

## 🚀 If Everything Works

### You can now:

1. **Share website locally**
   - Share IP address with team
   - They can view on their devices

2. **Deploy to internet**
   - Read `WEBSITE_SETUP.md`
   - Choose hosting (Netlify/Vercel)
   - Follow deployment steps

3. **Customize website**
   - Edit HTML in `web/` folder
   - Edit CSS in `web/assets/styles.css`
   - Refresh browser to see changes

---

## 🔗 Useful Commands

### View Website
```bash
cd web
python -m http.server 8000
```

### Use Different Port
```bash
cd web
python -m http.server 8001
```

### Stop Server
```
Ctrl+C (in command window)
```

### Test Connection
```bash
ping localhost:8000
```

---

## 📞 Still Not Working?

### Check:

1. **Is Python installed?**
   ```
   python --version
   ```

2. **Can you navigate to web folder?**
   ```
   cd web
   dir
   ```
   Should show: `index.html`, `assets`, `pages`, `README.md`

3. **Are files readable?**
   - Right-click `web/index.html`
   - Should open in text editor
   - Should see HTML code

4. **Is port available?**
   Try port 8001, 8002, 8003 instead of 8000

---

## 🎯 Common Issues Summary

| Issue | Solution |
|-------|----------|
| Python not found | Install Python from python.org |
| Port already used | Use different port: `8001`, `8002` |
| CSS not loading | Hard refresh: Ctrl+Shift+R |
| Connection refused | Make sure server is running |
| Blank page | Check browser console (F12) for errors |
| Mobile doesn't connect | Use computer IP address |

---

## 📊 If You Want More Help

### Read These Files:

- **`START_HERE.md`** - Quick start
- **`QUICK_ACCESS_GUIDE.md`** - Quick reference
- **`WEBSITE_SETUP.md`** - Full deployment guide
- **`web/README.md`** - Website documentation

### Run This to Start:

```bash
run-website.bat
```

Or manually:

```bash
cd web
python -m http.server 8000
```

---

## ✅ Final Checklist

Before giving up, verify:

- [ ] Python is installed (`python --version` works)
- [ ] You're in `web` folder (`dir` shows index.html)
- [ ] Command runs without errors
- [ ] Browser can access `http://localhost:8000`
- [ ] Page loads (even if slow)
- [ ] No error messages in console (F12)

---

**Need help?** Try all solutions above in order. 99% of issues are solved by one of these steps.

**Good luck!** 🚀