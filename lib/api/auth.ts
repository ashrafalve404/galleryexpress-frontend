import client from './client';

export interface LoginDto {
  phone?: string;
  email?: string;
  loginIdentifier?: string;
  password: string;
}

export interface RegisterDto {
  name: string;
  phone: string;
  email?: string;
  password: string;
  otp?: string;
}

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: string;
  companyId: string;
  firstName?: string;
  lastName?: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: AuthUser;
}

function normalizeUser(rawUser: Record<string, unknown> | undefined): AuthUser {
  if (!rawUser) {
    return {
      id: '',
      name: 'User',
      email: '',
      role: 'CUSTOMER',
      companyId: '',
    };
  }
  const firstName = rawUser.firstName as string | undefined;
  const lastName = rawUser.lastName as string | undefined;
  const rawName = rawUser.name as string | undefined;
  const email = (rawUser.email as string) || '';
  const phone = (rawUser.phone as string) || '';

  const computedName =
    rawName ||
    [firstName, lastName].filter(Boolean).join(' ') ||
    phone ||
    email ||
    'User';

  return {
    id: (rawUser.id as string) || '',
    name: computedName,
    email,
    phone,
    role: (rawUser.role as string) || 'CUSTOMER',
    companyId: (rawUser.companyId as string) || '',
    firstName,
    lastName,
  };
}

export async function login(dto: LoginDto): Promise<AuthResponse> {
  const { data } = await client.post('/api/v1/auth/login', {
    loginIdentifier: dto.loginIdentifier || dto.phone || dto.email,
    phone: dto.phone || dto.loginIdentifier,
    email: dto.email,
    password: dto.password,
  });

  const payload = data?.data || data;
  return {
    accessToken: payload?.accessToken || '',
    refreshToken: payload?.refreshToken || '',
    user: normalizeUser(payload?.user),
  };
}

export async function sendRegisterOtp(phone: string): Promise<{ success: boolean; message: string; phone: string }> {
  const { data } = await client.post('/api/v1/auth/register/send-otp', { phone });
  return data?.data || data;
}

export async function register(dto: RegisterDto): Promise<AuthResponse> {
  const parts = dto.name.trim().split(' ');
  const firstName = parts[0] || dto.name;
  const lastName = parts.slice(1).join(' ') || '';

  const { data } = await client.post('/api/v1/auth/register', {
    phone: dto.phone,
    email: dto.email || undefined,
    password: dto.password,
    otp: dto.otp,
    firstName,
    lastName,
  });

  const payload = data?.data || data;
  return {
    accessToken: payload?.accessToken || '',
    refreshToken: payload?.refreshToken || '',
    user: normalizeUser(payload?.user),
  };
}

export async function logout(refreshToken?: string): Promise<void> {
  await client.post('/api/v1/auth/logout', { refreshToken });
}

export async function refreshTokens(refreshToken: string): Promise<AuthResponse> {
  const { data } = await client.post('/api/v1/auth/refresh', { refreshToken });
  const payload = data?.data || data;
  return {
    accessToken: payload?.accessToken || '',
    refreshToken: payload?.refreshToken || '',
    user: normalizeUser(payload?.user),
  };
}

export async function changePassword(currentPassword: string, newPassword: string): Promise<void> {
  await client.patch('/api/v1/auth/change-password', { currentPassword, newPassword });
}
