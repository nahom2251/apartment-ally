import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  Apartment, Tenant, RentPayment, ElectricityBill, WaterBill,
  APARTMENTS, PaymentStatus, Transaction, BillType
} from '@/lib/types';

interface AppState {
  apartments: Apartment[];
  rentPayments: RentPayment[];
  electricityBills: ElectricityBill[];
  waterBills: WaterBill[];
  addTenant: (tenant: Omit<Tenant, 'id'>) => void;
  updateTenant: (tenant: Tenant) => void;
  removeTenant: (tenantId: string, apartmentId: string) => void;
  addRentPayment: (payment: Omit<RentPayment, 'id' | 'createdAt'>) => void;
  addElectricityBill: (bill: Omit<ElectricityBill, 'id' | 'createdAt'>) => void;
  addWaterBill: (bill: Omit<WaterBill, 'id' | 'createdAt'>) => void;
  markPaid: (type: BillType, id: string) => void;
  getTransactions: () => Transaction[];
  getTenantByApartment: (apartmentId: string) => Tenant | null;
  getTotalRevenue: () => { rent: number; electricity: number; water: number; total: number };
  getOverdueCount: () => number;
  getOccupiedCount: () => number;
}

const AppContext = createContext<AppState | null>(null);

function loadFromStorage<T>(key: string, fallback: T): T {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : fallback;
  } catch { return fallback; }
}

function saveToStorage(key: string, data: unknown) {
  localStorage.setItem(key, JSON.stringify(data));
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [apartments, setApartments] = useState<Apartment[]>(() => {
    const saved = loadFromStorage<Apartment[]>('apartments', []);
    if (saved.length > 0) return saved;
    return APARTMENTS.map(a => ({ ...a, tenant: null }));
  });

  const [rentPayments, setRentPayments] = useState<RentPayment[]>(() => loadFromStorage('rentPayments', []));
  const [electricityBills, setElectricityBills] = useState<ElectricityBill[]>(() => loadFromStorage('electricityBills', []));
  const [waterBills, setWaterBills] = useState<WaterBill[]>(() => loadFromStorage('waterBills', []));

  useEffect(() => { saveToStorage('apartments', apartments); }, [apartments]);
  useEffect(() => { saveToStorage('rentPayments', rentPayments); }, [rentPayments]);
  useEffect(() => { saveToStorage('electricityBills', electricityBills); }, [electricityBills]);
  useEffect(() => { saveToStorage('waterBills', waterBills); }, [waterBills]);

  const addTenant = useCallback((tenant: Omit<Tenant, 'id'>) => {
    const newTenant: Tenant = { ...tenant, id: crypto.randomUUID() };
    setApartments(prev => prev.map(a => a.id === tenant.apartmentId ? { ...a, tenant: newTenant } : a));
  }, []);

  const updateTenant = useCallback((tenant: Tenant) => {
    setApartments(prev => prev.map(a => a.id === tenant.apartmentId ? { ...a, tenant } : a));
  }, []);

  const removeTenant = useCallback((tenantId: string, apartmentId: string) => {
    setApartments(prev => prev.map(a => a.id === apartmentId ? { ...a, tenant: null } : a));
  }, []);

  const addRentPayment = useCallback((payment: Omit<RentPayment, 'id' | 'createdAt'>) => {
    const newPayment: RentPayment = { ...payment, id: crypto.randomUUID(), createdAt: new Date().toISOString() };
    setRentPayments(prev => [...prev, newPayment]);
  }, []);

  const addElectricityBill = useCallback((bill: Omit<ElectricityBill, 'id' | 'createdAt'>) => {
    const newBill: ElectricityBill = { ...bill, id: crypto.randomUUID(), createdAt: new Date().toISOString() };
    setElectricityBills(prev => [...prev, newBill]);
  }, []);

  const addWaterBill = useCallback((bill: Omit<WaterBill, 'id' | 'createdAt'>) => {
    const newBill: WaterBill = { ...bill, id: crypto.randomUUID(), createdAt: new Date().toISOString() };
    setWaterBills(prev => [...prev, newBill]);
  }, []);

  const markPaid = useCallback((type: BillType, id: string) => {
    const paidDate = new Date().toISOString();
    if (type === 'rent') {
      setRentPayments(prev => prev.map(p => p.id === id ? { ...p, status: 'paid' as PaymentStatus, paidDate } : p));
    } else if (type === 'electricity') {
      setElectricityBills(prev => prev.map(b => b.id === id ? { ...b, status: 'paid' as PaymentStatus, paidDate } : b));
    } else {
      setWaterBills(prev => prev.map(b => b.id === id ? { ...b, status: 'paid' as PaymentStatus, paidDate } : b));
    }
  }, []);

  const getTransactions = useCallback((): Transaction[] => {
    const txns: Transaction[] = [];
    rentPayments.forEach(p => {
      const apt = apartments.find(a => a.id === p.apartmentId);
      txns.push({ id: p.id, type: 'rent', tenantName: apt?.tenant?.name || 'Unknown', apartmentUnit: apt?.unit || '', amount: p.totalAmount, status: p.status, date: p.createdAt });
    });
    electricityBills.forEach(b => {
      const apt = apartments.find(a => a.id === b.apartmentId);
      txns.push({ id: b.id, type: 'electricity', tenantName: apt?.tenant?.name || 'Unknown', apartmentUnit: apt?.unit || '', amount: b.totalAmount, status: b.status, date: b.createdAt });
    });
    waterBills.forEach(b => {
      const apt = apartments.find(a => a.id === b.apartmentId);
      txns.push({ id: b.id, type: 'water', tenantName: apt?.tenant?.name || 'Unknown', apartmentUnit: apt?.unit || '', amount: b.totalAmount, status: b.status, date: b.createdAt });
    });
    return txns.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [apartments, rentPayments, electricityBills, waterBills]);

  const getTenantByApartment = useCallback((apartmentId: string) => {
    return apartments.find(a => a.id === apartmentId)?.tenant || null;
  }, [apartments]);

  const getTotalRevenue = useCallback(() => {
    const rent = rentPayments.filter(p => p.status === 'paid').reduce((s, p) => s + p.totalAmount, 0);
    const electricity = electricityBills.filter(b => b.status === 'paid').reduce((s, b) => s + b.totalAmount, 0);
    const water = waterBills.filter(b => b.status === 'paid').reduce((s, b) => s + b.totalAmount, 0);
    return { rent, electricity, water, total: rent + electricity + water };
  }, [rentPayments, electricityBills, waterBills]);

  const getOverdueCount = useCallback(() => {
    return rentPayments.filter(p => p.status === 'overdue').length +
      electricityBills.filter(b => b.status === 'overdue').length +
      waterBills.filter(b => b.status === 'overdue').length;
  }, [rentPayments, electricityBills, waterBills]);

  const getOccupiedCount = useCallback(() => {
    return apartments.filter(a => a.tenant !== null).length;
  }, [apartments]);

  return (
    <AppContext.Provider value={{
      apartments, rentPayments, electricityBills, waterBills,
      addTenant, updateTenant, removeTenant,
      addRentPayment, addElectricityBill, addWaterBill, markPaid,
      getTransactions, getTenantByApartment, getTotalRevenue, getOverdueCount, getOccupiedCount,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
