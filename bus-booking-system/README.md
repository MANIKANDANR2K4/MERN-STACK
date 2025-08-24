# Bus Booking System 🚌

A modern, real-time bus booking web application built with the MERN stack, featuring smooth Netflix-like UI transitions and a comprehensive booking management system.

## ✨ Features

- **Real-time Updates**: Live booking updates, bus tracking, and notifications using Socket.IO
- **Smooth Animations**: Netflix-like UI transitions powered by Framer Motion
- **Responsive Design**: Modern, mobile-first design with Tailwind CSS
- **Authentication System**: JWT-based authentication with role-based access control
- **Advanced Search**: Route search with filters, sorting, and real-time results
- **Booking Management**: Complete booking lifecycle from search to completion
- **Admin Dashboard**: Comprehensive admin panel for system management
- **Payment Integration**: Stripe payment processing (simulated)
- **Real-time Tracking**: Live bus location updates and ETA calculations

## 🚀 Tech Stack

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database (with Mongoose ODM)
- **Socket.IO** - Real-time communication
- **JWT** - Authentication
- **bcryptjs** - Password hashing
- **Multer** - File uploads
- **Express Validator** - Input validation
- **Nodemailer** - Email services
- **Stripe** - Payment processing

### Frontend
- **React.js** - UI library
- **React Router** - Client-side routing
- **Framer Motion** - Animations
- **Tailwind CSS** - Utility-first CSS framework
- **React Hook Form** - Form management
- **React Hot Toast** - Notifications
- **Socket.IO Client** - Real-time client
- **Axios** - HTTP client
- **React Icons** - Icon library

## 📁 Project Structure

```
bus-booking-system/
├── backend/                 # Backend server
│   ├── config/             # Configuration files
│   ├── middleware/         # Custom middleware
│   ├── models/             # Database models
│   ├── routes/             # API routes
│   ├── server.js           # Main server file
│   └── package.json        # Backend dependencies
├── frontend/               # React frontend
│   ├── public/             # Static files
│   ├── src/                # Source code
│   │   ├── components/     # Reusable components
│   │   ├── contexts/       # React contexts
│   │   ├── pages/          # Page components
│   │   ├── services/       # API services
│   │   └── App.js          # Main app component
│   └── package.json        # Frontend dependencies
└── README.md               # Project documentation
```

## 🛠️ Installation & Setup

### Prerequisites
- Node.js (v16 or higher)
- MongoDB Atlas account
- npm or yarn package manager

### Backend Setup

1. **Navigate to backend directory**
   ```bash
   cd bus-booking-system/backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   - Copy `config.env.example` to `config.env`
   - Update the following variables:
     ```env
     MONGODB_URI=your_mongodb_atlas_connection_string
     JWT_SECRET=your_jwt_secret_key
     EMAIL_USER=your_gmail_address
     EMAIL_PASS=your_gmail_app_password
     STRIPE_SECRET_KEY=your_stripe_secret_key
     ```

4. **Start the server**
   ```bash
   npm run dev
   ```
   The backend will run on `http://localhost:5000`

### Frontend Setup

1. **Navigate to frontend directory**
   ```bash
   cd bus-booking-system/frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm start
   ```
   The frontend will run on `http://localhost:3000`

## 🌐 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get user profile
- `PUT /api/auth/profile` - Update profile
- `POST /api/auth/logout` - User logout

### Routes
- `GET /api/routes` - Get all routes
- `GET /api/routes/search` - Search routes
- `GET /api/routes/:id` - Get route details
- `POST /api/routes` - Create route (admin)
- `PUT /api/routes/:id` - Update route (admin)

### Bookings
- `GET /api/bookings` - Get user bookings
- `POST /api/bookings` - Create booking
- `PUT /api/bookings/:id/cancel` - Cancel booking
- `GET /api/bookings/upcoming` - Get upcoming trips

### Admin
- `GET /api/admin/dashboard` - Admin dashboard
- `GET /api/admin/stats/system` - System statistics
- `GET /api/admin/users/overview` - Users overview

## 🔐 Authentication & Authorization

The system uses JWT tokens for authentication with three user roles:

- **User**: Can search routes, make bookings, view profile
- **Driver**: Can update bus location, view assigned trips
- **Admin**: Full system access and management

## 📱 Real-time Features

- **Live Booking Updates**: Instant notifications for booking confirmations, cancellations
- **Bus Tracking**: Real-time bus location updates
- **Trip Status**: Live trip status updates (delays, cancellations)
- **Payment Updates**: Real-time payment confirmations
- **System Alerts**: Admin notifications for system issues

## 🎨 UI/UX Features

- **Smooth Transitions**: Netflix-like page transitions and micro-interactions
- **Responsive Design**: Mobile-first approach with desktop optimization
- **Dark/Light Themes**: Theme switching capability
- **Loading States**: Skeleton loaders and smooth loading animations
- **Error Handling**: User-friendly error messages and recovery options

## 🚌 Core Functionality

### Route Search
- Origin/destination search
- Date and passenger selection
- Advanced filters (bus type, price range)
- Real-time availability checking
- Route comparison

### Booking System
- Seat selection with visual seat map
- Passenger information collection
- Payment processing
- Booking confirmation
- E-ticket generation

### User Management
- Profile management
- Booking history
- Preferences and settings
- Notification preferences

## 🔧 Development

### Running Tests
```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd frontend
npm test
```

### Building for Production
```bash
# Frontend build
cd frontend
npm run build

# Backend production
cd backend
npm start
```

## 📊 Database Models

- **User**: Authentication, profile, preferences
- **Route**: Bus routes, schedules, pricing
- **Bus**: Vehicle information, capacity, amenities
- **Booking**: Reservation details, passenger info
- **Trip**: Individual journey instances
- **Payment**: Transaction records and status

## 🔒 Security Features

- JWT token authentication
- Password hashing with bcrypt
- Input validation and sanitization
- Rate limiting
- CORS configuration
- Helmet security headers
- File upload restrictions

## 🌟 Key Features

1. **Smart Route Planning**: AI-powered route recommendations
2. **Instant Booking**: One-click booking with real-time availability
3. **Live Tracking**: GPS-based bus tracking with ETA
4. **Group Bookings**: Special handling for multiple passengers
5. **Mobile App Ready**: Responsive design for mobile devices
6. **Multi-language Support**: Internationalization ready
7. **Accessibility**: WCAG compliant design
8. **SEO Optimized**: Search engine friendly

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:
- Email: support@busbook.com
- Documentation: [Wiki](https://github.com/your-repo/wiki)
- Issues: [GitHub Issues](https://github.com/your-repo/issues)

## 🚀 Deployment

### Backend Deployment
- Deploy to Heroku, AWS, or DigitalOcean
- Set environment variables
- Configure MongoDB Atlas connection

### Frontend Deployment
- Build the project: `npm run build`
- Deploy to Netlify, Vercel, or AWS S3
- Configure environment variables

## 📈 Performance

- **Lazy Loading**: Code splitting for better performance
- **Image Optimization**: Compressed images and lazy loading
- **Caching**: Redis caching for frequently accessed data
- **CDN**: Content delivery network for static assets
- **Database Indexing**: Optimized database queries

---

**Built with ❤️ using the MERN stack**

*This project demonstrates modern web development practices with a focus on user experience, performance, and scalability.*
