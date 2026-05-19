# TodoZen - Premium Multi-Dimensional To-Do, Pomodoro, and Habits Web Application

TodoZen is a comprehensive personal productivity and task management Single Page Application (SPA). It is built as a semestral project for the **KAJ (Client Applications in JavaScript)** course at Czech Technical University in Prague, Faculty of Electrical Engineering (ČVUT FEL).

The application is written in clean **Vanilla JavaScript** (ES6+) and structured using the **Model-View-Controller (MVC)** architectural pattern to ensure modularity, scalability, and ease of demonstration of core web technologies.

## Key Features

1. **Inbox & List View:** Standard list-based task manager to capture, sort, and organize daily goals.
2. **Eisenhower Matrix (Kanban View):** A productivity matrix classifying tasks by Urgency and Importance. Supports fluid native **Drag & Drop** to visually reprioritize tasks.
3. **Habit Tracker & Analytics:** Track recurring habits with visualization and productivity charts rendered directly on an HTML5 **Canvas**.
4. **Pomodoro Timer Widget:** A timer based on the Pomodoro technique, integrated with a white-noise audio player utilizing the **HTML5 Media API** and an **SVG/Canvas** progress ring.
5. **Geolocation & File Attachment Support:** Tag task details with geographic coordinates (using the **Geolocation API**) and upload attachments via the **File API**.

---

## Architecture (MVC)

The system maintains a strict separation of concerns to avoid spaghetti code:

* **Model:** Handles data structures (tasks, timer state, habits) and handles persistent data synchronization using **LocalStorage**. Uses prototypal inheritance (extending an event emitter) to notify active views of state changes.
* **View:** Dynamically renders components and handles DOM manipulation. Uses native **Web Components** with Shadow DOM and custom CSS3 animations.
* **Controller:** Intercepts and parses user events (clicks, form validations, drag & drop), mutates the Model, and instructs the View to update.
* **Router:** Intercepts click navigation to drive client-side routing using the **History API** without reloading the page.

---

## Installation & Local Development

This project uses **Vite** as a modern, fast frontend build tool.

### Prerequisites
* Node.js (v18+ recommended)

### Getting Started
1. Clone the repository:
   ```bash
   git clone git@github.com:yeronymus/kaj-todo.git
   cd kaj-todo
   ```
2. Install project dependencies:
   ```bash
   npm install
   ```
3. Run the hot-reloading development server:
   ```bash
   npm run dev
   ```
   Open your browser to `http://localhost:5173`.

4. Build optimized static assets for production:
   ```bash
   npm run build
   ```

---

## Deployment to GitHub Pages

This project is configured to deploy directly to **GitHub Pages** using Vite.

### Steps to Deploy
1. Build the production application locally:
   ```bash
   npm run build
   ```
2. Push your `dist/` directory to the `gh-pages` branch using the `gh-pages` library (or configure a standard GitHub deployment action).
   
   To deploy easily from the command line, we use the `gh-pages` utility:
   ```bash
   npx gh-pages -d dist
   ```
   The site will be publicly available at `https://yeronymus.github.io/kaj-todo/`.

---

## Authors & Course Context
* **Student:** Yernur Bauyrzhanuly
* **Course:** KAJ (Client Applications in JavaScript), ČVUT FEL
