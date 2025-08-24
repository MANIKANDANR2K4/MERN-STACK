// Tamil Nadu District Routes - Complete Coverage
export const tamilNaduDistricts = [
  'Tiruvallur',
  'Chennai',
  'Kanchipuram',
  'Vellore',
  'Tirupathur',
  'Krishnagiri',
  'Dharmapuri',
  'Salem',
  'Namakkal',
  'Erode',
  'Coimbatore',
  'Tiruppur',
  'Karur',
  'Dindigul',
  'Madurai',
  'Theni',
  'Virudhunagar',
  'Ramanathapuram',
  'Sivaganga',
  'Pudukkottai',
  'Thanjavur',
  'Tiruvarur',
  'Nagapattinam',
  'Mayiladuthurai',
  'Cuddalore',
  'Villupuram',
  'Kallakurichi',
  'Tiruvannamalai',
  'Ariyalur',
  'Perambalur',
  'Tiruchirappalli',
  'Pudukkottai',
  'Sivaganga',
  'Ramanathapuram',
  'Virudhunagar',
  'Theni',
  'Madurai',
  'Dindigul',
  'Karur',
  'Tiruppur',
  'Coimbatore',
  'Erode',
  'Namakkal',
  'Salem',
  'Dharmapuri',
  'Krishnagiri',
  'Tirupathur',
  'Vellore',
  'Kanchipur',
  'Chennai',
  'Tiruvallur'
];

export const popularTamilNaduRoutes = [
  {
    id: 'tn-1',
    origin: 'Chennai',
    destination: 'Madurai',
    departureTime: '06:00 AM',
    arrivalTime: '02:00 PM',
    date: '2024-01-15',
    price: 450.00,
    busType: 'Premium',
    availableSeats: 42,
    totalSeats: 50,
    amenities: ['WiFi', 'AC', 'Reclining Seats', 'USB Charging', 'Entertainment'],
    duration: '8 hours',
    operator: 'Tamil Nadu Express',
    rating: 4.6,
    reviews: 156,
    frequency: 'Every 2 hours'
  },
  {
    id: 'tn-2',
    origin: 'Coimbatore',
    destination: 'Chennai',
    departureTime: '07:30 AM',
    arrivalTime: '03:30 PM',
    date: '2024-01-15',
    price: 520.00,
    busType: 'Luxury',
    availableSeats: 35,
    totalSeats: 45,
    amenities: ['WiFi', 'AC', 'Reclining Seats', 'USB Charging', 'Entertainment', 'Restroom'],
    duration: '8 hours',
    operator: 'Coimbatore Express',
    rating: 4.7,
    reviews: 89,
    frequency: 'Every 3 hours'
  },
  {
    id: 'tn-3',
    origin: 'Salem',
    destination: 'Tiruchirappalli',
    departureTime: '08:00 AM',
    arrivalTime: '12:00 PM',
    date: '2024-01-15',
    price: 280.00,
    busType: 'Standard',
    availableSeats: 48,
    totalSeats: 50,
    amenities: ['AC', 'Reclining Seats'],
    duration: '4 hours',
    operator: 'Salem Transport',
    rating: 4.3,
    reviews: 67,
    frequency: 'Every hour'
  },
  {
    id: 'tn-4',
    origin: 'Vellore',
    destination: 'Coimbatore',
    departureTime: '09:00 AM',
    arrivalTime: '06:00 PM',
    date: '2024-01-15',
    price: 380.00,
    busType: 'Premium',
    availableSeats: 38,
    totalSeats: 50,
    amenities: ['WiFi', 'AC', 'Reclining Seats', 'USB Charging'],
    duration: '9 hours',
    operator: 'Vellore Express',
    rating: 4.5,
    reviews: 94,
    frequency: 'Every 4 hours'
  },
  {
    id: 'tn-5',
    origin: 'Madurai',
    destination: 'Rameswaram',
    departureTime: '06:30 AM',
    arrivalTime: '10:30 AM',
    date: '2024-01-15',
    price: 180.00,
    busType: 'Standard',
    availableSeats: 45,
    totalSeats: 50,
    amenities: ['AC', 'Reclining Seats'],
    duration: '4 hours',
    operator: 'Madurai Transport',
    rating: 4.2,
    reviews: 78,
    frequency: 'Every 2 hours'
  },
  {
    id: 'tn-6',
    origin: 'Tiruchirappalli',
    destination: 'Thanjavur',
    departureTime: '07:00 AM',
    arrivalTime: '08:30 AM',
    date: '2024-01-15',
    price: 120.00,
    busType: 'Standard',
    availableSeats: 50,
    totalSeats: 50,
    amenities: ['AC'],
    duration: '1.5 hours',
    operator: 'Trichy Express',
    rating: 4.1,
    reviews: 45,
    frequency: 'Every 30 minutes'
  },
  {
    id: 'tn-7',
    origin: 'Erode',
    destination: 'Salem',
    departureTime: '08:30 AM',
    arrivalTime: '10:00 AM',
    date: '2024-01-15',
    price: 150.00,
    busType: 'Standard',
    availableSeats: 47,
    totalSeats: 50,
    amenities: ['AC', 'Reclining Seats'],
    duration: '1.5 hours',
    operator: 'Erode Transport',
    rating: 4.4,
    reviews: 56,
    frequency: 'Every hour'
  },
  {
    id: 'tn-8',
    origin: 'Kanchipuram',
    destination: 'Vellore',
    departureTime: '09:30 AM',
    arrivalTime: '11:00 AM',
    date: '2024-01-15',
    price: 140.00,
    busType: 'Standard',
    availableSeats: 49,
    totalSeats: 50,
    amenities: ['AC'],
    duration: '1.5 hours',
    operator: 'Kanchipuram Express',
    rating: 4.0,
    reviews: 34,
    frequency: 'Every 45 minutes'
  }
];

