import client, { withCompany } from './client';

export interface OfferItem {
  id: string;
  title: string;
  subtitle?: string;
  tag?: string;
  imageUrl: string;
  ctaText?: string;
  ctaUrl?: string;
  discountCode?: string;
  orderIndex: number;
  status: 'ACTIVE' | 'INACTIVE';
  createdAt?: string;
  updatedAt?: string;
}

export async function getPublicOffers(): Promise<OfferItem[]> {
  try {
    const { data } = await client.get('/api/v1/offers', { params: withCompany() });
    return data?.data || (Array.isArray(data) ? data : []);
  } catch (error) {
    console.warn('Failed to fetch public offers:', error);
    return [];
  }
}

export async function adminGetOffers(): Promise<OfferItem[]> {
  const { data } = await client.get('/api/v1/admin/offers');
  return data?.data || (Array.isArray(data) ? data : []);
}

export async function adminCreateOffer(dto: Partial<OfferItem>): Promise<OfferItem> {
  const { data } = await client.post('/api/v1/admin/offers', dto);
  return data?.data || data;
}

export async function adminUpdateOffer(id: string, dto: Partial<OfferItem>): Promise<OfferItem> {
  const { data } = await client.patch(`/api/v1/admin/offers/${id}`, dto);
  return data?.data || data;
}

export async function adminDeleteOffer(id: string): Promise<{ message: string }> {
  const { data } = await client.delete(`/api/v1/admin/offers/${id}`);
  return data;
}
