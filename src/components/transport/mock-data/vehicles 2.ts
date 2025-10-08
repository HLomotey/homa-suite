import { FrontendVehicle } from "@/integration/supabase/types/vehicle";

export const mockVehicles: FrontendVehicle[] = [
  {
    id: "1",
    state: "CA",
    address: "123 Main St, San Francisco, CA 94105",
    make: "Toyota",
    model: "Camry",
    vin: "1HGCM82633A123456",
    year: 2020,
    color: "Silver",
    licensePlate: "ABC123",
    status: "Active",
    purchaseDate: "2020-01-15"
  },
  {
    id: "2",
    state: "NY",
    address: "456 Park Ave, New York, NY 10022",
    make: "Honda",
    model: "Civic",
    vin: "5FNRL38229B123456",
    year: 2021,
    color: "Blue",
    licensePlate: "XYZ789",
    status: "Maintenance",
    purchaseDate: "2021-03-20"
  },
  {
    id: "3",
    state: "TX",
    address: "789 Oak St, Austin, TX 78701",
    make: "Ford",
    model: "F-150",
    vin: "1FTEW1E53JFA12345",
    year: 2019,
    color: "Black",
    licensePlate: "DEF456",
    status: "Active",
    purchaseDate: "2019-05-10"
  },
  {
    id: "4",
    state: "FL",
    address: "321 Beach Rd, Miami, FL 33139",
    make: "Chevrolet",
    model: "Silverado",
    vin: "3GCUKREC5EG123456",
    year: 2022,
    color: "Red",
    licensePlate: "GHI789",
    status: "Active",
    purchaseDate: "2022-02-05"
  },
  {
    id: "5",
    state: "WA",
    address: "555 Pine St, Seattle, WA 98101",
    make: "Tesla",
    model: "Model 3",
    vin: "5YJ3E1EA1JF123456",
    year: 2021,
    color: "White",
    licensePlate: "JKL012",
    status: "Inactive",
    purchaseDate: "2021-07-20"
  }
];
