import client, { withCompany } from './client';

export async function getSliders() {
  const { data } = await client.get('/api/v1/sliders', { params: withCompany() });
  return data?.data || data || [];
}

export async function getCmsPage(slug: string) {
  const { data } = await client.get(`/api/v1/cms/${slug}`, { params: withCompany() });
  return data?.data || data;
}

// Admin
export async function adminGetSliders() {
  const { data } = await client.get('/api/v1/admin/sliders');
  return data;
}

export async function adminCreateSlider(dto: Record<string, unknown>) {
  const { data } = await client.post('/api/v1/admin/sliders', dto);
  return data;
}

export async function adminUpdateSlider(id: string, dto: Record<string, unknown>) {
  const { data } = await client.patch(`/api/v1/admin/sliders/${id}`, dto);
  return data;
}

export async function adminDeleteSlider(id: string) {
  const { data } = await client.delete(`/api/v1/admin/sliders/${id}`);
  return data;
}

export async function adminGetCmsPages() {
  const { data } = await client.get('/api/v1/admin/cms');
  return data;
}

export async function adminUpsertCmsPage(slug: string, dto: Record<string, unknown>) {
  const { data } = await client.put(`/api/v1/admin/cms/${slug}`, dto);
  return data;
}
