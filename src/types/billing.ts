export type PaymentStatus = "unpaid" | "partial" | "paid" | "waived";

export interface Billing {
  id: string;
  tenant_id: string | null;
  property_id: string;
  room_id: string;
  rent_amount: number;
  payment_status: PaymentStatus;
  period_start: string; // date
  period_end: string;   // date
  start_date: string;
  end_date?: string | null;
  created_at?: string;
  updated_at?: string | null;
}

export type BillingRow = {
  id: string;
  tenantId: string;
  tenantName: string;
  propertyId: string;
  propertyName: string;
  roomId: string;
  roomName: string;
  rentAmount: number;
  paymentStatus: PaymentStatus;
  periodStart: string; // YYYY-MM-DD
  periodEnd: string;   // YYYY-MM-DD
};
