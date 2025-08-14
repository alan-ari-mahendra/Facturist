export interface InvoiceItem {
  id: string;
  projectName: string;
  totalHours: string;
  ratePerHour: number;
  totalPrice: number;
}

export interface InvoiceData {
  // Sender
  senderCompany: string;
  senderAddress: string;
  senderPhone: string;
  senderEmail: string;
  senderWebsite: string;
  senderLogo: string;

  // Recipient
  recipientCompany: string;
  recipientAddress: string;
  recipientPhone: string;
  recipientEmail: string;

  // Payment Details
  bankAccount: string;
  accountName: string;
  bankName: string;

  // Invoice Details
  invoiceNumber: string;
  invoiceDate: string;
  currency: "USD" | "IDR";
  usdToIdrRate: number;

  // Items
  items: InvoiceItem[];

  // Totals
  taxPercentage: number;
}
