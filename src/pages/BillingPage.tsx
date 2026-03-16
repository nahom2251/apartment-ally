import { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { DollarSign, Zap, Droplets, Check, FileDown, CreditCard } from 'lucide-react';
import { calculateElectricityBill, PAYMENT_INFO } from '@/lib/types';
import { generateRentPDF, generateElectricityPDF, generateWaterPDF } from '@/lib/pdfGenerator';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

export default function BillingPage() {
  const { apartments, rentPayments, electricityBills, waterBills, addRentPayment, addElectricityBill, addWaterBill, markPaid } = useApp();
  const occupiedApts = apartments.filter(a => a.tenant);

  const [rentDialog, setRentDialog] = useState(false);
  const [elecDialog, setElecDialog] = useState(false);
  const [waterDialog, setWaterDialog] = useState(false);

  const [rentForm, setRentForm] = useState({ apartmentId: '', months: '1' });
  const [elecForm, setElecForm] = useState({ apartmentId: '', kwhUsed: '', rate: '', billingMonth: '' });
  const [waterForm, setWaterForm] = useState({ apartmentId: '', amount: '', billingMonth: '' });

  const statusColor = (s: string) => {
    if (s === 'paid') return 'bg-success/10 text-success border-success/20';
    if (s === 'overdue') return 'bg-destructive/10 text-destructive border-destructive/20';
    return 'bg-warning/10 text-warning border-warning/20';
  };

  const handleAddRent = () => {
    const apt = apartments.find(a => a.id === rentForm.apartmentId);
    if (!apt?.tenant) return;
    const months = Number(rentForm.months);
    const total = apt.tenant.monthlyRent * months;
    const now = new Date();
    const end = new Date(now);
    end.setMonth(end.getMonth() + months);
    addRentPayment({
      tenantId: apt.tenant.id, apartmentId: apt.id, months,
      monthlyAmount: apt.tenant.monthlyRent, totalAmount: total,
      periodStart: now.toISOString().slice(0, 10),
      periodEnd: end.toISOString().slice(0, 10),
      status: 'pending', paidDate: null,
    });
    toast.success(`Rent bill created: ${total.toLocaleString()} ETB`);
    setRentDialog(false);
    setRentForm({ apartmentId: '', months: '1' });
  };

  const handleAddElec = () => {
    const apt = apartments.find(a => a.id === elecForm.apartmentId);
    if (!apt?.tenant || !elecForm.kwhUsed || !elecForm.rate || !elecForm.billingMonth) return;
    const calc = calculateElectricityBill(Number(elecForm.kwhUsed), Number(elecForm.rate));
    addElectricityBill({
      tenantId: apt.tenant.id, apartmentId: apt.id, billingMonth: elecForm.billingMonth,
      kwhUsed: Number(elecForm.kwhUsed), electricityRate: Number(elecForm.rate),
      ...calc, status: 'pending', paidDate: null,
    });
    toast.success(`Electricity bill created: ${calc.totalAmount.toFixed(2)} ETB`);
    setElecDialog(false);
    setElecForm({ apartmentId: '', kwhUsed: '', rate: '', billingMonth: '' });
  };

  const handleAddWater = () => {
    const apt = apartments.find(a => a.id === waterForm.apartmentId);
    if (!apt?.tenant || !waterForm.amount || !waterForm.billingMonth) return;
    addWaterBill({
      tenantId: apt.tenant.id, apartmentId: apt.id, billingMonth: waterForm.billingMonth,
      totalAmount: Number(waterForm.amount), status: 'pending', paidDate: null,
    });
    toast.success(`Water bill created: ${Number(waterForm.amount).toLocaleString()} ETB`);
    setWaterDialog(false);
    setWaterForm({ apartmentId: '', amount: '', billingMonth: '' });
  };

  const selectedRentApt = apartments.find(a => a.id === rentForm.apartmentId);
  const rentTotal = selectedRentApt?.tenant ? selectedRentApt.tenant.monthlyRent * Number(rentForm.months) : 0;

  const AptSelect = ({ value, onChange }: { value: string; onChange: (v: string) => void }) => (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger><SelectValue placeholder="Select apartment" /></SelectTrigger>
      <SelectContent>
        {occupiedApts.map(a => (
          <SelectItem key={a.id} value={a.id}>{a.unit} – {a.tenant!.name}</SelectItem>
        ))}
      </SelectContent>
    </Select>
  );

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Action buttons */}
      <div className="flex flex-wrap gap-3">
        <Button onClick={() => setRentDialog(true)}><DollarSign className="w-4 h-4 mr-2" /> Record Rent</Button>
        <Button variant="outline" onClick={() => setElecDialog(true)}><Zap className="w-4 h-4 mr-2" /> Electricity Bill</Button>
        <Button variant="outline" onClick={() => setWaterDialog(true)}><Droplets className="w-4 h-4 mr-2" /> Water Bill</Button>
      </div>

      {/* Payment Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="border-border">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <CreditCard className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-foreground">Rent Payment Info</span>
            </div>
            <p className="text-xs text-muted-foreground">Bank Account: {PAYMENT_INFO.rent.bankAccount}</p>
            <p className="text-xs text-muted-foreground">Account Holder: {PAYMENT_INFO.rent.accountHolder}</p>
          </CardContent>
        </Card>
        <Card className="border-border">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <CreditCard className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-foreground">Electricity & Water Payment Info</span>
            </div>
            <p className="text-xs text-muted-foreground">Method: {PAYMENT_INFO.electricity_water.method}</p>
            <p className="text-xs text-muted-foreground">Phone: {PAYMENT_INFO.electricity_water.phone}</p>
            <p className="text-xs text-muted-foreground">Account: {PAYMENT_INFO.electricity_water.accountName}</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="rent">
        <TabsList>
          <TabsTrigger value="rent">Rent</TabsTrigger>
          <TabsTrigger value="electricity">Electricity</TabsTrigger>
          <TabsTrigger value="water">Water</TabsTrigger>
        </TabsList>

        <TabsContent value="rent">
          <BillList items={rentPayments.map(p => {
            const apt = apartments.find(a => a.id === p.apartmentId);
            return { id: p.id, tenant: apt?.tenant?.name || '', unit: apt?.unit || '', amount: p.totalAmount, status: p.status, date: p.createdAt, detail: `${p.months} month(s) · ${p.periodStart} to ${p.periodEnd}`, onPay: () => { markPaid('rent', p.id); toast.success('Marked as paid'); }, onPdf: () => generateRentPDF(p, apt?.tenant?.name || '', apt?.unit || '') };
          })} statusColor={statusColor} />
        </TabsContent>

        <TabsContent value="electricity">
          <BillList items={electricityBills.map(b => {
            const apt = apartments.find(a => a.id === b.apartmentId);
            return { id: b.id, tenant: apt?.tenant?.name || '', unit: apt?.unit || '', amount: b.totalAmount, status: b.status, date: b.createdAt, detail: `${b.billingMonth} · ${b.kwhUsed} kWh`, onPay: () => { markPaid('electricity', b.id); toast.success('Marked as paid'); }, onPdf: () => generateElectricityPDF(b, apt?.tenant?.name || '', apt?.unit || '') };
          })} statusColor={statusColor} />
        </TabsContent>

        <TabsContent value="water">
          <BillList items={waterBills.map(b => {
            const apt = apartments.find(a => a.id === b.apartmentId);
            return { id: b.id, tenant: apt?.tenant?.name || '', unit: apt?.unit || '', amount: b.totalAmount, status: b.status, date: b.createdAt, detail: b.billingMonth, onPay: () => { markPaid('water', b.id); toast.success('Marked as paid'); }, onPdf: () => generateWaterPDF(b, apt?.tenant?.name || '', apt?.unit || '') };
          })} statusColor={statusColor} />
        </TabsContent>
      </Tabs>

      {/* Rent Dialog */}
      <Dialog open={rentDialog} onOpenChange={setRentDialog}>
        <DialogContent>
          <DialogHeader><DialogTitle className="font-display">Record Rent Payment</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div><Label>Apartment</Label><AptSelect value={rentForm.apartmentId} onChange={v => setRentForm(f => ({ ...f, apartmentId: v }))} /></div>
            <div>
              <Label>Number of Months</Label>
              <Select value={rentForm.months} onValueChange={v => setRentForm(f => ({ ...f, months: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 12 }, (_, i) => (
                    <SelectItem key={i + 1} value={String(i + 1)}>{i + 1} month{i > 0 ? 's' : ''}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {selectedRentApt?.tenant && (
              <div className="p-3 rounded-lg bg-muted">
                <p className="text-sm text-muted-foreground">Monthly: {selectedRentApt.tenant.monthlyRent.toLocaleString()} ETB</p>
                <p className="text-lg font-semibold text-foreground">Total: {rentTotal.toLocaleString()} ETB</p>
              </div>
            )}
            <Button className="w-full" onClick={handleAddRent} disabled={!rentForm.apartmentId}>Create Rent Bill</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Electricity Dialog */}
      <Dialog open={elecDialog} onOpenChange={setElecDialog}>
        <DialogContent>
          <DialogHeader><DialogTitle className="font-display">Create Electricity Bill</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div><Label>Apartment</Label><AptSelect value={elecForm.apartmentId} onChange={v => setElecForm(f => ({ ...f, apartmentId: v }))} /></div>
            <div><Label>Billing Month</Label><Input type="month" value={elecForm.billingMonth} onChange={e => setElecForm(f => ({ ...f, billingMonth: e.target.value }))} /></div>
            <div><Label>kWh Used</Label><Input type="number" value={elecForm.kwhUsed} onChange={e => setElecForm(f => ({ ...f, kwhUsed: e.target.value }))} placeholder="150" /></div>
            <div><Label>Electricity Rate (ETB/kWh)</Label><Input type="number" step="0.01" value={elecForm.rate} onChange={e => setElecForm(f => ({ ...f, rate: e.target.value }))} placeholder="2.50" /></div>
            {elecForm.kwhUsed && elecForm.rate && (
              <div className="p-3 rounded-lg bg-muted text-sm space-y-1">
                {(() => {
                  const c = calculateElectricityBill(Number(elecForm.kwhUsed), Number(elecForm.rate));
                  return <>
                    <p className="text-muted-foreground">Base: {c.baseCost.toFixed(2)} ETB</p>
                    <p className="text-muted-foreground">Service Fee: {c.serviceFee} ETB</p>
                    <p className="text-muted-foreground">TV Tax: {c.televisionTax} ETB</p>
                    <p className="text-muted-foreground">Tax (15.5%): {c.tax.toFixed(2)} ETB</p>
                    <p className="text-lg font-semibold text-foreground">Total: {c.totalAmount.toFixed(2)} ETB</p>
                  </>;
                })()}
              </div>
            )}
            <Button className="w-full" onClick={handleAddElec} disabled={!elecForm.apartmentId || !elecForm.kwhUsed || !elecForm.rate || !elecForm.billingMonth}>Create Bill</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Water Dialog */}
      <Dialog open={waterDialog} onOpenChange={setWaterDialog}>
        <DialogContent>
          <DialogHeader><DialogTitle className="font-display">Create Water Bill</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div><Label>Apartment</Label><AptSelect value={waterForm.apartmentId} onChange={v => setWaterForm(f => ({ ...f, apartmentId: v }))} /></div>
            <div><Label>Billing Month</Label><Input type="month" value={waterForm.billingMonth} onChange={e => setWaterForm(f => ({ ...f, billingMonth: e.target.value }))} /></div>
            <div><Label>Amount (ETB)</Label><Input type="number" value={waterForm.amount} onChange={e => setWaterForm(f => ({ ...f, amount: e.target.value }))} placeholder="200" /></div>
            <Button className="w-full" onClick={handleAddWater} disabled={!waterForm.apartmentId || !waterForm.amount || !waterForm.billingMonth}>Create Bill</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

interface BillItem {
  id: string; tenant: string; unit: string; amount: number; status: string; date: string; detail: string;
  onPay: () => void; onPdf: () => void;
}

function BillList({ items, statusColor }: { items: BillItem[]; statusColor: (s: string) => string }) {
  if (items.length === 0) return <p className="text-sm text-muted-foreground text-center py-8">No bills yet</p>;
  return (
    <div className="space-y-2 mt-4">
      {items.map(item => (
        <div key={item.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-lg border border-border bg-card">
          <div className="flex-1">
            <p className="text-sm font-medium text-foreground">{item.tenant}</p>
            <p className="text-xs text-muted-foreground">{item.unit} · {item.detail}</p>
          </div>
          <div className="flex items-center gap-3">
            <p className="text-sm font-semibold text-foreground">{item.amount.toLocaleString()} ETB</p>
            <Badge variant="outline" className={cn("text-[10px]", statusColor(item.status))}>{item.status}</Badge>
            {item.status !== 'paid' && (
              <Button size="sm" variant="outline" className="text-xs" onClick={item.onPay}>
                <Check className="w-3 h-3 mr-1" /> Paid
              </Button>
            )}
            <Button size="sm" variant="ghost" className="text-xs" onClick={item.onPdf}>
              <FileDown className="w-3 h-3" />
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}
