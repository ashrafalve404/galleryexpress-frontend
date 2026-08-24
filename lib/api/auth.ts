import client from './client';

export interface LoginDto {
  email: string;
  password: string;
  companyId?: string;
}

export interface RegisterDto {
  name: string;
  email: string;
  password: string;
  phone?: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
    companyId: string;
    phone?: string;
  };
}

export async function login(dto: LoginDto): Promise<AuthResponse> {
  const { data } = await client.post<AuthResponse>('/api/v1/auth/login', dto);
  return data;
}

export async function register(dto: RegisterDto): Promise<AuthResponse> {
  const { data } = await client.post<AuthResponse>('/api/v1/auth/register', dto);
  return data;
}

export async function logout(refreshToken?: string): Promise<void> {
  await client.post('/api/v1/auth/logout', { refreshToken });
}

export async function refreshTokens(refreshToken: string): Promise<AuthResponse> {
  const { data } = await client.post<AuthResponse>('/api/v1/auth/refresh', { refreshToken });
  return data;
}

export async function changePassword(currentPassword: string, newPassword: string): Promise<void> {
  await client.patch('/api/v1/auth/change-password', { currentPassword, newPassword });
}
