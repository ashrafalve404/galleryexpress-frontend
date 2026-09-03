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
  };
  counter?: { id: string; name: string; location?: string } | null;
  totalTicketsBought: number;
  totalTicketsRemaining: number;
  totalInvested: number;
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
};
