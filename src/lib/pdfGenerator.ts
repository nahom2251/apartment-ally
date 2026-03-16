import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { RentPayment, ElectricityBill, WaterBill, PAYMENT_INFO } from '@/lib/types';

function addHeader(doc: jsPDF, title: string) {
  doc.setFontSize(22);
  doc.setTextColor(59, 130, 246);
  doc.text('AS', 105, 20, { align: 'center' });
  doc.setFontSize(14);
  doc.setTextColor(30, 41, 59);
  doc.text('Alehegne Sewnet Apartment', 105, 30, { align: 'center' });
  doc.setFontSize(10);
  doc.setTextColor(100, 116, 139);
  doc.text('SOPHISTICATION & EXCELLENCE', 105, 37, { align: 'center' });
  doc.setFontSize(16);
  doc.setTextColor(30, 41, 59);
  doc.text(title, 105, 50, { align: 'center' });
  doc.setDrawColor(59, 130, 246);
  doc.line(20, 55, 190, 55);
}

function addPaymentInfo(doc: jsPDF, y: number, type: 'rent' | 'electricity' | 'water') {
  doc.setFontSize(11);
  doc.setTextColor(30, 41, 59);
  doc.text('Payment Information', 20, y);
  y += 7;
  doc.setFontSize(9);
  doc.setTextColor(100, 116, 139);

  if (type === 'rent') {
    doc.text(`Bank Account: ${PAYMENT_INFO.rent.bankAccount}`, 20, y);
    doc.text(`Account Holder: ${PAYMENT_INFO.rent.accountHolder}`, 20, y + 5);
  } else {
    doc.text(`Payment Method: ${PAYMENT_INFO.electricity_water.method}`, 20, y);
    doc.text(`Phone/Account: ${PAYMENT_INFO.electricity_water.phone}`, 20, y + 5);
    doc.text(`Account Name: ${PAYMENT_INFO.electricity_water.accountName}`, 20, y + 10);
  }
  return y + 20;
}

function addFooter(doc: jsPDF) {
  const pageHeight = doc.internal.pageSize.height;
  doc.setFontSize(8);
  doc.setTextColor(150);
  doc.text(`Generated on ${new Date().toLocaleDateString()}`, 20, pageHeight - 15);
  doc.text('© 2024 AS Residential Group | Powered by Zurya Tech', 105, pageHeight - 10, { align: 'center' });
}

export function generateRentPDF(payment: RentPayment, tenantName: string, apartmentUnit: string) {
  const doc = new jsPDF();
  addHeader(doc, 'Rent Invoice');

  let y = 65;
  doc.setFontSize(10);
  doc.setTextColor(30, 41, 59);
  doc.text(`Tenant: ${tenantName}`, 20, y);
  doc.text(`Apartment: ${apartmentUnit}`, 20, y + 6);
  doc.text(`Period: ${payment.periodStart} to ${payment.periodEnd}`, 20, y + 12);
  doc.text(`Status: ${payment.status.toUpperCase()}`, 140, y);

  y += 25;
  autoTable(doc, {
    startY: y,
    head: [['Description', 'Amount (ETB)']],
    body: [
      [`Monthly Rent (${payment.months} month${payment.months > 1 ? 's' : ''})`, `${payment.monthlyAmount.toLocaleString()} × ${payment.months}`],
      ['Total', payment.totalAmount.toLocaleString()],
    ],
    theme: 'grid',
    headStyles: { fillColor: [59, 130, 246] },
  });

  const finalY = (doc as any).lastAutoTable?.finalY || y + 30;
  addPaymentInfo(doc, finalY + 15, 'rent');
  addFooter(doc);
  doc.save(`rent-invoice-${tenantName.replace(/\s/g, '-')}-${payment.periodStart}.pdf`);
}

export function generateElectricityPDF(bill: ElectricityBill, tenantName: string, apartmentUnit: string) {
  const doc = new jsPDF();
  addHeader(doc, 'Electricity Bill');

  let y = 65;
  doc.setFontSize(10);
  doc.setTextColor(30, 41, 59);
  doc.text(`Tenant: ${tenantName}`, 20, y);
  doc.text(`Apartment: ${apartmentUnit}`, 20, y + 6);
  doc.text(`Billing Month: ${bill.billingMonth}`, 20, y + 12);
  doc.text(`Status: ${bill.status.toUpperCase()}`, 140, y);

  y += 25;
  autoTable(doc, {
    startY: y,
    head: [['Description', 'Amount (ETB)']],
    body: [
      [`Electricity (${bill.kwhUsed} kWh × ${bill.electricityRate} ETB)`, bill.baseCost.toFixed(2)],
      ['Service Fee', bill.serviceFee.toFixed(2)],
      ['Television Tax', bill.televisionTax.toFixed(2)],
      ['Subtotal', bill.subtotal.toFixed(2)],
      ['Tax (15.5%)', bill.tax.toFixed(2)],
      ['Total', bill.totalAmount.toFixed(2)],
    ],
    theme: 'grid',
    headStyles: { fillColor: [59, 130, 246] },
  });

  const finalY = (doc as any).lastAutoTable?.finalY || y + 50;
  addPaymentInfo(doc, finalY + 15, 'electricity');
  addFooter(doc);
  doc.save(`electricity-bill-${tenantName.replace(/\s/g, '-')}-${bill.billingMonth}.pdf`);
}

export function generateWaterPDF(bill: WaterBill, tenantName: string, apartmentUnit: string) {
  const doc = new jsPDF();
  addHeader(doc, 'Water Bill');

  let y = 65;
  doc.setFontSize(10);
  doc.setTextColor(30, 41, 59);
  doc.text(`Tenant: ${tenantName}`, 20, y);
  doc.text(`Apartment: ${apartmentUnit}`, 20, y + 6);
  doc.text(`Billing Month: ${bill.billingMonth}`, 20, y + 12);
  doc.text(`Status: ${bill.status.toUpperCase()}`, 140, y);

  y += 25;
  autoTable(doc, {
    startY: y,
    head: [['Description', 'Amount (ETB)']],
    body: [
      ['Water Bill', bill.totalAmount.toFixed(2)],
    ],
    theme: 'grid',
    headStyles: { fillColor: [59, 130, 246] },
  });

  const finalY = (doc as any).lastAutoTable?.finalY || y + 20;
  addPaymentInfo(doc, finalY + 15, 'water');
  addFooter(doc);
  doc.save(`water-bill-${tenantName.replace(/\s/g, '-')}-${bill.billingMonth}.pdf`);
}
