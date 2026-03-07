# School Management System - Frontend

A modern React frontend for the School Management System built with Material-UI.

## Features

- **Authentication**: Login and Registration with JWT token management
- **Dashboard**: Role-based dashboard for Admin, Teacher, and Student
- **Student Management**: Create, view, edit, and delete students
- **Class Management**: Manage classes, sections, and student enrollment
- **Exam Management**: Create and manage objective and theory exams
- **Exam Taking**: Students can take exams with timer
- **Results**: View exam results and performance statistics
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile devices

## Tech Stack

- **React 19**: Latest React with hooks and functional components
- **Material-UI v7**: Beautiful pre-built components
- **React Router v7**: Client-side routing
- **Axios**: HTTP client for API requests
- **Emotion**: CSS-in-JS styling (included with MUI)

## Prerequisites

- Node.js 16+ and npm
- Backend API running on http://localhost:5000 (or configured URL)

## Getting Started

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure API URL

Create a `.env` file in the root directory:

```
REACT_APP_API_URL=http://localhost:5000
```

Or modify the default URL in `src/services/api.js`.

### 3. Start Development Server

```bash
npm start
```

The app will open at [http://localhost:3000](http://localhost:3000)

### 4. Build for Production

```bash
npm run build
```

The built files will be in the `build/` directory.

## Project Structure

```
src/
├── components/          # Reusable components
│   └── MainLayout.js   # Main app layout with sidebar
├── context/            # React Context providers
│   └── AuthContext.js  # Authentication state management
├── pages/              # Page components
│   ├── Auth/          # Login and Register pages
│   ├── Dashboard/     # Dashboard page
│   ├── Students/      # Student management pages
│   ├── Classes/       # Class management pages
│   ├── Exams/         # Exam management and taking pages
│   └── Results/       # Results viewing page
├── services/          # API service layer
│   └── api.js         # Axios instance and API endpoints
├── utils/             # Utility functions
├── App.js             # Main app component with routing
└── index.js           # Entry point
```

## User Roles

### Admin
- Full access to all features
- Manage students, classes, subjects, exams
- View all results
- Assign roles to users

### Teacher
- View and manage assigned classes
- Create and manage exams
- View student results
- Grade theory exams

### Student
- View own profile
- Take assigned exams
- View own results
- Access learning materials

## API Integration

The frontend connects to the backend API at `/api` with the following endpoints:

- **Auth**: `/api/auth/login`, `/api/auth/register`
- **Users**: `/api/users`
- **Students**: `/api/students`
- **Classes**: `/api/classes`
- **Exams**: `/api/exams`
- **Results**: `/api/results`

All API requests include the JWT token in the Authorization header.

## Authentication Flow

1. User logs in via `/login`
2. Backend returns JWT token and user data
3. Token stored in localStorage
4. Token included in all subsequent requests
5. Protected routes check authentication status
6. Token automatically cleared on logout

## Features by Page

### Login/Register
- Email and password authentication
- Role selection during registration
- Form validation and error handling
- Demo credentials displayed for testing

### Dashboard
- Welcome message with user's name
- Statistics cards (students, classes, exams, results)
- Quick actions guide
- Recent activity feed

### Students
- List view with search functionality
- Add/Edit student forms
- Student details (name, ID, class, status)
- Parent/guardian information

### Classes
- Card-based grid view
- Add/Edit class forms
- Class details (name, level, section, capacity)
- Student count per class

### Exams
- Card-based grid view
- Create exam (title, type, duration, marks)
- Select class and subject
- Schedule start/end time
- Take exam with timer (for students)

### Results
- Summary cards (average, total, passed, failed)
- Detailed results table
- Grade and status indicators
- Performance percentage

## Customization

### Theme Colors

Modify the theme in `src/App.js`:

```javascript
const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',  // Change primary color
    },
    secondary: {
      main: '#dc004e',  // Change secondary color
    },
  },
});
```

### API Configuration

Modify the API base URL in `src/services/api.js` or use environment variables.

## Troubleshooting

### CORS Issues
If you encounter CORS errors, ensure the backend API has CORS configured to allow requests from your frontend URL.

### 401 Unauthorized
- Check that the backend API is running
- Verify JWT token is valid
- Check token in localStorage

### Blank Page
- Check browser console for errors
- Ensure all dependencies are installed
- Verify React Router is configured correctly

## License

Proprietary - All rights reserved

## Support

For issues or questions, please contact the development team.
