'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { agentGetBulkOrders, agentIssueTicket, type BulkOrder } from '@/lib/api/agent';
import { useSearchSchedules } from '@/lib/hooks/useSchedules';
import { getSchedule, getScheduleSeats, type Schedule, type Seat } from '@/lib/api/schedules';
import { today } from '@/lib/utils/date';
import { SeatMap } from '@/components/booking/SeatMap';
import { RiTicket2Fill, RiUser3Fill, RiPhoneFill, RiCalendarCheckFill, RiBusFill } from 'react-icons/ri';
import { HiExclamationCircle, HiCheckCircle } from 'react-icons/hi';

function IssueTicketContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const preSelectedQuotaId = searchParams.get('quotaId') || '';

  const [bulkOrderId, setBulkOrderId] = useState(preSelectedQuotaId);
  const [journeyDate, setJourneyDate] = useState(today());
  const [selectedScheduleId, setSelectedScheduleId] = useState('');
  const [selectedSeats, setSelectedSeats] = useState<Seat[]>([]);
  const [passengerName, setPassengerName] = useState('');
  const [passengerPhone, setPassengerPhone] = useState('');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');

  // 1. Fetch Agent's active quotas
  const { data: bulkOrders } = useQuery<BulkOrder[]>({
    queryKey: ['agent-bulk-orders'],
    queryFn: agentGetBulkOrders,
  });

  const selectedQuota = bulkOrders?.find((o) => o.id === bulkOrderId);

  // Set default quota if available
  useEffect(() => {
    if (!bulkOrderId && bulkOrders && bulkOrders.length > 0) {
      const activeQuota = bulkOrders.find((o) => o.remainingQuantity > 0);
      if (activeQuota) setBulkOrderId(activeQuota.id);
    }
  }, [bulkOrders, bulkOrderId]);

  // 2. Fetch available schedules for selected quota's route & date
  const { data: schedules, isLoading: schedulesLoading } = useSearchSchedules(
    {
      from: selectedQuota?.route?.origin || '',
      to: selectedQuota?.route?.destination || '',
      date: journeyDate,
    },
    !!(selectedQuota?.route?.origin && selectedQuota?.route?.destination && journeyDate)
  );

  // 3. Fetch coach seats for selected schedule
  const { data: scheduleSeats, isLoading: seatsLoading } = useQuery<Seat[]>({
    queryKey: ['schedule-seats', selectedScheduleId],
    queryFn: () => getScheduleSeats(selectedScheduleId),
    enabled: !!selectedScheduleId,
  });

  const issueMutation = useMutation({
    mutationFn: agentIssueTicket,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agent-stats'] });
      queryClient.invalidateQueries({ queryKey: ['agent-bulk-orders'] });
      router.push('/agent/issued-tickets');
    },
    onError: (err: any) => {
      setError(err?.response?.data?.message || 'Failed to issue ticket from bulk quota');
    },
  });

  const handleSeatToggle = (seat: Seat) => {
    if (!selectedQuota) return;
    const exists = selectedSeats.some((s) => s.id === seat.id);
    if (exists) {
      setSelectedSeats(selectedSeats.filter((s) => s.id !== seat.id));
    } else {
      if (selectedSeats.length >= selectedQuota.remainingQuantity) {
        setError(`Cannot select more than ${selectedQuota.remainingQuantity} seat(s). Your quota only has ${selectedQuota.remainingQuantity} ticket(s) remaining.`);
        return;
      }
      setError('');
      setSelectedSeats([...selectedSeats, seat]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!bulkOrderId) { setError('Please select an active bulk quota'); return; }
    if (!selectedScheduleId) { setError('Please select a bus schedule trip'); return; }
    if (selectedSeats.length === 0) { setError('Please select at least 1 coach seat from the map'); return; }
    if (!passengerName.trim()) { setError('Please enter passenger full name'); return; }
    if (!passengerPhone.trim()) { setError('Please enter passenger mobile number'); return; }

    issueMutation.mutate({
      bulkOrderId,
      scheduleId: selectedScheduleId,
      seatIds: selectedSeats.map((s) => s.id),
      passengerName: passengerName.trim(),
      passengerPhone: passengerPhone.trim(),
      notes: notes.trim(),
    });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-black text-[#111111]">Sell Passenger Ticket</h1>
        <p className="text-xs text-gray-500 font-semibold mt-1">
          Select travel date, pick bus seats on the map, and issue customer tickets easily.
        </p>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2">
          <HiExclamationCircle size={18} className="shrink-0 text-[#E31B23]" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Step 1: Quota & Date Selection */}
        <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-xs space-y-4">
          <h2 className="text-sm font-black text-[#111111] flex items-center gap-2">
            <span className="w-6 h-6 rounded-lg bg-[#E31B23] text-white text-xs flex items-center justify-center font-bold">1</span>
            Select Ticket Package & Travel Date
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wide mb-1.5">
                Select Ticket Package *
              </label>
              <select
                required
                value={bulkOrderId}
                onChange={(e) => {
                  setBulkOrderId(e.target.value);
                  setSelectedScheduleId('');
                  setSelectedSeats([]);
                }}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-[#111111] text-xs font-bold focus:outline-none focus:ring-2 focus:ring-[#E31B23]/20 focus:border-[#E31B23]"
              >
                <option value="">-- Select Ticket Package --</option>
                {bulkOrders?.map((o) => (
                  <option key={o.id} value={o.id} disabled={o.remainingQuantity === 0}>
                    {o.route?.origin} → {o.route?.destination} ({o.remainingQuantity} Left / {o.quantity} Total)
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wide mb-1.5">
                Travel Date *
              </label>
              <input
                type="date"
                required
                value={journeyDate}
                onChange={(e) => {
                  setJourneyDate(e.target.value);
                  setSelectedScheduleId('');
                  setSelectedSeats([]);
                }}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-[#111111] text-xs font-bold focus:outline-none focus:ring-2 focus:ring-[#E31B23]/20 focus:border-[#E31B23]"
              />
            </div>
          </div>

          {selectedQuota && (
            <div className="bg-red-50/60 border border-red-100 rounded-2xl p-3.5 flex items-center justify-between text-xs">
              <span className="font-bold text-gray-700">
                Route: <strong className="text-[#111111]">{selectedQuota.route?.origin} → {selectedQuota.route?.destination}</strong>
              </span>
              <span className="font-black text-[#E31B23]">
                {selectedQuota.remainingQuantity} Ticket(s) Left Available
              </span>
            </div>
          )}
        </div>

        {/* Step 2: Pick Schedule */}
        {selectedQuota && (
          <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-xs space-y-4">
            <h2 className="text-sm font-black text-[#111111] flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-[#E31B23] text-white text-xs flex items-center justify-center font-bold">2</span>
              Select Departure Schedule
            </h2>

            {schedulesLoading ? (
              <div className="text-xs text-gray-400 font-semibold py-4">Loading bus schedules...</div>
            ) : !schedules || schedules.length === 0 ? (
              <div className="p-4 bg-amber-50 border border-amber-100 rounded-2xl text-xs text-amber-700 font-semibold">
                No active bus schedules found for <strong>{selectedQuota.route?.origin} → {selectedQuota.route?.destination}</strong> on {journeyDate}. Try selecting another date.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {schedules.map((sch) => (
                  <div
                    key={sch.id}
                    onClick={() => {
                      setSelectedScheduleId(sch.id);
                      setSelectedSeats([]);
                    }}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                      selectedScheduleId === sch.id
                        ? 'border-[#E31B23] bg-red-50/40 ring-2 ring-[#E31B23]/20'
                        : 'border-gray-200 bg-gray-50 hover:bg-gray-100/80'
                    }`}
                  >
                    <div>
                      <div className="text-sm font-black text-[#111111] flex items-center gap-1.5">
                        <RiBusFill className="text-[#E31B23]" />
                        {sch.departureTime} Departure
                      </div>
                      <div className="text-[11px] text-gray-500 font-medium mt-0.5">
                        Coach: {sch.coach?.name || 'AC Executive'}
                      </div>
                    </div>
                    <span className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                      selectedScheduleId === sch.id ? 'border-[#E31B23] bg-[#E31B23] text-white' : 'border-gray-300'
                    }`}>
                      {selectedScheduleId === sch.id && <HiCheckCircle size={14} />}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Step 3: Interactive Seat Selection Map */}
        {selectedScheduleId && (
          <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-xs space-y-4">
            <h2 className="text-sm font-black text-[#111111] flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-[#E31B23] text-white text-xs flex items-center justify-center font-bold">3</span>
              Select Coach Seat(s)
            </h2>

            {seatsLoading ? (
              <div className="text-xs text-gray-400 font-semibold py-4">Loading coach seat map...</div>
            ) : (
              <SeatMap
                seats={scheduleSeats || []}
                selectedSeats={selectedSeats}
                onToggle={handleSeatToggle}
                maxSeats={selectedQuota?.remainingQuantity || 4}
              />
            )}
          </div>
        )}

        {/* Step 4: Passenger Info & Submit */}
        {selectedSeats.length > 0 && (
          <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-xs space-y-4">
            <h2 className="text-sm font-black text-[#111111] flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-[#E31B23] text-white text-xs flex items-center justify-center font-bold">4</span>
              Passenger Information
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wide mb-1.5">
                  Passenger Full Name *
                </label>
                <div className="relative">
                  <RiUser3Fill className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="text"
                    required
                    value={passengerName}
                    onChange={(e) => setPassengerName(e.target.value)}
                    placeholder="e.g. Tanvir Ahmed"
                    className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-[#111111] text-xs font-bold focus:outline-none focus:ring-2 focus:ring-[#E31B23]/20 focus:border-[#E31B23]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wide mb-1.5">
                  Passenger Mobile Number *
                </label>
                <div className="relative">
                  <RiPhoneFill className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="tel"
                    required
                    value={passengerPhone}
                    onChange={(e) => setPassengerPhone(e.target.value)}
                    placeholder="e.g. 01700000000"
                    className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-[#111111] text-xs font-bold focus:outline-none focus:ring-2 focus:ring-[#E31B23]/20 focus:border-[#E31B23]"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wide mb-1.5">
                Counter Agent Notes (Optional)
              </label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Walk-in passenger note"
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-[#111111] text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#E31B23]/20 focus:border-[#E31B23]"
              />
            </div>

            <button
              type="submit"
              disabled={issueMutation.isPending}
              className="w-full bg-[#E31B23] hover:bg-[#C41920] text-white font-black py-3.5 rounded-xl transition-all text-sm flex items-center justify-center gap-2 active:scale-[0.99] disabled:opacity-50"
            >
              <RiTicket2Fill size={18} />
              {issueMutation.isPending ? 'Selling Ticket...' : `Sell ${selectedSeats.length} Ticket(s) to Passenger`}
            </button>
          </div>
        )}
      </form>
    </div>
  );
}

export default function AgentIssueTicketPage() {
  return (
    <Suspense fallback={<div className="text-xs text-gray-400 font-semibold py-10 text-center">Loading ticket issuing portal...</div>}>
      <IssueTicketContent />
    </Suspense>
  );
}
