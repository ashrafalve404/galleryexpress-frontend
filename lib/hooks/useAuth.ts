import { useMutation } from '@tanstack/react-query';
import { login, register, sendRegisterOtp, logout, type LoginDto, type RegisterDto } from '../api/auth';
import { useAuthStore } from '../store/authStore';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { ROUTES } from '../utils/constants';

export function useSendOtp() {
  return useMutation({
    mutationFn: (phone: string) => sendRegisterOtp(phone),
    onSuccess: (data) => {
      toast.success(data?.message || 'OTP code sent to your mobile phone!');
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || err?.message || 'Failed to send OTP code.');
    },
  });
}

export function useLogin() {
  const setAuth = useAuthStore((s) => s.setAuth);
  const router = useRouter();

  return useMutation({
    mutationFn: (dto: LoginDto) => login(dto),
    onSuccess: (data) => {
      if (!data || !data.user) {
        toast.error('Authentication response missing user data.');
        return;
      }
      setAuth(data.user, data.accessToken, data.refreshToken);
      toast.success(`Welcome back, ${data.user.name || 'User'}!`);

      // Redirect admins to admin panel, counter agents to agent dashboard
      const isAdmin = ['SUPER_ADMIN', 'ADMIN', 'STAFF', 'COUNTER_MANAGER'].includes(
        data.user.role || ''
      );
      const isCounterAgent = data.user.role === 'COUNTER_AGENT';

      if (isAdmin) {
        router.push(ROUTES.ADMIN);
      } else if (isCounterAgent) {
        router.push('/counter-agent/dashboard');
      } else {
        router.push(ROUTES.HOME);
      }
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Invalid email or password.');
    },
  });
}

export function useRegister() {
  const setAuth = useAuthStore((s) => s.setAuth);
  const router = useRouter();

  return useMutation({
    mutationFn: (dto: RegisterDto) => register(dto),
    onSuccess: (data) => {
      if (!data || !data.user) {
        toast.error('Registration failed.');
        return;
      }
      setAuth(data.user, data.accessToken, data.refreshToken);
      toast.success('Account created successfully! Welcome to Ticket Dorkar.');
      router.push(ROUTES.HOME);
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Registration failed. Please try again.');
    },
  });
}

export function useLogout() {
  const { clearAuth, refreshToken } = useAuthStore();
  const router = useRouter();

  return () => {
    const doLogout = async () => {
      try {
        if (refreshToken) await logout(refreshToken);
      } catch {
        // Ignore errors
      } finally {
        clearAuth();
        router.push(ROUTES.HOME);
        toast.success('You have been logged out.');
      }
    };
    doLogout();
  };
}