export const tamilNaduRouteMatrix = {
  // North to South Routes
  'Tiruvallur': ['Chennai', 'Kanchipuram', 'Vellore', 'Salem', 'Coimbatore', 'Madurai', 'Rameswaram'],
  'Chennai': ['Kanchipuram', 'Vellore', 'Salem', 'Coimbatore', 'Madurai', 'Rameswaram', 'Thanjavur'],
  'Kanchipuram': ['Vellore', 'Salem', 'Coimbatore', 'Madurai', 'Rameswaram', 'Thanjavur', 'Tiruchirappalli'],
  'Vellore': ['Salem', 'Coimbatore', 'Madurai', 'Rameswaram', 'Thanjavur', 'Tiruchirappalli', 'Erode'],
  'Salem': ['Coimbatore', 'Madurai', 'Rameswaram', 'Thanjavur', 'Tiruchirappalli', 'Erode', 'Namakkal'],
  'Coimbatore': ['Madurai', 'Rameswaram', 'Thanjavur', 'Tiruchirappalli', 'Erode', 'Namakkal', 'Tiruppur'],
  'Madurai': ['Rameswaram', 'Thanjavur', 'Tiruchirappalli', 'Erode', 'Namakkal', 'Tiruppur', 'Karur'],
  
  // South to North Routes
  'Rameswaram': ['Madurai', 'Tiruchirappalli', 'Coimbatore', 'Salem', 'Vellore', 'Chennai', 'Tiruvallur'],
  'Thanjavur': ['Tiruchirappalli', 'Coimbatore', 'Salem', 'Vellore', 'Chennai', 'Tiruvallur', 'Kanchipuram'],
  'Tiruchirappalli': ['Coimbatore', 'Salem', 'Vellore', 'Chennai', 'Tiruvallur', 'Kanchipuram', 'Erode'],
  'Erode': ['Salem', 'Vellore', 'Chennai', 'Tiruvallur', 'Kanchipuram', 'Namakkal', 'Tiruppur'],
  
  // East to West Routes
  'Nagapattinam': ['Thanjavur', 'Tiruchirappalli', 'Coimbatore', 'Salem', 'Dharmapuri', 'Krishnagiri'],
  'Mayiladuthurai': ['Thanjavur', 'Tiruchirappalli', 'Coimbatore', 'Salem', 'Dharmapuri', 'Krishnagiri'],
  'Cuddalore': ['Villupuram', 'Tiruvannamalai', 'Salem', 'Coimbatore', 'Erode', 'Namakkal'],
  
  // West to East Routes
  'Krishnagiri': ['Dharmapuri', 'Salem', 'Coimbatore', 'Tiruchirappalli', 'Thanjavur', 'Nagapattinam'],
  'Dharmapuri': ['Salem', 'Coimbatore', 'Tiruchirappalli', 'Thanjavur', 'Nagapattinam', 'Mayiladuthurai'],
  'Tirupathur': ['Vellore', 'Kanchipuram', 'Chennai', 'Tiruvallur', 'Villupuram', 'Cuddalore']
};

