# CampusLearn — Computer Science Fundamentals Portal

A modern, high-fidelity replication of the provided reference design, elevated with the design aesthetics of **[DesignPrompts.dev](https://www.designprompts.dev/)** and smooth motion dynamics of **[Cominvi.com.mx](https://www.cominvi.com.mx/)**.

---

## 🌟 Highlights & Features

### 1. Visual & Graphic Replication
- **Identical Brand Logo**: CampusLearn graduation cap logo with tagline *"Learn · Build · Grow"*.
- **University Logos & Institutional Branding**:
  - Top institutional utility bar with **University of Technology** seal.
  - Official **University Seal** stamp on the **Campus Building card**.
  - Accredited university badge on the **Hero section**.
  - Official institutional accreditation and seal in the **Footer**.
- **Exact Reference Imagery**:
  - Hero workspace with laptop, code, coffee, and *"Programming"* textbook.
  - University brick building with sunny lawn and trees.
  - Photo gallery with *"Learning to Code"*, *"Study Materials"*, and *"Team Learning"*.

### 2. Design System (DesignPrompts.dev Style)
- Modern clean typography using **Plus Jakarta Sans** and **JetBrains Mono**.
- Bento-grid card architecture with subtle glowing borders, pill badges (`Completed`, `In Progress`, `Not Started`), and soft shadows.
- Dual theme support: **Crisp Light Mode** and **Deep Obsidian Dark Mode** with seamless toggle and `localStorage` persistence.

### 3. Motion & Animation (Cominvi Style)
- **Scroll-driven top progress bar**: Real-time reading progress indicator.
- **Glassmorphism sticky header**: Adaptive blur and elevation on scroll.
- **Viewport scroll reveals**: Staggered fade-up entrances for cards, tables, and sections.
- **3D Interactive Tilt**: Mouse perspective tilt physics on cards (`data-tilt`).
- **Interactive Micro-Confetti**: Triggered upon marking modules complete or submitting the contact form.

### 4. Interactive Components
- **Spotlight Search Modal (`⌘K` / `Ctrl+K`)**: Instant real-time filtering across modules, topics, events, and links.
- **Course Modules Explorer**:
  - Filter tabs: *All (4)*, *Completed (1)*, *In Progress (1)*, *Not Started (2)*.
  - Expandable accordion rows with curriculum details, lecture slides button, and cloud lab launcher.
  - Interactive status changer (`Mark Done`, `In Progress`, `Reset`) with live course progress calculation.
- **4 Pillars Deep Dive Modal**: Click *Learn*, *Practice*, *Build*, or *Grow* to view core learning objectives and live code sandbox previews.
- **Photo Gallery Lightbox**: Click any gallery item for an expanded, high-resolution modal with tags.
- **Interactive Contact Form**: Client-side validation, live character counter, loading spinner state, and success toast.
- **Calendar & Resource Actions**:
  - *"Download Notes (PDF)"* triggers an animated download toast.
  - *"+ Cal"* generates real `.ics` calendar files for assignments and exams.
- **Interactive Motivational Card**: Click to cycle through inspirational computer science quotes.
- **Floating Reference Comparison Drawer**: View the original screenshot side-by-side with the live site.

---

## 🚀 How to Run & View

### Option 1: Direct File Opening
Simply open `index.html` directly in any web browser (Chrome, Edge, Firefox, Safari):
```
C:\Users\Devarsh\.gemini\antigravity\scratch\campuslearn-ui\index.html
```

### Option 2: Local HTTP Server (Recommended)
From the project folder, run:
```bash
python -m http.server 8080
```
Then visit [http://localhost:8080](http://localhost:8080) in your browser.
