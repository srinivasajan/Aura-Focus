🌸 Aura Focus
A beautiful, single-file Pomodoro timer and task manager designed for flow state.

(Replace ./image.png with your actual screenshot path)

Aura Focus is a zero-dependency*, lightweight productivity tool that combines the Pomodoro technique with a distraction-free task list. It runs entirely in the browser using a single HTML file, making it incredibly portable and easy to use.

✨ Features
⏱️ Adaptive Timer:

Focus Mode: 25 minutes (Rose/Orange theme).

Short Break: 5 minutes (Teal/Emerald theme).

Long Break: 15 minutes (Indigo/Purple theme).

📝 Integrated Task Manager:

Add tasks and estimate Pomodoros.

Track progress with visual indicators.

Mark tasks as complete or delete them.

🎨 Visual Themes:

Sunrise: Warm oranges and pinks (Default).

Midnight: Dark mode with purple accents.

Forest: Calming greens and teals.

Ocean: Soothing blues.

🧘 Zen Mode: One-click toggle to hide UI clutter and focus solely on the timer.

🔊 Generative Audio: Custom notification sounds generated via the Web Audio API (no external audio files required).

📱 Responsive Design:

Desktop: Split-screen layout (Timer Left / Tasks Right).

Mobile: Vertical stack layout.

🚀 Quick Start
Because Aura Focus is a Single File Application, there is no build process or server installation required.

Download the index.html file (or whatever you named the code).

Open the file in any modern web browser (Chrome, Edge, Firefox, Safari).

Start Working!

Note: The application uses CDNs to load React and Tailwind CSS. You need an active internet connection for the app to load the first time.

🛠️ Technology Stack
Core: HTML5

Styling: Tailwind CSS (via CDN)

Logic: React 18 (via CDN)

Compiler: Babel Standalone (for in-browser JSX)

Icons: Custom SVG Components (Lucide-style)

Audio: Native Web Audio API

⚙️ Configuration & Customization
Since the code is contained in a single file, you can easily tweak settings by opening the HTML file in a text editor (like VS Code or Notepad).

Changing Timer Duration
Look for the const MODES object in the script:

JavaScript

const MODES = {
    focus: { 
        label: 'Focus', 
        minutes: 25, // Change this to 45 or 50 for longer sessions
        // ...
    },
    shortBreak: { 
        label: 'Short Break', 
        minutes: 5, 
        // ...
    },
    // ...
};
Adding New Quotes
Look for the const QUOTES array:

JavaScript

const QUOTES = [
    { text: "Your new quote here.", author: "You" },
    // ... existing quotes
];
🤝 Contributing
Feel free to fork this file and modify it! Some ideas for future improvements:

Add LocalStorage support to save tasks after page refresh.

Add a custom timer input.

Add offline support (PWA).

📄 License
This project is open-source. Feel free to use it, modify it, and share it.

Created with ❤️ for productivity enthusiasts.
