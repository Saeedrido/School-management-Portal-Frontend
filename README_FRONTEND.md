# School Management System - Frontend

Modern React frontend for the School Management System with a clean, professional design.

## Design

### Color Scheme
- **Primary Blue**: `#2196F3` - Light blue for primary actions and branding
- **Success Green**: `#66BB6A` - Light green for success states
- **Secondary Red**: `#EF5350` - Light red for errors and alerts
- **Background**: Light blue-gray (`#F5F7FA`) for clean, modern look

### Pages

#### 1. Landing Page (`/`)
- Hero section with school branding
- Feature cards with placeholder icons
- Campus gallery
- Login button on top navigation
- "Make Payment" button in navigation

#### 2. Payment Page (`/payment`)
- Bank account details display
- Copy-to-clipboard functionality
- WhatsApp integration for payment proof submission
- Phone number link for direct contact

## Installation

```bash
cd C:\Users\Prof. Timehin\Desktop\school-management-frontend
npm install
```

## Development

```bash
npm start
```

Opens at: http://localhost:3000

## Build for Production

```bash
npm run build
```

Build output will be in the `build/` directory.

## Adding School Images

### Current Placeholder Images
Currently using colored icon placeholders for:
- Students studying
- Sports activities
- Educational excursions
- School community
- Library, sports ground, science lab, classroom, play area, assembly hall

### Replace with Real Images

1. **Prepare your images** (recommended formats):
   - JPG or PNG format
   - 1920x1080 pixels (16:9 aspect ratio)
   - File size under 500KB each

2. **Place images in the public folder**:
   ```
   C:\Users\Prof. Timehin\Desktop\school-management-frontend\public\images\
   ```

3. **Required images** (replace placeholders):
   ```
   studying.jpg       → Students in classroom/library
   sports.jpg         → Students playing sports
   excursion.jpg      → Students on excursion/in park
   community.jpg      → School assembly/group activities
   ```

4. **Update image references** (optional):
   If you want to use real image files instead of the current colored placeholders,
   the images will automatically appear since they're referenced in the code.

## Features

- ✅ Responsive design (mobile, tablet, desktop)
- ✅ Material-UI components
- ✅ Clean, modern interface
- ✅ Color-coded actions (blue for primary, green for success, red for error)
- ✅ Smooth animations and transitions
- ✅ WhatsApp integration for payment communication

## Navigation Structure

```
/ (Landing Page)
├── /login (Login for users)
├── /register (User registration)
├── /payment (Make payment)
└── /dashboard (Protected routes after login)
    ├── /students (Student management)
    ├── /classes (Class management)
    ├── /exams (Exam management)
    └── /results (Results viewing)
```

## Technology Stack

- **React 19.2** - UI library
- **Material-UI 7.3** - Component library
- **React Router 7.13** - Navigation
- **Axios 1.13** - HTTP client
- **Emotion** - CSS-in-JS styling

## Payment Flow

1. User visits `/payment` page
2. Views school bank account details:
   - Account Number
   - Account Name
   - Account Holder
   - Phone Number
3. User transfers money to bank account
4. User clicks "Open WhatsApp" button
5. WhatsApp opens with pre-filled message including:
   - Payment confirmation
   - Student details
6. User sends screenshot/receipt
7. School confirms and updates records

## Customization

### Update Payment Details

Edit `src/pages/PaymentPage.js`:

```javascript
const [paymentDetails, setPaymentDetails] = useState({
  accountNumber: 'YOUR_ACCOUNT_NUMBER',
  accountName: 'YOUR_ACCOUNT_NAME',
  accountHolder: 'YOUR_HOLDER_NAME',
  phoneNumber: '+234XXXXXXXXXX', // WhatsApp number
});
```

### Update School Name

Edit `src/pages/LandingPage.js`:

```javascript
<School sx={{ mr: 1, fontSize: 32 }} />
<Typography variant="h5">
  YOUR SCHOOL NAME HERE
</Typography>
```

## Deployment

### Build for Production

```bash
npm run build
```

### Deploy to Web Server

1. Copy the `build/` folder to your web server
2. Configure your web server (IIS, Apache, Nginx) to serve the static files
3. Update API endpoint in `src/services/api.js` to point to your backend

### Environment Variables

Create a `.env` file in the root directory:

```
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_API_URL=https://your-api-domain.com/api
```

## Browser Support

- Chrome (recommended)
- Firefox
- Safari
- Edge

## Troubleshooting

### Images not showing
- Ensure images are in `public/images/` folder
- Check file names match the references in code
- Clear browser cache and reload

### WhatsApp not opening
- Check your popup blocker settings
- Ensure WhatsApp app is installed on your device
- Try opening the link manually: `https://wa.me/2348012345678`

### Styles not applying
- Run `npm install` to ensure all dependencies are installed
- Clear browser cache
- Check browser console for errors

## Support

For issues or questions, contact the development team.
