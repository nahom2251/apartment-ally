import { useApp } from '@/context/AppContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';

export default function ReportsPage() {
  const { apartments, rentPayments, electricityBills, waterBills, getTotalRevenue } = useApp();
  const revenue = getTotalRevenue();

  const statusColor = (s: string) => {
    if (s === 'paid') return 'bg-success/10 text-success border-success/20';
    if (s === 'overdue') return 'bg-destructive/10 text-destructive border-destructive/20';
    return 'bg-warning/10 text-warning border-warning/20';
  };

  // Monthly revenue grouped
  const monthlyRevenue = new Map<string, { rent: number; electricity: number; water: number }>();
  const addToMonth = (date: string, type: 'rent' | 'electricity' | 'water', amount: number) => {
    const month = date.slice(0, 7);
    const existing = monthlyRevenue.get(month) || { rent: 0, electricity: 0, water: 0 };
    existing[type] += amount;
    monthlyRevenue.set(month, existing);
  };
  rentPayments.filter(p => p.status === 'paid').forEach(p => addToMonth(p.paidDate || p.createdAt, 'rent', p.totalAmount));
  electricityBills.filter(b => b.status === 'paid').forEach(b => addToMonth(b.paidDate || b.createdAt, 'electricity', b.totalAmount));
  waterBills.filter(b => b.status === 'paid').forEach(b => addToMonth(b.paidDate || b.createdAt, 'water', b.totalAmount));

  const sortedMonths = Array.from(monthlyRevenue.entries()).sort((a, b) => b[0].localeCompare(a[0]));

  return (
    <div className="space-y-6 animate-fade-in">
      <Tabs defaultValue="status">
        <TabsList>
          <TabsTrigger value="status">Payment Status</TabsTrigger>
          <TabsTrigger value="revenue">Revenue</TabsTrigger>
          <TabsTrigger value="history">Payment History</TabsTrigger>
        </TabsList>

        <TabsContent value="status">
          <Card className="border-border mt-4">
            <CardHeader className="pb-3"><CardTitle className="text-base font-display">Payment Status by Apartment</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-3">
                {apartments.filter(a => a.tenant).map(apt => {
                  const aptRent = rentPayments.filter(p => p.apartmentId === apt.id);
                  const aptElec = electricityBills.filter(b => b.apartmentId === apt.id);
                  const aptWater = waterBills.filter(b => b.apartmentId === apt.id);
                  const latestRent = aptRent[aptRent.length - 1];
                  const latestElec = aptElec[aptElec.length - 1];
                  const latestWater = aptWater[aptWater.length - 1];

                  return (
                    <div key={apt.id} className="p-4 rounded-lg border border-border">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <p className="text-sm font-medium text-foreground">{apt.tenant!.name}</p>
                          <p className="text-xs text-muted-foreground">{apt.unit}</p>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <div className="text-xs">
                          <span className="text-muted-foreground mr-1">Rent:</span>
                          <Badge variant="outline" className={cn("text-[10px]", statusColor(latestRent?.status || 'pending'))}>
                            {latestRent?.status || 'No bill'}
                          </Badge>
                        </div>
                        <div className="text-xs">
                          <span className="text-muted-foreground mr-1">Electricity:</span>
                          <Badge variant="outline" className={cn("text-[10px]", statusColor(latestElec?.status || 'pending'))}>
                            {latestElec?.status || 'No bill'}
                          </Badge>
                        </div>
                        <div className="text-xs">
                          <span className="text-muted-foreground mr-1">Water:</span>
                          <Badge variant="outline" className={cn("text-[10px]", statusColor(latestWater?.status || 'pending'))}>
                            {latestWater?.status || 'No bill'}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  );
                })}
                {apartments.filter(a => a.tenant).length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-8">No tenants yet</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="revenue">
          <div className="space-y-4 mt-4">
            {/* Total */}
            <Card className="border-border">
              <CardHeader className="pb-3"><CardTitle className="text-base font-display">Total Revenue Summary</CardTitle></CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { label: 'Rent', value: revenue.rent },
                    { label: 'Electricity', value: revenue.electricity },
                    { label: 'Water', value: revenue.water },
                    { label: 'Total', value: revenue.total },
                  ].map(r => (
                    <div key={r.label} className="text-center p-3 rounded-lg bg-muted">
                      <p className="text-xs text-muted-foreground">{r.label}</p>
                      <p className="text-lg font-semibold text-foreground">{r.value.toLocaleString()} ETB</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Monthly */}
            <Card className="border-border">
              <CardHeader className="pb-3"><CardTitle className="text-base font-display">Monthly Revenue</CardTitle></CardHeader>
              <CardContent>
                {sortedMonths.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-8">No revenue data yet</p>
                ) : (
                  <div className="space-y-2">
                    {sortedMonths.map(([month, data]) => (
                      <div key={month} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                        <span className="text-sm font-medium text-foreground">{month}</span>
                        <div className="flex gap-4 text-xs text-muted-foreground">
                          <span>R: {data.rent.toLocaleString()}</span>
                          <span>E: {data.electricity.toLocaleString()}</span>
                          <span>W: {data.water.toLocaleString()}</span>
                          <span className="font-semibold text-foreground">{(data.rent + data.electricity + data.water).toLocaleString()} ETB</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="history">
          <Card className="border-border mt-4">
            <CardHeader className="pb-3"><CardTitle className="text-base font-display">Payment History by Apartment</CardTitle></CardHeader>
            <CardContent>
              {apartments.filter(a => a.tenant).map(apt => {
                const allPayments = [
                  ...rentPayments.filter(p => p.apartmentId === apt.id).map(p => ({ type: 'Rent', amount: p.totalAmount, status: p.status, date: p.paidDate || p.createdAt })),
                  ...electricityBills.filter(b => b.apartmentId === apt.id).map(b => ({ type: 'Electricity', amount: b.totalAmount, status: b.status, date: b.paidDate || b.createdAt })),
                  ...waterBills.filter(b => b.apartmentId === apt.id).map(b => ({ type: 'Water', amount: b.totalAmount, status: b.status, date: b.paidDate || b.createdAt })),
                ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

                if (allPayments.length === 0) return null;

                return (
                  <div key={apt.id} className="mb-4">
                    <p className="text-sm font-medium text-foreground mb-2">{apt.unit} – {apt.tenant!.name}</p>
                    <div className="space-y-1">
                      {allPayments.map((p, i) => (
                        <div key={i} className="flex items-center justify-between py-1.5 px-3 rounded bg-muted/30 text-xs">
                          <span className="text-muted-foreground">{p.type}</span>
                          <span className="text-foreground font-medium">{p.amount.toLocaleString()} ETB</span>
                          <Badge variant="outline" className={cn("text-[10px]", statusColor(p.status))}>{p.status}</Badge>
                          <span className="text-muted-foreground">{new Date(p.date).toLocaleDateString()}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