export const tamilNaduBusOperators = [
  'Tamil Nadu Express',
  'Coimbatore Express',
  'Madurai Transport',
  'Salem Transport',
  'Vellore Express',
  'Trichy Express',
  'Erode Transport',
  'Kanchipuram Express',
  'Chennai Express',
  'Thanjavur Transport',
  'Rameswaram Express',
  'Krishnagiri Transport',
  'Dharmapuri Express',
  'Villupuram Transport',
  'Cuddalore Express',
  'Tiruvannamalai Transport',
  'Ariyalur Express',
  'Perambalur Transport',
  'Pudukkottai Express',
  'Sivaganga Transport',
  'Ramanathapuram Express',
  'Virudhunagar Transport',
  'Theni Express',
  'Dindigul Transport',
  'Karur Express',
  'Tiruppur Transport',
  'Namakkal Express'
];

export const tamilNaduBusTypes = [
  'Standard',
  'Premium',
  'Luxury',
  'Express',
  'Sleeper',
  'AC Sleeper',
  'Volvo',
  'Scania'
];

export const tamilNaduAmenities = [
  'WiFi',
  'AC',
  'Reclining Seats',
  'USB Charging',
  'Entertainment',
  'Restroom',
  'Water Dispenser',
  'Snack Service',
  'Pillow & Blanket',
  'Reading Light',
  'Luggage Space',
  'Emergency Exit',
  'First Aid Kit',
  'GPS Tracking'
];

export const getRoutePrice = (origin, destination, busType) => {
  const basePrices = {
    'Standard': 2.5,
    'Premium': 3.5,
    'Luxury': 4.5,
    'Express': 3.0,
    'Sleeper': 4.0,
    'AC Sleeper': 5.0,
    'Volvo': 4.5,
    'Scania': 5.0
  };
  
  // Calculate distance based on district positions
  const originIndex = tamilNaduDistricts.indexOf(origin);
  const destIndex = tamilNaduDistricts.indexOf(destination);
  const distance = Math.abs(originIndex - destIndex) * 50; // 50km per district
  
  return Math.round((distance * basePrices[busType] || basePrices['Standard']) * 100) / 100;
};

export const getRouteDuration = (origin, destination) => {
  const originIndex = tamilNaduDistricts.indexOf(origin);
  const destIndex = tamilNaduDistricts.indexOf(destination);
  const distance = Math.abs(originIndex - destIndex) * 50; // 50km per district
  
  // Average speed: 60 km/h
  const hours = distance / 60;
  const minutes = Math.round((hours % 1) * 60);
  const wholeHours = Math.floor(hours);
  
  if (minutes === 0) {
    return `${wholeHours} hour${wholeHours > 1 ? 's' : ''}`;
  }
  return `${wholeHours}h ${minutes}m`;
};
