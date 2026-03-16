export interface Apartment {
  id: string;
  unit: string;
  floor: number;
  position: string;
  tenant: Tenant | null;
}

export interface Tenant {
  id: string;
  name: string;
  phone: string;
  moveInDate: string;
  apartmentId: string;
  monthlyRent: number;
}

export interface RentPayment {
  id: string;
  tenantId: string;
  apartmentId: string;
  months: number;
  monthlyAmount: number;
  totalAmount: number;
  periodStart: string;
  periodEnd: string;
  status: PaymentStatus;
  paidDate: string | null;
  createdAt: string;
}

export interface ElectricityBill {
  id: string;
  tenantId: string;
  apartmentId: string;
  billingMonth: string;
  kwhUsed: number;
  electricityRate: number;
  baseCost: number;
  serviceFee: number;
  televisionTax: number;
  subtotal: number;
  tax: number;
  totalAmount: number;
  status: PaymentStatus;
  paidDate: string | null;
  createdAt: string;
}

export interface WaterBill {
  id: string;
  tenantId: string;
  apartmentId: string;
  billingMonth: string;
  totalAmount: number;
  status: PaymentStatus;
  paidDate: string | null;
  createdAt: string;
}

export type PaymentStatus = 'paid' | 'pending' | 'overdue';

export type BillType = 'rent' | 'electricity' | 'water';

export interface Transaction {
  id: string;
  type: BillType;
  tenantName: string;
  apartmentUnit: string;
  amount: number;
  status: PaymentStatus;
  date: string;
}

export const APARTMENTS: Omit<Apartment, 'tenant'>[] = [
  { id: 'apt-2f', unit: '2nd Floor – Front', floor: 2, position: 'Front' },
  { id: 'apt-2b', unit: '2nd Floor – Back', floor: 2, position: 'Back' },
  { id: 'apt-3f', unit: '3rd Floor – Front', floor: 3, position: 'Front' },
  { id: 'apt-3b', unit: '3rd Floor – Back', floor: 3, position: 'Back' },
  { id: 'apt-4f', unit: '4th Floor – Front', floor: 4, position: 'Front' },
  { id: 'apt-4b', unit: '4th Floor – Back', floor: 4, position: 'Back' },
  { id: 'apt-5', unit: '5th Floor', floor: 5, position: 'Single' },
];

export const PAYMENT_INFO = {
  electricity_water: {
    method: 'Telebirr',
    phone: '0911238816',
    accountName: 'Alehegne',
  },
  rent: {
    bankAccount: '1000499143072',
    accountHolder: 'Bayush Kassa',
  },
};

export function calculateElectricityBill(kwhUsed: number, rate: number) {
  const baseCost = kwhUsed * rate;
  const serviceFee = 16;
  const televisionTax = 10;
  const subtotal = baseCost + serviceFee + televisionTax;
  const tax = subtotal * 0.155;
  const totalAmount = subtotal + tax;
  return { baseCost, serviceFee, televisionTax, subtotal, tax: Math.round(tax * 100) / 100, totalAmount: Math.round(totalAmount * 100) / 100 };
}
