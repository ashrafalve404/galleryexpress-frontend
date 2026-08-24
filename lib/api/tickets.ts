import client from './client';

export interface Ticket {
  id: string;
  ticketNumber: string;
  qrToken: string;
  status: string;
  issuedAt: string;
  booking: {
    bookingRef: string;
    passengers: Array<{ name: string; phone: string; gender?: string }>;
    seats: Array<{ seatNumber: string; seatType: string }>;
    schedule: {
      departureTime: string;
      arrivalTime: string;
      coach: { name: string; registrationNo: string };
      route: {
        origin: string;
        destination: string;
        stops: Array<{ name: string }>;
      };
    };
    finalAmount: number;
    payment?: { provider: string; paidAt?: string };
  };
}

export async function getTicket(ticketNumber: string): Promise<Ticket> {
  const { data } = await client.get(`/api/v1/tickets/${ticketNumber}`);
  return data?.data || data;
}

export async function verifyTicket(ticketNumber: string): Promise<{ valid: boolean; message: string }> {
  const { data } = await client.get(`/api/v1/tickets/${ticketNumber}/verify`);
  return data?.data || data;
}

// Admin
export async function adminGetTickets(scheduleId?: string) {
  const { data } = await client.get('/api/v1/admin/tickets', {
    params: scheduleId ? { scheduleId } : undefined,
  });
  return data;
}
