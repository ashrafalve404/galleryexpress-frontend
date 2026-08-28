'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { agentGetKycDetails, agentSubmitKyc, type AgentKycDetails } from '@/lib/api/agent';
import {
  RiShieldCheckFill,
  RiFileList3Fill,
  RiBuilding2Fill,
  RiMapPin2Fill,
  RiIdCardFill,
  RiUpload2Fill,
  RiCheckDoubleLine,
  RiTimeLine,
  RiCloseCircleFill,
} from 'react-icons/ri';
import { HiExclamationCircle } from 'react-icons/hi';

export default function AgentVerificationPage() {
  const queryClient = useQueryClient();

  const [nidNumber, setNidNumber] = useState('');
  const [nidFrontDocUrl, setNidFrontDocUrl] = useState('');
  const [nidBackDocUrl, setNidBackDocUrl] = useState('');
  const [counterName, setCounterName] = useState('');
  const [counterAddress, setCounterAddress] = useState('');
  const [tradeLicenseNo, setTradeLicenseNo] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const { data: kycData, isLoading } = useQuery<AgentKycDetails>({
    queryKey: ['agent-kyc-details'],
    queryFn: agentGetKycDetails,
  });

  useEffect(() => {
    if (kycData) {
      if (kycData.nidNumber) setNidNumber(kycData.nidNumber);
      if (kycData.nidFrontDocUrl) setNidFrontDocUrl(kycData.nidFrontDocUrl);
      else if (kycData.nidDocUrl) setNidFrontDocUrl(kycData.nidDocUrl);
      if (kycData.nidBackDocUrl) setNidBackDocUrl(kycData.nidBackDocUrl);
      else if (kycData.nidDocUrl) setNidBackDocUrl(kycData.nidDocUrl);
      if (kycData.counterName) setCounterName(kycData.counterName);
      if (kycData.counterAddress) setCounterAddress(kycData.counterAddress);
      if (kycData.tradeLicenseNo) setTradeLicenseNo(kycData.tradeLicenseNo);
    }
  }, [kycData]);

  const mutation = useMutation({
    mutationFn: agentSubmitKyc,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agent-kyc-details'] });
      setSuccess('Your NID Front & Back photos and Counter details have been submitted for admin approval!');
      setError('');
    },
    onError: (err: any) => {
      setError(err?.response?.data?.message || 'Failed to submit KYC verification');
      setSuccess('');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!nidNumber.trim()) { setError('Please enter your NID Number'); return; }
    if (!nidFrontDocUrl.trim()) { setError('Please upload or provide photo link for NID FRONT part'); return; }
    if (!nidBackDocUrl.trim()) { setError('Please upload or provide photo link for NID BACK part'); return; }
    if (!counterName.trim()) { setError('Please enter your Counter Name'); return; }
    if (!counterAddress.trim()) { setError('Please enter your Counter Location / Address'); return; }

    mutation.mutate({
      nidNumber: nidNumber.trim(),
      nidFrontDocUrl: nidFrontDocUrl.trim(),
      nidBackDocUrl: nidBackDocUrl.trim(),
      nidDocUrl: nidFrontDocUrl.trim(),
      counterName: counterName.trim(),
      counterAddress: counterAddress.trim(),
      tradeLicenseNo: tradeLicenseNo.trim() || undefined,
    });
  };

  const handleFrontUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setNidFrontDocUrl(URL.createObjectURL(file));
  };

  const handleBackUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setNidBackDocUrl(URL.createObjectURL(file));
  };

  if (isLoading) {
    return <div className="text-xs text-gray-400 font-semibold py-10 text-center">Loading KYC verification profile...</div>;
  }

  const kycStatus = kycData?.kycStatus || 'NOT_SUBMITTED';

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Page Title & Status Overview */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-[#111111]">Agent Account KYC Verification</h1>
          <p className="text-xs text-gray-500 font-semibold mt-1">
            Submit your National ID (NID) and bus counter details to verify your agent account.
          </p>
        </div>

        {/* Status Badge */}
        <div>
          {kycStatus === 'VERIFIED' && (
            <div className="inline-flex items-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-2 rounded-2xl text-xs font-black">
              <RiShieldCheckFill size={18} className="text-emerald-600" />
              <span>ACCOUNT VERIFIED</span>
            </div>
          )}
          {kycStatus === 'PENDING' && (
            <div className="inline-flex items-center gap-2 bg-amber-50 border border-amber-200 text-amber-700 px-4 py-2 rounded-2xl text-xs font-black">
              <RiTimeLine size={18} className="text-amber-600" />
              <span>VERIFICATION PENDING</span>
            </div>
          )}
          {kycStatus === 'REJECTED' && (
            <div className="inline-flex items-center gap-2 bg-rose-50 border border-rose-200 text-rose-700 px-4 py-2 rounded-2xl text-xs font-black">
              <RiCloseCircleFill size={18} className="text-rose-600" />
              <span>REJECTED — RESUBMIT</span>
            </div>
          )}
          {kycStatus === 'NOT_SUBMITTED' && (
            <div className="inline-flex items-center gap-2 bg-gray-100 border border-gray-200 text-gray-700 px-4 py-2 rounded-2xl text-xs font-black">
              <HiExclamationCircle size={18} className="text-gray-500" />
              <span>KYC NOT SUBMITTED</span>
            </div>
          )}
        </div>
      </div>

      {/* Verification Status Alert Cards */}
      {kycStatus === 'VERIFIED' && (
        <div className="bg-emerald-50/70 border border-emerald-200 rounded-3xl p-5 flex items-start gap-3.5">
          <RiShieldCheckFill size={24} className="text-emerald-600 shrink-0 mt-0.5" />
          <div className="text-xs space-y-1">
            <div className="font-black text-emerald-900 text-sm">Verified Counter Agent Account</div>
            <p className="text-emerald-700 font-medium">
              Your NID and counter credentials have been verified by Gallery Express administration. You have full authorized access to purchase bulk ticket quotas and issue passenger tickets.
            </p>
          </div>
        </div>
      )}

      {kycStatus === 'PENDING' && (
        <div className="bg-amber-50/80 border border-amber-200 rounded-3xl p-5 flex items-start gap-3.5">
          <RiTimeLine size={24} className="text-amber-600 shrink-0 mt-0.5" />
          <div className="text-xs space-y-1">
            <div className="font-black text-amber-900 text-sm">Verification Under Admin Review</div>
            <p className="text-amber-700 font-medium">
              Your KYC document submission is currently under review by our admin team. You will receive official verification confirmation shortly.
            </p>
          </div>
        </div>
      )}

      {kycStatus === 'REJECTED' && (
        <div className="bg-rose-50/80 border border-rose-200 rounded-3xl p-5 flex items-start gap-3.5">
          <RiCloseCircleFill size={24} className="text-rose-600 shrink-0 mt-0.5" />
          <div className="text-xs space-y-1">
            <div className="font-black text-rose-900 text-sm">Verification Resubmission Required</div>
            <p className="text-rose-700 font-medium">
              Reason: {kycData?.kycRejectReason || 'Identification document was unclear. Please upload a clear photo of your NID.'}
            </p>
          </div>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2">
          <HiExclamationCircle size={18} className="shrink-0 text-[#E31B23]" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
          <RiCheckDoubleLine size={18} className="shrink-0 text-emerald-600" />
          <span>{success}</span>
        </div>
      )}

      {/* KYC Form */}
      <form onSubmit={handleSubmit} className="bg-white rounded-3xl border border-gray-100 p-6 sm:p-8 shadow-xs space-y-6">
        {/* Section 1: Counter Details */}
        <div className="space-y-4 pb-6 border-b border-gray-100">
          <h2 className="text-sm font-black text-[#111111] flex items-center gap-2">
            <span className="w-6 h-6 rounded-lg bg-[#E31B23] text-white text-xs flex items-center justify-center font-bold">1</span>
            Bus Counter Identification Details
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wide mb-1.5">
                Counter Name *
              </label>
              <div className="relative">
                <RiBuilding2Fill className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="text"
                  required
                  disabled={kycStatus === 'VERIFIED'}
                  value={counterName}
                  onChange={(e) => setCounterName(e.target.value)}
                  placeholder="e.g. ABC Travels - Sayedabad Counter"
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-[#111111] text-xs font-bold focus:outline-none focus:ring-2 focus:ring-[#E31B23]/20 focus:border-[#E31B23] disabled:opacity-75"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wide mb-1.5">
                Counter Location / Address *
              </label>
              <div className="relative">
                <RiMapPin2Fill className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="text"
                  required
                  disabled={kycStatus === 'VERIFIED'}
                  value={counterAddress}
                  onChange={(e) => setCounterAddress(e.target.value)}
                  placeholder="e.g. Gate 2, Sayedabad Bus Terminal, Dhaka"
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-[#111111] text-xs font-bold focus:outline-none focus:ring-2 focus:ring-[#E31B23]/20 focus:border-[#E31B23] disabled:opacity-75"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Section 2: Personal NID Verification */}
        <div className="space-y-4 pb-6 border-b border-gray-100">
          <h2 className="text-sm font-black text-[#111111] flex items-center gap-2">
            <span className="w-6 h-6 rounded-lg bg-[#E31B23] text-white text-xs flex items-center justify-center font-bold">2</span>
            National ID (NID) & License
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wide mb-1.5">
                NID Number *
              </label>
              <div className="relative">
                <RiIdCardFill className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="text"
                  required
                  disabled={kycStatus === 'VERIFIED'}
                  value={nidNumber}
                  onChange={(e) => setNidNumber(e.target.value)}
                  placeholder="e.g. 1992159283921"
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-[#111111] text-xs font-bold focus:outline-none focus:ring-2 focus:ring-[#E31B23]/20 focus:border-[#E31B23] disabled:opacity-75"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wide mb-1.5">
                Trade License No. (Optional)
              </label>
              <div className="relative">
                <RiFileList3Fill className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="text"
                  disabled={kycStatus === 'VERIFIED'}
                  value={tradeLicenseNo}
                  onChange={(e) => setTradeLicenseNo(e.target.value)}
                  placeholder="e.g. TRD-2024-8891"
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-[#111111] text-xs font-bold focus:outline-none focus:ring-2 focus:ring-[#E31B23]/20 focus:border-[#E31B23] disabled:opacity-75"
                />
              </div>
            </div>
          </div>

          {/* 2 NID Image Upload Boxes: Front & Back */}
          <div className="space-y-3">
            <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wide">
              National ID (NID) Both Sides Documentation (2 Images Required) *
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* 1. NID Front Part */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-[#111111] flex items-center gap-1.5">
                  <span className="w-4 h-4 rounded-full bg-[#E31B23] text-white text-[10px] flex items-center justify-center font-black">A</span>
                  NID Front Side Photo *
                </span>

                {kycStatus !== 'VERIFIED' && (
                  <div className="border-2 border-dashed border-gray-200 rounded-2xl p-4 bg-gray-50 text-center space-y-2 hover:border-[#E31B23] transition-colors">
                    <RiUpload2Fill className="mx-auto text-gray-400" size={24} />
                    <div className="text-[11px] font-bold text-gray-700">Select NID Front Image</div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFrontUpload}
                      className="hidden"
                      id="nid-front-input"
                    />
                    <label
                      htmlFor="nid-front-input"
                      className="inline-block bg-white border border-gray-200 px-3 py-1 rounded-xl text-[11px] font-bold text-gray-700 cursor-pointer hover:bg-gray-100"
                    >
                      Browse Front Image
                    </label>
                  </div>
                )}

                <input
                  type="text"
                  required
                  disabled={kycStatus === 'VERIFIED'}
                  value={nidFrontDocUrl}
                  onChange={(e) => setNidFrontDocUrl(e.target.value)}
                  placeholder="Or Front Image Link (https://.../front.jpg)"
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-[#111111] text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#E31B23]/20 focus:border-[#E31B23] disabled:opacity-75"
                />

                {nidFrontDocUrl && (
                  <div className="p-2.5 bg-gray-50 border border-gray-200 rounded-2xl flex items-center gap-3">
                    <img
                      src={nidFrontDocUrl}
                      alt="NID Front Preview"
                      className="w-16 h-12 object-cover rounded-lg border border-gray-300"
                      onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }}
                    />
                    <div className="text-[10px] text-gray-500 font-bold truncate">
                      NID Front Preview
                    </div>
                  </div>
                )}
              </div>

              {/* 2. NID Back Part */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-[#111111] flex items-center gap-1.5">
                  <span className="w-4 h-4 rounded-full bg-[#E31B23] text-white text-[10px] flex items-center justify-center font-black">B</span>
                  NID Back Side Photo *
                </span>

                {kycStatus !== 'VERIFIED' && (
                  <div className="border-2 border-dashed border-gray-200 rounded-2xl p-4 bg-gray-50 text-center space-y-2 hover:border-[#E31B23] transition-colors">
                    <RiUpload2Fill className="mx-auto text-gray-400" size={24} />
                    <div className="text-[11px] font-bold text-gray-700">Select NID Back Image</div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleBackUpload}
                      className="hidden"
                      id="nid-back-input"
                    />
                    <label
                      htmlFor="nid-back-input"
                      className="inline-block bg-white border border-gray-200 px-3 py-1 rounded-xl text-[11px] font-bold text-gray-700 cursor-pointer hover:bg-gray-100"
                    >
                      Browse Back Image
                    </label>
                  </div>
                )}

                <input
                  type="text"
                  required
                  disabled={kycStatus === 'VERIFIED'}
                  value={nidBackDocUrl}
                  onChange={(e) => setNidBackDocUrl(e.target.value)}
                  placeholder="Or Back Image Link (https://.../back.jpg)"
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-[#111111] text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#E31B23]/20 focus:border-[#E31B23] disabled:opacity-75"
                />

                {nidBackDocUrl && (
                  <div className="p-2.5 bg-gray-50 border border-gray-200 rounded-2xl flex items-center gap-3">
                    <img
                      src={nidBackDocUrl}
                      alt="NID Back Preview"
                      className="w-16 h-12 object-cover rounded-lg border border-gray-300"
                      onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }}
                    />
                    <div className="text-[10px] text-gray-500 font-bold truncate">
                      NID Back Preview
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        {kycStatus !== 'VERIFIED' && (
          <button
            type="submit"
            disabled={mutation.isPending}
            className="w-full bg-[#E31B23] hover:bg-[#C41920] text-white font-black py-3.5 rounded-xl transition-all text-sm flex items-center justify-center gap-2 disabled:opacity-50 active:scale-[0.99]"
          >
            <RiShieldCheckFill size={18} />
            {mutation.isPending
              ? 'Submitting Verification...'
              : kycStatus === 'PENDING'
              ? 'Update KYC Submission'
              : 'Submit Verification for Admin Approval'}
          </button>
        )}
      </form>
    </div>
  );
}
