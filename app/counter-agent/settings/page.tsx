'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  RiSettings4Fill,
  RiPrinterFill,
  RiNotification3Fill,
  RiShieldCheckFill,
  RiSaveFill,
  RiCheckFill,
  RiArrowLeftLine,
} from 'react-icons/ri';
import { toast } from 'sonner';

export default function CounterAgentSettingsPage() {
  const [paperFormat, setPaperFormat] = useState<'thermal' | 'a4'>('thermal');
  const [autoPrint, setAutoPrint] = useState(true);
  const [soundAlerts, setSoundAlerts] = useState(true);
  const [smsReceipts, setSmsReceipts] = useState(true);

  const handleSave = () => {
    toast.success('Agent Portal settings updated successfully!');
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-8 font-sans">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex justify-end">
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-[#E31B23] hover:bg-[#c9121a] text-white font-extrabold text-xs rounded-xl shadow-md flex items-center gap-1.5 active:scale-95"
          >
            <RiSaveFill size={16} /> Save Settings
          </button>
        </div>

        {/* Title */}
        <div className="bg-white p-6 rounded-3xl border border-gray-200/80 shadow-xs">
          <h1 className="text-2xl font-black text-gray-900">Portal Settings</h1>
          <p className="text-xs text-gray-500 mt-1">Configure ticket printing formats, notification alerts, and counter system preferences.</p>
        </div>

        {/* Settings Sections */}
        <div className="space-y-6">
          {/* Printing Options */}
          <div className="bg-white rounded-3xl border border-gray-200/80 p-6 shadow-xs space-y-4">
            <h2 className="text-base font-black text-gray-900 border-b border-gray-100 pb-3 flex items-center gap-2">
              <RiPrinterFill size={20} className="text-[#E31B23]" /> Ticket Printing Preferences
            </h2>

            <div className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-gray-800 block mb-2">Default Printer Paper Size</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setPaperFormat('thermal')}
                    className={`p-4 rounded-2xl border text-left flex items-center justify-between transition-all ${
                      paperFormat === 'thermal'
                        ? 'border-[#E31B23] bg-red-50/50 text-[#E31B23] font-bold'
                        : 'border-gray-200 bg-white text-gray-700 font-medium hover:border-gray-300'
                    }`}
                  >
                    <div>
                      <div className="text-xs font-black">Thermal Slip (80mm POS)</div>
                      <div className="text-[10px] text-gray-500 font-normal">Compact receipt format for counter thermal printers</div>
                    </div>
                    {paperFormat === 'thermal' && <RiCheckFill size={18} className="text-[#E31B23]" />}
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaperFormat('a4')}
                    className={`p-4 rounded-2xl border text-left flex items-center justify-between transition-all ${
                      paperFormat === 'a4'
                        ? 'border-[#E31B23] bg-red-50/50 text-[#E31B23] font-bold'
                        : 'border-gray-200 bg-white text-gray-700 font-medium hover:border-gray-300'
                    }`}
                  >
                    <div>
                      <div className="text-xs font-black">Standard Boarding Pass (A4/Card)</div>
                      <div className="text-[10px] text-gray-500 font-normal">Full boarding pass layout with passenger QR code</div>
                    </div>
                    {paperFormat === 'a4' && <RiCheckFill size={18} className="text-[#E31B23]" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between py-2 border-t border-gray-100">
                <div>
                  <div className="font-bold text-gray-900">Auto-Trigger Print Dialog</div>
                  <div className="text-gray-500 text-[11px]">Automatically open browser print popup right after issuing a ticket</div>
                </div>
                <input
                  type="checkbox"
                  checked={autoPrint}
                  onChange={(e) => setAutoPrint(e.target.checked)}
                  className="w-4 h-4 accent-[#E31B23] rounded"
                />
              </div>
            </div>
          </div>

          {/* Notifications */}
          <div className="bg-white rounded-3xl border border-gray-200/80 p-6 shadow-xs space-y-4">
            <h2 className="text-base font-black text-gray-900 border-b border-gray-100 pb-3 flex items-center gap-2">
              <RiNotification3Fill size={20} className="text-[#E31B23]" /> Notifications &amp; Alerts
            </h2>

            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between py-1">
                <div>
                  <div className="font-bold text-gray-900">Play Sound on Sale Confirmation</div>
                  <div className="text-gray-500 text-[11px]">Play audio alert when a passenger ticket is successfully issued</div>
                </div>
                <input
                  type="checkbox"
                  checked={soundAlerts}
                  onChange={(e) => setSoundAlerts(e.target.checked)}
                  className="w-4 h-4 accent-[#E31B23] rounded"
                />
              </div>

              <div className="flex items-center justify-between py-1 border-t border-gray-100 pt-3">
                <div>
                  <div className="font-bold text-gray-900">Send Passenger SMS Ticket Link</div>
                  <div className="text-gray-500 text-[11px]">Send automatic SMS with digital ticket URL to passenger mobile</div>
                </div>
                <input
                  type="checkbox"
                  checked={smsReceipts}
                  onChange={(e) => setSmsReceipts(e.target.checked)}
                  className="w-4 h-4 accent-[#E31B23] rounded"
                />
              </div>
            </div>
          </div>

          {/* Identity & KYC Verification Link */}
          <div className="bg-white rounded-3xl border border-gray-200/80 p-6 shadow-xs flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-red-50 text-[#E31B23] flex items-center justify-center font-bold shrink-0">
                <RiShieldCheckFill size={22} />
              </div>
              <div>
                <div className="text-xs font-black text-gray-900">Identity &amp; KYC Verification</div>
                <div className="text-[11px] text-gray-500">Upload NID documents to unlock higher bulk ticket package limits</div>
              </div>
            </div>
            <Link
              href="/counter-agent/kyc"
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-bold rounded-xl transition-colors shrink-0"
            >
              Manage KYC
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
