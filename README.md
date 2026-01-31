# DAy-oN - Code Visualizer User Guide

DAy-oN is a tool that visually represents code flow and structure. It converts complex code into intuitive graphs, helping you understand your project faster and more easily.

## 📦 Installation

You can easily install the software using the distributed setup files.

1. **Download Installation File**
   - Download the installation file matching your operating system from the distribution page (e.g., GitHub Releases).
   - **Windows**: `DAy-oN-Windows-1.2.0-Setup.exe`
   - **macOS**: `DAy-oN-Mac-1.2.0-Installer.dmg` (Planned)

2. **Proceed with Installation**
   - Double-click the downloaded file to run it.
   - Follow the on-screen instructions to complete the installation.
   - Once complete, a **DAy-oN** icon will be created on your desktop or Start menu.

---

## 🚀 Usage

### 1. Launch & VS Code Integration
DAy-oN works in real-time synchronization with **VS Code (Visual Studio Code)**.

1. **Run DAy-oN**: Click the installed DAy-oN icon to launch the program.
2. **Run VS Code**: Open the project you wish to analyze in VS Code.
3. **Auto-Connection**:
   - If DAy-oN is running, it will automatically connect when you open or edit files in VS Code.
   - Upon a successful connection, the structure of your current code will appear as a graph on the DAy-oN screen.
   - *Tip: DAy-oN manages the connection automatically without requiring a separate extension installation within VS Code.*

### 2. Key Features

#### 👁️ Live Visualization
- **Auto Update**: When you modify and save code in VS Code, the graph in DAy-oN updates instantly.
- **Structure Overview**: Classes, functions, and variables are represented as nodes (shapes), and their relationships (inheritance, calls, etc.) are connected by lines.

#### 📍 Cursor Sync
- **Location Tracking**: Clicking a specific line of code in VS Code automatically **highlights** the corresponding node in the DAy-oN graph and centers it on the screen.
- Even in complex files, you can immediately identify where the code you are viewing is located within the overall structure.

#### 🌓 Theme Sync
- Changing the VS Code theme to 'Dark Mode' or 'Light Mode' automatically adjusts the DAy-oN interface to match. Work in an environment that is comfortable for your eyes.

#### 🔎 Detail View
- **Double-click** a node to highlight only the elements directly connected to it.
- **Settings Panel**: Use the settings icon in the top right corner to filter the types of nodes (files, classes, functions, etc.) or connection lines you wish to see.

---

## ❓ FAQ

**Q. The graph does not appear.**
A. Please verify that the DAy-oN app is running and that a file is open in VS Code. If it still does not work, please check your firewall settings to ensure that port 8152 is not blocked.

**Q. Which languages are supported?**
A. Currently, major languages such as Python, Java, TypeScript, JavaScript, and C# are supported, with continuous updates planned.

## Total Downloads
![Total Downloads](https://img.shields.io/github/downloads/wi4077/DAy-oN/total?label=Total%20Downloads&color=green)
