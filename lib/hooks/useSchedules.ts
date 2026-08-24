import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { searchSchedules, getSchedule, getScheduleSeats, type SearchScheduleParams } from '../api/schedules';
import { toast } from 'sonner';

export const scheduleKeys = {
  all: ['schedules'] as const,
  search: (params: SearchScheduleParams) => ['schedules', 'search', params] as const,
  detail: (id: string) => ['schedules', 'detail', id] as const,
  seats: (id: string) => ['schedules', 'seats', id] as const,
};

export function useSearchSchedules(params: SearchScheduleParams, enabled = true) {
  return useQuery({
    queryKey: scheduleKeys.search(params),
    queryFn: () => searchSchedules(params),
    enabled: enabled && !!params.from && !!params.to && !!params.date,
    staleTime: 30_000,
    refetchOnWindowFocus: false,
  });
}

export function useSchedule(id: string) {
  return useQuery({
    queryKey: scheduleKeys.detail(id),
    queryFn: () => getSchedule(id),
    enabled: !!id,
    staleTime: 60_000,
  });
}

export function useScheduleSeats(scheduleId: string) {
  return useQuery({
    queryKey: scheduleKeys.seats(scheduleId),
    queryFn: () => getScheduleSeats(scheduleId),
    enabled: !!scheduleId,
    staleTime: 10_000,
    refetchInterval: 30_000, // Refresh every 30s for live seat availability
  });
}
