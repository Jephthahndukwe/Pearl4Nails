export interface Appointment {
  _id?: string;
  service: string;
  date: string;
  time: string;
  customer: {
    name: string;
    email: string;
    phone: string;
  };
  nailShape?: string;
  nailDesign?: string;
  referenceImage?: string;
  tattooLocation?: string;
  tattooSize?: string;
  specialRequests?: string;
  location: string;
  preparation: string[];
  contact: {
    email: string;
    phone: string;
  };
  price: string;
  duration: string;
  status: 'confirmed' | 'cancelled';
  createdAt: string;
  updatedAt: string;
}
