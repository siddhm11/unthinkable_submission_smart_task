# Smart Task Planner Frontend

A modern React frontend for the Smart Task Planner system - AI-powered task planning with Groq's lightning-fast LLMs.

![Smart Task Planner](https://img.shields.io/badge/Powered%20by-Groq%20LLMs-blue)
![React](https://img.shields.io/badge/React-18.2.0-61dafb)
![TypeScript](https://img.shields.io/badge/Frontend-React-61dafb)

## 🚀 Features

- **🎯 Goal Management**: Create and manage project goals with AI-powered task generation
- **⚡ Lightning-Fast AI**: Powered by Groq's ultra-fast LLM infrastructure  
- **📊 Task Dependencies**: Visual task dependency management with DAG support
- **💻 Responsive Design**: Works perfectly on desktop, tablet, and mobile
- **🔐 Secure Authentication**: JWT-based authentication with the backend
- **🎨 Modern UI**: Clean, intuitive interface with smooth animations
- **📱 Mobile-First**: Optimized for mobile devices with touch-friendly interactions

## 🛠️ Tech Stack

- **React 18** - Modern React with hooks and functional components
- **React Router** - Client-side routing
- **Axios** - HTTP client for API communications
- **Lucide React** - Beautiful, customizable icons
- **React Hot Toast** - Elegant toast notifications
- **CSS3** - Modern CSS with Flexbox and Grid
- **Inter Font** - Clean, professional typography

## 📋 Prerequisites

- Node.js 16.0 or higher
- npm or yarn package manager
- Smart Task Planner Backend running on http://localhost:8000

## 🚀 Quick Start

### 1. Install Dependencies

```bash
npm install
# or
yarn install
```

### 2. Configure Environment

```bash
cp .env.example .env
```

Update `.env` with your backend URL:
```env
REACT_APP_API_URL=http://localhost:8000/api/v1
```

### 3. Start Development Server

```bash
npm start
# or
yarn start
```

The app will open at [http://localhost:3000](http://localhost:3000)

## 🏗️ Build for Production

```bash
npm run build
# or
yarn build
```

This creates an optimized production build in the `build/` folder.

## 📁 Project Structure

```
src/
├── components/           # Reusable UI components
│   ├── auth/            # Authentication components
│   ├── common/          # Shared components (Navbar, etc.)
│   ├── dashboard/       # Dashboard-specific components
│   ├── goals/           # Goal management components
│   └── tasks/           # Task management components
├── context/             # React Context providers
├── hooks/               # Custom React hooks
├── pages/               # Page components
├── services/            # API service functions
├── styles/              # CSS stylesheets
├── utils/               # Utility functions
├── App.js              # Main App component
└── index.js            # React entry point
```

## 🎨 Key Components

### Authentication
- **Login/Register Pages**: Clean, secure authentication flow
- **Protected Routes**: Automatic redirection based on auth status
- **JWT Token Management**: Secure token storage and refresh

### Dashboard
- **Goal Overview**: Visual cards showing goal progress
- **Statistics**: Real-time stats on goals and tasks
- **Quick Actions**: Fast goal creation and management

### Goal Management
- **AI-Powered Creation**: Natural language goal input
- **Progress Tracking**: Visual progress bars and completion stats
- **Task Generation**: Automatic task breakdown with dependencies

### Task Management
- **Dependency Visualization**: Clear task relationship display
- **Status Management**: Easy task status updates
- **Multiple Views**: List and dependency-based task organization

## 🔗 API Integration

The frontend integrates seamlessly with the Smart Task Planner backend:

### Authentication Endpoints
- `POST /auth/login` - User login
- `POST /auth/register` - User registration
- `POST /auth/test-token` - Token validation

### Goal Management
- `GET /goals/` - Fetch user goals
- `POST /goals/` - Create new goal
- `GET /goals/{id}` - Get goal details
- `PUT /goals/{id}` - Update goal
- `DELETE /goals/{id}` - Delete goal

### Task Management
- `PATCH /tasks/{id}` - Update task
- `POST /tasks/{id}/dependencies` - Add dependency
- `DELETE /tasks/{id}/dependencies/{dep_id}` - Remove dependency

## 🎯 User Experience Features

### Responsive Design
- **Mobile-First**: Optimized for mobile devices
- **Touch-Friendly**: Large tap targets and smooth interactions
- **Adaptive Layout**: Graceful degradation across screen sizes

### Performance
- **Code Splitting**: Automatic code splitting for faster loads
- **Lazy Loading**: Components loaded on demand
- **Optimized Images**: Efficient image loading and caching

### Accessibility
- **Keyboard Navigation**: Full keyboard accessibility
- **Screen Reader Support**: ARIA labels and semantic HTML
- **High Contrast**: Clear visual hierarchy and contrast ratios

## 🔧 Development

### Available Scripts

- `npm start` - Start development server
- `npm test` - Run test suite
- `npm run build` - Build for production
- `npm run eject` - Eject from Create React App (irreversible)

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `REACT_APP_API_URL` | Backend API base URL | `http://localhost:8000/api/v1` |
| `REACT_APP_ENV` | Environment name | `development` |

### Code Style

The project follows modern React best practices:
- Functional components with hooks
- Custom hooks for logic reuse
- Context for state management
- Axios interceptors for API handling
- CSS modules for styling

## 🚀 Deployment

### Netlify/Vercel Deployment

1. Build the project:
   ```bash
   npm run build
   ```

2. Deploy the `build/` folder to your hosting service

3. Configure environment variables on your hosting platform

### Docker Deployment

```dockerfile
FROM node:16-alpine as build
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/build /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

## 🤝 Integration with Backend

This frontend is designed to work seamlessly with the Smart Task Planner backend:

1. **Start the backend** (see backend README for instructions)
2. **Ensure the backend is running** on http://localhost:8000
3. **Start this frontend** with `npm start`
4. **Access the app** at http://localhost:3000

The frontend will automatically connect to the backend and provide:
- User authentication
- Goal creation and management
- AI-powered task generation
- Real-time task updates
- Progress tracking

## 📱 Mobile Experience

The app is fully optimized for mobile devices:
- **Responsive Navigation**: Collapsible mobile menu
- **Touch Gestures**: Swipe and tap interactions
- **Mobile-Optimized Forms**: Keyboard-friendly inputs
- **Fast Loading**: Optimized for mobile networks

## 🎨 Customization

### Theming
The app uses CSS custom properties for easy theming:

```css
:root {
  --primary-color: #3b82f6;
  --secondary-color: #8b5cf6;
  --success-color: #10b981;
  --warning-color: #f59e0b;
  --error-color: #ef4444;
}
```

### Components
All components are modular and can be easily customized or extended.

## 🐛 Troubleshooting

### Common Issues

1. **CORS Errors**: Ensure backend is running and CORS is configured
2. **API Connection**: Check `REACT_APP_API_URL` in `.env`
3. **Authentication Issues**: Clear localStorage and try logging in again

### Debug Mode

Set `REACT_APP_ENV=development` for detailed error messages.

## 📄 License

This project is licensed under the MIT License.

## 🚀 Powered by Groq

This application leverages Groq's lightning-fast LLM infrastructure for:
- **10x faster** task generation compared to traditional LLMs
- **Near-instant** AI responses (2-5 seconds vs 15-30 seconds)
- **Cost-effective** AI processing
- **Reliable** and scalable AI infrastructure

---

**Ready to revolutionize your project planning with AI? Start using Smart Task Planner today! ⚡**
