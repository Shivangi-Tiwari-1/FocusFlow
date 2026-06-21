# 🌊 FocusFlow

FocusFlow is a productivity dashboard built with HTML, CSS, and Vanilla JavaScript to help students stay focused, manage study sessions, and track their progress over time.

Built without external frameworks or libraries, the project focuses on core web development concepts such as DOM manipulation, browser APIs, responsive design, and client-side data storage.

## ✨ Features

- ⏱️ Focus timer for structured study sessions
- 📋 Session-based task management
- 🔥 Study streak tracking
- 📊 Productivity analytics and study history
- 📥 CSV export of study data
- 🌗 Dark and light mode support
- 📱 Responsive design for desktop and mobile devices
- 🛡️ Detection of repeated tab switching during active study sessions

## 💻 Tech Stack

- HTML5
- CSS3
- Vanilla JavaScript (ES6+)
- Browser Local Storage API

## 🔍 Technical Details

### Focus Monitoring

The application uses the Page Visibility API to detect tab switching during active study sessions. Repeated tab changes trigger warnings and may reset the active session.

### Productivity Analytics

FocusFlow analyzes study history to identify trends such as total study time, consistency, and peak study hours. Study trends and activity charts are generated dynamically using JavaScript and DOM elements without external charting libraries.

### Local Data Storage

Study history, tasks, streaks, and user preferences are stored using `localStorage`, allowing the application to work entirely on the client side without requiring a backend.

### CSV Export

Users can export their study history as a CSV file directly from the dashboard.

## ⚙️ Running the Project

1. Clone the repository:

```bash
git clone https://github.com/Shivangi-Tiwari-1/FocusFlow.git
```

2. Navigate to the project directory:

```bash
cd FocusFlow
```
3. Open `index.html` directly in any modern web browser.

## 📁 Project Structure

- 📄 `index.html` — Application layout and views
- 🎨 `style.css` — Styling, themes, and responsive design
- ⚙️ `script.js` — Application logic, analytics, and persistence

## 🗺️ Future Improvements

- User Authentication
- Cloud Synchronization
- Full-Stack Version
- Enhanced Analytics
