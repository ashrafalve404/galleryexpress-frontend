import client, { withCompany } from './client';

export interface Route {
  id: string;
  name: string;
  origin: string;
  destination: string;
  distanceKm: number;
  estimatedDurationMin: number;
  status: string;
  stops: Array<{
    id: string;
    name: string;
    distanceFromOriginKm: number;
    arrivalOffset: number;
  }>;
}

export async function getRoutes(origin?: string, destination?: string): Promise<Route[]> {
  const { data } = await client.get('/api/v1/routes', {
    params: withCompany({ origin, destination }),
  });
  return data?.data || data || [];
}

export async function getRoute(id: string): Promise<Route> {
  const { data } = await client.get(`/api/v1/routes/${id}`, {
    params: withCompany(),
  });
  return data?.data || data;
}

// Admin
export async function adminGetRoutes(query?: Record<string, unknown>) {
  const { data } = await client.get('/api/v1/admin/routes', { params: query });
  return data;
}

export async function adminCreateRoute(dto: Record<string, unknown>) {
  const { data } = await client.post('/api/v1/admin/routes', dto);
  return data;
}

export async function adminUpdateRoute(id: string, dto: Record<string, unknown>) {
  const { data } = await client.patch(`/api/v1/admin/routes/${id}`, dto);
  return data;
}

export async function adminDeleteRoute(id: string) {
  const { data } = await client.delete(`/api/v1/admin/routes/${id}`);
  return data;
}

export async function adminAddStop(routeId: string, dto: Record<string, unknown>) {
  const { data } = await client.post(`/api/v1/admin/routes/${routeId}/stops`, dto);
  return data;
}
