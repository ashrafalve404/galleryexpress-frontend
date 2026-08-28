import client, { withCompany } from './client';

export interface BulkOrder {
  id: string;
  companyId: string;
  agentId: string;
  routeId: string;
  quantity: number;
  remainingQuantity: number;
  unitPrice: number;
  totalAmount: number;
  status: 'PURCHASED' | 'EXHAUSTED' | 'CANCELLED';
  notes?: string;
  createdAt: string;
  updatedAt: string;
  route: {
    id: string;
    origin: string;
    destination: string;
  };
}

export interface AgentStats {
  totalPurchased: number;
  totalIssued: number;
  totalRemaining: number;
  totalSpent: number;
  totalOrders: number;
}

export interface PurchaseBulkQuotaPayload {
  routeId: string;
  quantity: number;
  unitPrice: number;
  notes?: string;
}

export interface IssueTicketPayload {
  bulkOrderId: string;
  scheduleId: string;
  seatIds: string[];
  passengerName: string;
  passengerPhone: string;
  notes?: string;
}

export async function agentGetStats(): Promise<AgentStats> {
  const res = await client.get('/api/v1/agent/dashboard-stats', { params: withCompany() });
  return res.data?.data || res.data;
}

export async function agentPurchaseBulkQuota(payload: PurchaseBulkQuotaPayload): Promise<BulkOrder> {
  const res = await client.post('/api/v1/agent/bulk-orders', payload, { params: withCompany() });
  return res.data?.data || res.data;
}

export async function agentGetBulkOrders(): Promise<BulkOrder[]> {
  const res = await client.get('/api/v1/agent/bulk-orders', { params: withCompany() });
  return res.data?.data || res.data;
}

export async function agentIssueTicket(payload: IssueTicketPayload): Promise<any> {
  const res = await client.post('/api/v1/agent/issue-ticket', payload, { params: withCompany() });
  return res.data?.data || res.data;
}

export async function agentGetIssuedTickets(): Promise<any[]> {
  const res = await client.get('/api/v1/agent/issued-tickets', { params: withCompany() });
  return res.data?.data || res.data;
}

export interface AgentKycDetails {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  kycStatus: 'NOT_SUBMITTED' | 'PENDING' | 'VERIFIED' | 'REJECTED';
  nidNumber?: string;
  nidDocUrl?: string;
  nidFrontDocUrl?: string;
  nidBackDocUrl?: string;
  counterName?: string;
  counterAddress?: string;
  tradeLicenseNo?: string;
  kycSubmittedAt?: string;
  kycVerifiedAt?: string;
  kycRejectReason?: string;
}

export interface SubmitKycPayload {
  nidNumber: string;
  nidFrontDocUrl: string;
  nidBackDocUrl: string;
  nidDocUrl?: string;
  counterName: string;
  counterAddress: string;
  tradeLicenseNo?: string;
}

export async function agentGetKycDetails(): Promise<AgentKycDetails> {
  const res = await client.get('/api/v1/agent/kyc', { params: withCompany() });
  return res.data?.data || res.data;
}

export async function agentSubmitKyc(payload: SubmitKycPayload): Promise<AgentKycDetails> {
  const res = await client.post('/api/v1/agent/kyc', payload, { params: withCompany() });
  return res.data?.data || res.data;
}
