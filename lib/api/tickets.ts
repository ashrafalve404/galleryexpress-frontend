import client from './client';

export interface Ticket {
  id: string;
  ticketNumber: string;
  qrToken: string;
  status: string;
  issuedAt: string;
  passenger: {
    name: string;
    phone: string;
    gender?: string;
  };
  booking: {
    id: string;
    bookingRef: string;
    netAmount: string | number;
    paymentStatus: string;
    schedule: {
      departureTime: string;
      arrivalTime: string;
      departureDate: string;
      coach: {
        name: string;
        registrationNumber?: string;
        isAC?: boolean;
      };
      route: {
        origin: string;
        destination: string;
      };
    };
    bookingSeats: Array<{
      seat: {
        seatNumber: string;
        seatType: string;
      };
      passenger?: {
        name: string;
        phone: string;
        gender?: string;
      };
    }>;
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
