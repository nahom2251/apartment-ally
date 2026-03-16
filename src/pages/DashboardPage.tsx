import { useApp } from '@/context/AppContext';
import { Building2, Users, AlertTriangle, DollarSign, TrendingUp, Zap, Droplets } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export default function DashboardPage() {
  const { apartments, getTransactions, getTotalRevenue, getOverdueCount, getOccupiedCount } = useApp();
  const revenue = getTotalRevenue();
  const transactions = getTransactions().slice(0, 8);
  const overdueCount = getOverdueCount();
  const occupiedCount = getOccupiedCount();

  const stats = [
    { label: 'Total Apartments', value: '7', icon: Building2, color: 'text-primary' },
    { label: 'Occupied', value: String(occupiedCount), icon: Users, color: 'text-success' },
    { label: 'Overdue Payments', value: String(overdueCount), icon: AlertTriangle, color: 'text-destructive' },
    { label: 'Total Revenue', value: `${revenue.total.toLocaleString()} ETB`, icon: TrendingUp, color: 'text-primary' },
  ];

  const statusColor = (s: string) => {
    if (s === 'paid') return 'bg-success/10 text-success border-success/20';
    if (s === 'overdue') return 'bg-destructive/10 text-destructive border-destructive/20';
    return 'bg-warning/10 text-warning border-warning/20';
  };

  const typeIcon = (t: string) => {
    if (t === 'rent') return <DollarSign className="w-4 h-4" />;
    if (t === 'electricity') return <Zap className="w-4 h-4" />;
    return <Droplets className="w-4 h-4" />;
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(s => (
          <Card key={s.label} className="border-border">
            <CardContent className="p-4 flex items-center gap-3">
              <div className={cn("p-2 rounded-lg bg-muted", s.color)}>
                <s.icon className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">{s.label}</p>
                <p className="text-lg font-semibold text-foreground">{s.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Revenue Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: 'Rent Revenue', value: revenue.rent, icon: DollarSign },
          { label: 'Electricity Revenue', value: revenue.electricity, icon: Zap },
          { label: 'Water Revenue', value: revenue.water, icon: Droplets },
        ].map(r => (
          <Card key={r.label} className="border-border">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <r.icon className="w-4 h-4" />
                <span className="text-xs">{r.label}</span>
              </div>
              <p className="text-xl font-semibold text-foreground">{r.value.toLocaleString()} ETB</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Apartment Overview */}
      <Card className="border-border">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-display">Apartment Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
            {apartments.map(apt => (
              <div key={apt.id} className="p-3 rounded-lg border border-border bg-card hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-2">
                  <p className="text-sm font-medium text-foreground">{apt.unit}</p>
                  <Badge variant={apt.tenant ? "default" : "secondary"} className="text-[10px]">
                    {apt.tenant ? 'Occupied' : 'Vacant'}
                  </Badge>
                </div>
                {apt.tenant ? (
                  <div className="text-xs text-muted-foreground space-y-0.5">
                    <p>{apt.tenant.name}</p>
                    <p>{apt.tenant.monthlyRent.toLocaleString()} ETB/mo</p>
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground">No tenant assigned</p>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Transactions */}
      <Card className="border-border">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-display">Recent Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          {transactions.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">No transactions yet</p>
          ) : (
            <div className="space-y-2">
              {transactions.map(t => (
                <div key={t.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <div className="flex items-center gap-3">
                    <div className="p-1.5 rounded-md bg-primary/10 text-primary">{typeIcon(t.type)}</div>
                    <div>
                      <p className="text-sm font-medium text-foreground">{t.tenantName}</p>
                      <p className="text-xs text-muted-foreground">{t.apartmentUnit} · {t.type}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-foreground">{t.amount.toLocaleString()} ETB</p>
                    <Badge variant="outline" className={cn("text-[10px]", statusColor(t.status))}>
                      {t.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
