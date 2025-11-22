# B2B Task Manager - Professional Frontend

A minimal, modern, and scalable frontend for Employee Performance & Task Tracking System built with React and Tailwind CSS.

## Features

### 🎨 Professional Design
- Minimal, clean interface with consistent layout
- Professional color palette (Primary: #1C64F2, Secondary: #64748B)
- Inter font family for modern typography
- Subtle shadows and rounded corners (2xl)

### 👑 Admin Dashboard
- System health monitoring
- User management with role-based access
- Resource utilization tracking
- Activity logs and system events

### 💼 Manager Dashboard  
- Team performance overview
- Task assignment and delegation
- Employee leaderboard with performance scores
- Analytics with donut charts and line graphs

### 🧑‍💻 Employee Dashboard
- Focus task highlighting for productivity
- Tabbed task organization (Today, This Week, Later)
- Personal performance tracking with circular progress
- Motivational feedback system

## Tech Stack

- **React 18** - Modern React with hooks
- **Tailwind CSS** - Utility-first CSS framework
- **Lucide React** - Beautiful, customizable icons
- **Recharts** - Composable charting library
- **Headless UI** - Unstyled, accessible UI components

## Quick Start

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Start development server**
   ```bash
   npm start
   ```

3. **Open browser**
   Navigate to `http://localhost:3000`

## Demo Features

- **Role Switcher**: Use the floating panel in the top-right to switch between Admin, Manager, and Employee views
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **Interactive Components**: Hover effects, clickable elements, and smooth transitions

## Project Structure

```
src/
├── components/
│   ├── layout/          # Sidebar, Header, Layout
│   ├── ui/              # Reusable UI components
│   └── charts/          # Chart components
├── pages/               # Dashboard pages for each role
└── utils/               # Utility functions
```

## Customization

### Colors
Update `tailwind.config.js` to modify the color scheme:
```js
theme: {
  extend: {
    colors: {
      primary: '#1C64F2',    // Main brand color
      secondary: '#64748B',   // Secondary color
    }
  }
}
```

### Role Configuration
Modify sidebar navigation in `components/layout/Sidebar.jsx`:
```js
const roleMenus = {
  admin: [...],
  manager: [...], 
  employee: [...]
}
```

## Production Build

```bash
npm run build
```

This creates an optimized production build in the `build/` folder.

## Browser Support

- Chrome (latest)
- Firefox (latest) 
- Safari (latest)
- Edge (latest)

## License

MIT License - feel free to use this project for your applications.