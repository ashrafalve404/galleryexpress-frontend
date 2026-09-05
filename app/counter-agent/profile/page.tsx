'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/lib/store/authStore';
import Link from 'next/link';
import {
  RiUser3Fill,
  RiShieldCheckFill,
  RiMailFill,
  RiPhoneFill,
  RiBuildingFill,
  RiArrowLeftLine,
  RiCheckboxCircleFill,
  RiTimeFill,
  RiErrorWarningFill,
  RiUploadCloud2Fill,
  RiArrowRightSLine,
} from 'react-icons/ri';
import { counterAgentApi, type AgentKycStatus } from '@/lib/api/counterAgent';

export default function CounterAgentProfilePage() {
  const { user } = useAuthStore();
  const [kycStatus, setKycStatus] = useState<AgentKycStatus | null>(null);
  const [loadingKyc, setLoadingKyc] = useState(true);

  useEffect(() => {
    async function loadKyc() {
      try {
        const data = await counterAgentApi.getKycStatus();
        setKycStatus(data);
      } catch (e) {
        console.error('Failed to load KYC in profile:', e);
      } finally {
        setLoadingKyc(false);
      }
    }
    loadKyc();
  }, []);

  const kycState = kycStatus?.kycStatus || 'NOT_SUBMITTED';

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-8 font-sans">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex justify-end">
          <Link
            href="/counter-agent/kyc"
            className="inline-flex items-center gap-1.5 text-xs font-black text-[#E31B23] bg-red-50 hover:bg-red-100 px-3.5 py-2 rounded-xl border border-red-100 shadow-2xs"
          >
            <RiShieldCheckFill size={16} /> KYC Verification Center
          </Link>
        </div>

        {/* Profile Banner Card */}
        <div className="bg-white rounded-3xl border border-gray-200/80 p-6 sm:p-8 shadow-xs relative overflow-hidden">
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <div className="w-20 h-20 rounded-2xl bg-[#E31B23] text-white flex items-center justify-center font-black text-3xl shadow-lg shrink-0">
              {user?.name?.[0]?.toUpperCase() || 'A'}
            </div>

            <div className="text-center sm:text-left flex-1 min-w-0 space-y-1">
              <div className="flex items-center justify-center sm:justify-start gap-2 flex-wrap">
                <h1 className="text-2xl font-black text-gray-900">{user?.name || 'Counter Agent'}</h1>
                {kycState === 'VERIFIED' ? (
                  <span className="bg-emerald-100 text-emerald-800 text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full flex items-center gap-1">
                    <RiCheckboxCircleFill size={14} /> Verified Agent
                  </span>
                ) : kycState === 'PENDING' ? (
                  <span className="bg-amber-100 text-amber-800 text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full flex items-center gap-1">
                    <RiTimeFill size={14} /> KYC Pending
                  </span>
                ) : (
                  <span className="bg-rose-100 text-rose-800 text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full flex items-center gap-1">
                    <RiErrorWarningFill size={14} /> KYC Required
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-500 font-medium">Official Intercity Ticket Selling Partner · Ticket Dorkar</p>
              <div className="text-xs font-mono text-gray-400 font-semibold pt-1">
                Agent ID: <span className="text-gray-800 font-bold">{user?.id?.substring(0, 8) || 'AGT-8492'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* KYC Verification Card inside Profile */}
        <div className="bg-white rounded-3xl border border-gray-200/80 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
            <h2 className="text-base font-black text-gray-900 flex items-center gap-2">
              <RiShieldCheckFill size={20} className="text-[#E31B23]" /> Identity &amp; NID Verification (KYC)
            </h2>
            <Link
              href="/counter-agent/kyc"
              className="text-xs font-bold text-[#E31B23] hover:underline flex items-center gap-1"
            >
              Open Form <RiArrowRightSLine size={16} />
            </Link>
          </div>

          <div className="bg-gray-50 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="space-y-1 text-center sm:text-left">
              <div className="text-xs font-black text-gray-900 flex items-center justify-center sm:justify-start gap-2">
                Status:
                {kycState === 'VERIFIED' ? (
                  <span className="text-emerald-700 font-bold">Approved &amp; Fully Verified</span>
                ) : kycState === 'PENDING' ? (
                  <span className="text-amber-700 font-bold">Documents Submitted (Under Review)</span>
                ) : kycState === 'REJECTED' ? (
                  <span className="text-rose-700 font-bold">Rejected ({kycStatus?.kycRejectReason || 'Please resubmit NID'})</span>
                ) : (
                  <span className="text-gray-600 font-bold">NID Documents Not Submitted</span>
                )}
              </div>
              <p className="text-[11px] text-gray-500">
                {kycStatus?.nidNumber ? `Submitted NID: ${kycStatus.nidNumber}` : 'Government NID document upload is required for high bulk ticket limits.'}
              </p>
            </div>

            <Link
              href="/counter-agent/kyc"
              className="w-full sm:w-auto px-4 py-2.5 bg-[#E31B23] hover:bg-[#c9121a] text-white text-xs font-bold rounded-xl shadow-xs flex items-center justify-center gap-1.5 transition-all shrink-0 active:scale-95"
            >
              <RiUploadCloud2Fill size={16} />
              <span>{kycState === 'VERIFIED' ? 'View KYC Specs' : 'Submit NID Documents'}</span>
            </Link>
          </div>
        </div>

        {/* Personal Details & Counter Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-3xl border border-gray-200/80 p-6 shadow-xs space-y-4">
            <h2 className="text-base font-black text-gray-900 border-b border-gray-100 pb-3 flex items-center gap-2">
              <RiUser3Fill size={20} className="text-[#E31B23]" /> Personal Information
            </h2>

            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between py-1 border-b border-gray-50">
                <span className="text-gray-500 font-medium flex items-center gap-2">
                  <RiMailFill size={16} className="text-gray-400" /> Email Address
                </span>
                <span className="font-bold text-gray-900">{user?.email || 'agent@ticketdorkar.xyz'}</span>
              </div>

              <div className="flex items-center justify-between py-1 border-b border-gray-50">
                <span className="text-gray-500 font-medium flex items-center gap-2">
                  <RiPhoneFill size={16} className="text-gray-400" /> Phone Number
                </span>
                <span className="font-bold text-gray-900">{user?.phone || '+880 1700 000000'}</span>
              </div>

              <div className="flex items-center justify-between py-1 border-b border-gray-50">
                <span className="text-gray-500 font-medium flex items-center gap-2">
                  <RiShieldCheckFill size={16} className="text-gray-400" /> Account Role
                </span>
                <span className="font-bold text-[#E31B23] uppercase">{user?.role || 'COUNTER_AGENT'}</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-3xl border border-gray-200/80 p-6 shadow-xs space-y-4">
            <h2 className="text-base font-black text-gray-900 border-b border-gray-100 pb-3 flex items-center gap-2">
              <RiBuildingFill size={20} className="text-[#E31B23]" /> Assigned Counter
            </h2>

            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between py-1 border-b border-gray-50">
                <span className="text-gray-500 font-medium">Current Counter</span>
                <span className="font-bold text-gray-900">Gabtoli Express Counter 01</span>
              </div>

              <div className="flex items-center justify-between py-1 border-b border-gray-50">
                <span className="text-gray-500 font-medium">Location</span>
                <span className="font-bold text-gray-900">Dhaka North</span>
              </div>

              <div className="pt-2">
                <Link
                  href="/counter-agent/select-counter"
                  className="w-full inline-flex items-center justify-center gap-1.5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold text-xs rounded-xl transition-colors"
                >
                  Switch Counter Location
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
