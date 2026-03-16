import { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { UserPlus, Phone, Calendar, DollarSign, Trash2, Edit } from 'lucide-react';
import { Tenant } from '@/lib/types';
import { toast } from 'sonner';

export default function ApartmentsPage() {
  const { apartments, addTenant, updateTenant, removeTenant } = useApp();
  const [selectedApt, setSelectedApt] = useState<string | null>(null);
  const [editTenant, setEditTenant] = useState<Tenant | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const [form, setForm] = useState({ name: '', phone: '', moveInDate: '', monthlyRent: '' });

  const openAdd = (aptId: string) => {
    setSelectedApt(aptId);
    setEditTenant(null);
    setForm({ name: '', phone: '', moveInDate: '', monthlyRent: '' });
    setDialogOpen(true);
  };

  const openEdit = (tenant: Tenant) => {
    setSelectedApt(tenant.apartmentId);
    setEditTenant(tenant);
    setForm({ name: tenant.name, phone: tenant.phone, moveInDate: tenant.moveInDate, monthlyRent: String(tenant.monthlyRent) });
    setDialogOpen(true);
  };

  const handleSubmit = () => {
    if (!form.name || !form.phone || !form.moveInDate || !form.monthlyRent || !selectedApt) return;
    if (editTenant) {
      updateTenant({ ...editTenant, name: form.name, phone: form.phone, moveInDate: form.moveInDate, monthlyRent: Number(form.monthlyRent) });
      toast.success('Tenant updated');
    } else {
      addTenant({ name: form.name, phone: form.phone, moveInDate: form.moveInDate, apartmentId: selectedApt, monthlyRent: Number(form.monthlyRent) });
      toast.success('Tenant added');
    }
    setDialogOpen(false);
  };

  const handleRemove = (tenantId: string, aptId: string) => {
    if (confirm('Remove this tenant?')) {
      removeTenant(tenantId, aptId);
      toast.success('Tenant removed');
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {apartments.map(apt => (
          <Card key={apt.id} className="border-border hover:shadow-md transition-shadow">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <CardTitle className="text-base font-display">{apt.unit}</CardTitle>
                <Badge variant={apt.tenant ? "default" : "secondary"}>
                  {apt.tenant ? 'Occupied' : 'Vacant'}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              {apt.tenant ? (
                <div className="space-y-3">
                  <div className="space-y-1.5">
                    <p className="text-sm font-medium text-foreground">{apt.tenant.name}</p>
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Phone className="w-3 h-3" /> {apt.tenant.phone}
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Calendar className="w-3 h-3" /> Moved in: {apt.tenant.moveInDate}
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <DollarSign className="w-3 h-3" /> {apt.tenant.monthlyRent.toLocaleString()} ETB/month
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" className="flex-1 text-xs" onClick={() => openEdit(apt.tenant!)}>
                      <Edit className="w-3 h-3 mr-1" /> Edit
                    </Button>
                    <Button size="sm" variant="outline" className="text-xs text-destructive hover:bg-destructive hover:text-destructive-foreground" onClick={() => handleRemove(apt.tenant!.id, apt.id)}>
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              ) : (
                <Button size="sm" className="w-full mt-2" onClick={() => openAdd(apt.id)}>
                  <UserPlus className="w-4 h-4 mr-2" /> Add Tenant
                </Button>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-display">{editTenant ? 'Edit Tenant' : 'Add Tenant'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Tenant Name</Label>
              <Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Full name" />
            </div>
            <div>
              <Label>Phone Number</Label>
              <Input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} placeholder="09xxxxxxxx" />
            </div>
            <div>
              <Label>Move-in Date</Label>
              <Input type="date" value={form.moveInDate} onChange={e => setForm(f => ({ ...f, moveInDate: e.target.value }))} />
            </div>
            <div>
              <Label>Monthly Rent (ETB)</Label>
              <Input type="number" value={form.monthlyRent} onChange={e => setForm(f => ({ ...f, monthlyRent: e.target.value }))} placeholder="5000" />
            </div>
            <Button className="w-full" onClick={handleSubmit}>{editTenant ? 'Update' : 'Add'} Tenant</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
