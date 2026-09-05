import apiClient from './client';

const BASE = '/api/v1/counter-agent';

export interface BulkOrder {
  id: string;
  routeId: string;
  counterId?: string;
  quantity: number;
  remainingQuantity: number;
  unitPrice: number;
  totalAmount: number;
  commissionCap: number;
  commissionEarned: number;
  commissionEligible: boolean;
  status: string;
  paymentMethod?: string;
  senderPhone?: string;
  trxId?: string;
  paymentNotes?: string;
  rejectionReason?: string;
  createdAt: string;
  agent?: { firstName: string; lastName: string; email: string; phone?: string };
  route?: { origin: string; destination: string };
  counter?: { name: string; location: string };
}

export interface Commission {
  id: string;
  agentShare: number;
  totalCommission: number;
  totalAgents: number;
  status: string;
  createdAt: string;
  triggerBooking?: { bookingRef: string; totalAmount: number; createdAt: string };
}

export interface DashboardStats {
  agent: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    assignedCounterId?: string;
    referralCode?: string;
  };
  counter?: { id: string; name: string; location?: string } | null;
  totalTicketsBought: number;
  totalTicketsRemaining: number;
  ticketsSold?: number;
  totalInvested: number;
  referredCount?: number;
  referralEarnings?: number;
  commissionStats: {
    totalEarned: number;
    commissionCap: number;
    remainingCapacity: number;
    capReached: boolean;
    recentCommissions: Commission[];
  };
  bulkOrders: BulkOrder[];
}

export interface Counter {
  id: string;
  name: string;
  location?: string;
  phone?: string;
}

export interface AllowedRoute {
  id: string;
  origin: string;
  destination: string;
}

export interface AgentKycStatus {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  kycStatus: 'NOT_SUBMITTED' | 'PENDING' | 'VERIFIED' | 'REJECTED';
  nidNumber?: string;
  nidFrontDocUrl?: string;
  nidBackDocUrl?: string;
  kycSubmittedAt?: string;
  kycVerifiedAt?: string;
  kycRejectReason?: string;
  counter?: { name: string; location: string };
}

export const counterAgentApi = {
  async getDashboardStats(): Promise<DashboardStats> {
    const res = await apiClient.get(`${BASE}/dashboard-stats`);
    return res.data?.data ?? res.data;
  },

  async buyBulkTickets(payload: {
    routeId: string;
    quantity: number;
    paymentMethod?: string;
    senderPhone?: string;
    trxId?: string;
    paymentNotes?: string;
  }): Promise<BulkOrder> {
    const res = await apiClient.post(`${BASE}/buy-bulk`, payload);
    return res.data?.data ?? res.data;
  },

  async assignCounter(counterId: string): Promise<{ message: string; counterId: string }> {
    const res = await apiClient.post(`${BASE}/assign-counter`, { counterId });
    return res.data?.data ?? res.data;
  },

  async getBulkOrders(): Promise<BulkOrder[]> {
    const res = await apiClient.get(`${BASE}/bulk-orders`);
    return res.data?.data ?? res.data;
  },

  async getCommissions(): Promise<Commission[]> {
    const res = await apiClient.get(`${BASE}/commissions`);
    return res.data?.data ?? res.data;
  },

  async getCounters(): Promise<Counter[]> {
    const res = await apiClient.get(`${BASE}/counters`);
    return res.data?.data ?? res.data;
  },

  async getAllowedRoutes(): Promise<AllowedRoute[]> {
    const res = await apiClient.get(`${BASE}/allowed-routes`);
    return res.data?.data ?? res.data;
  },

  async submitKyc(payload: {
    nidNumber: string;
    nidFrontDocUrl: string;
    nidBackDocUrl: string;
  }): Promise<AgentKycStatus> {
    const res = await apiClient.post(`${BASE}/kyc/submit`, payload);
    return res.data?.data ?? res.data;
  },

  async getKycStatus(): Promise<AgentKycStatus> {
    const res = await apiClient.get(`${BASE}/kyc/status`);
    return res.data?.data ?? res.data;
  },

  async getAdminKycRequests(): Promise<AgentKycStatus[]> {
    const res = await apiClient.get(`${BASE}/admin/kyc/requests`);
    return res.data?.data ?? res.data;
  },

  async approveKyc(agentId: string): Promise<AgentKycStatus> {
    const res = await apiClient.post(`${BASE}/admin/kyc/${agentId}/approve`);
    return res.data?.data ?? res.data;
  },

  async rejectKyc(agentId: string, reason?: string): Promise<AgentKycStatus> {
    const res = await apiClient.post(`${BASE}/admin/kyc/${agentId}/reject`, { reason });
    return res.data?.data ?? res.data;
  },

  async getAdminBulkOrders(): Promise<BulkOrder[]> {
    const res = await apiClient.get(`${BASE}/admin/bulk-orders`);
    return res.data?.data ?? res.data;
  },

  async approveBulkOrder(id: string): Promise<{ message: string }> {
    const res = await apiClient.post(`${BASE}/admin/bulk-orders/${id}/approve`);
    return res.data?.data ?? res.data;
  },

  async rejectBulkOrder(id: string, reason?: string): Promise<{ message: string }> {
    const res = await apiClient.post(`${BASE}/admin/bulk-orders/${id}/reject`, { reason });
    return res.data?.data ?? res.data;
  },

  async sellTicket(dto: {
    scheduleId: string;
    seatNumbers: string[];
    passengerName: string;
    passengerPhone: string;
    passengerEmail?: string;
    gender?: string;
  }): Promise<{ success: boolean; message: string; bookingRef: string; bookingId: string; remainingBulkQuantity: number }> {
    const res = await apiClient.post(`${BASE}/sell-ticket`, dto);
    return res.data?.data ?? res.data;
  },

  async getMySoldTickets(): Promise<any[]> {
    const res = await apiClient.get(`${BASE}/sold-tickets`);
    return res.data?.data ?? res.data ?? [];
  },
};
