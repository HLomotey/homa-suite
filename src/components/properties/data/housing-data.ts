// Property Interface
export interface Property {
  id: string;
  title: string;
  address: string;
  price: number;
  bedrooms: number;
  bathrooms: number;
  area: number;
  type: string;
  status: string;
  image: string;
  description: string;
  dateAdded: string;
}

// Mock data for properties
export const mockProperties: Property[] = [
  {
    id: "1",
    title: "Modern Downtown Apartment",
    address: "123 Main St, Downtown",
    price: 450000,
    bedrooms: 2,
    bathrooms: 2,
    area: 1200,
    type: "Apartment",
    status: "Available",
    image: "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=400",
    description: "Beautiful modern apartment in the heart of downtown.",
    dateAdded: "2024-01-15",
  },
  {
    id: "2",
    title: "Suburban Family Home",
    address: "456 Oak Ave, Suburbs",
    price: 650000,
    bedrooms: 4,
    bathrooms: 3,
    area: 2400,
    type: "House",
    status: "Pending",
    image: "https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=400",
    description: "Spacious family home with large backyard.",
    dateAdded: "2024-01-10",
  },
  {
    id: "3",
    title: "Luxury Penthouse",
    address: "789 High St, Uptown",
    price: 1200000,
    bedrooms: 3,
    bathrooms: 3,
    area: 1800,
    type: "Condo",
    status: "Available",
    image: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=400",
    description: "Stunning penthouse with city views.",
    dateAdded: "2024-01-20",
  },
  {
    id: "4",
    title: "Cozy Studio",
    address: "101 College Ave, University District",
    price: 250000,
    bedrooms: 0,
    bathrooms: 1,
    area: 500,
    type: "Studio",
    status: "Available",
    image: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=400",
    description: "Perfect starter home or investment property near campus.",
    dateAdded: "2024-01-25",
  },
  {
    id: "5",
    title: "Waterfront Villa",
    address: "555 Lake Dr, Lakeside",
    price: 1800000,
    bedrooms: 5,
    bathrooms: 4,
    area: 3500,
    type: "House",
    status: "Available",
    image: "https://images.unsplash.com/photo-1613977257363-707ba9348227?w=400",
    description: "Luxurious waterfront property with private dock and pool.",
    dateAdded: "2024-01-05",
  },
  {
    id: "6",
    title: "Urban Loft",
    address: "202 Artist Way, Arts District",
    price: 550000,
    bedrooms: 1,
    bathrooms: 2,
    area: 1100,
    type: "Loft",
    status: "Pending",
    image: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=400",
    description: "Converted warehouse loft with high ceilings and original features.",
    dateAdded: "2024-01-18",
  },
];

// Room interface
export interface Room {
  id: string;
  name: string;
  propertyId: string;
  propertyName: string;
  type: string;
  status: string;
  area: number;
  occupants: number;
  maxOccupants: number;
  price: number;
  dateAvailable: string;
}

// Assignment interface
export interface Assignment {
  id: string;
  tenantName: string;
  tenantId: string;
  propertyId: string;
  propertyName: string;
  roomId: string;
  roomName: string;
  status: string;
  startDate: string;
  endDate: string;
  rentAmount: number;
  paymentStatus: string;
}
