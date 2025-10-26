# AI PDF Reader - Authentication Frontend

A modern, responsive authentication system for an AI-powered PDF Reader application, built with React and inspired by Apple's design language.

## Features

### 🎨 **Modern Design**
- Clean, minimal interface inspired by Apple's design system
- Dark/Light theme toggle with smooth transitions
- Responsive design that works on all screen sizes
- Beautiful animations and micro-interactions using Framer Motion

### 🔐 **Authentication Components**
- **Login Page**: Email/password authentication with validation
- **Registration Page**: Full name, email, password with strength indicator
- **Form Validation**: Real-time validation with helpful error messages
- **Password Security**: Visual password strength indicator and confirmation matching

### 🚀 **Technical Features**
- React 18 with modern hooks
- React Router for navigation
- CSS Custom Properties for theming
- Framer Motion for smooth animations
- Lucide React for beautiful icons
- Responsive design with mobile-first approach

## Getting Started

### Prerequisites
- Node.js (version 16 or higher)
- npm or yarn package manager

### Installation

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Start the development server**
   ```bash
   npm start
   ```

3. **Open your browser**
   Navigate to `http://localhost:3000` to view the application

### Available Scripts

- `npm start` - Runs the app in development mode
- `npm build` - Builds the app for production
- `npm test` - Launches the test runner
- `npm eject` - Ejects from Create React App (not recommended)

## Project Structure

```
src/
├── components/
│   ├── Login.js              # Login component
│   ├── Login.css             # Login styles
│   ├── Register.js           # Registration component
│   ├── Register.css          # Registration styles
│   ├── ThemeToggle.js        # Theme toggle component
│   └── ThemeToggle.css       # Theme toggle styles
├── App.js                    # Main app component with routing
├── App.css                   # App-level styles
├── index.js                  # React app entry point
└── index.css                 # Global styles and CSS variables
```

## Design System

### Color Palette
- **Primary**: Blue (#3b82f6) - Used for buttons and links
- **Background**: Dynamic based on theme (light/dark)
- **Text**: High contrast for accessibility
- **Error**: Red (#ef4444) for validation errors
- **Success**: Green (#10b981) for positive feedback

### Typography
- **Font**: Inter (Google Fonts) - Clean, modern sans-serif
- **Weights**: 300, 400, 500, 600, 700
- **Responsive**: Scales appropriately across devices

### Spacing & Layout
- **Border Radius**: Consistent rounded corners (4px - 16px)
- **Shadows**: Subtle elevation system
- **Spacing**: 8px base unit with consistent scale

## Customization

### Adding New Themes
1. Add new color variables to `src/index.css`
2. Update the `ThemeToggle` component
3. Modify the theme switching logic in `App.js`

### Styling Modifications
- Global styles: `src/index.css`
- Component styles: Individual `.css` files
- Theme variables: CSS custom properties in `:root`

### Adding New Pages
1. Create component in `src/components/`
2. Add route to `App.js`
3. Style with consistent design system

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Performance

- Optimized bundle size
- Lazy loading ready
- Smooth 60fps animations
- Mobile-optimized interactions

## Contributing

1. Follow the existing code style
2. Use semantic commit messages
3. Test on multiple devices/browsers
4. Ensure accessibility standards

## License

This project is open source and available under the MIT License.
