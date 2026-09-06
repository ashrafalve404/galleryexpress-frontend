'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  RiShieldCheckFill,
  RiUploadCloud2Fill,
  RiTimeFill,
  RiCheckboxCircleFill,
  RiCloseCircleFill,
  RiArrowRightSLine,
  RiInformationFill,
} from 'react-icons/ri';
import { Loader2 } from 'lucide-react';
import { BsFillTicketPerforatedFill } from 'react-icons/bs';
import { counterAgentApi, type AgentKycStatus } from '@/lib/api/counterAgent';
import { toast } from 'sonner';
import { useLanguageStore } from '@/lib/store/languageStore';

export default function AgentKycPage() {
  const { lang } = useLanguageStore();
  const [status, setStatus] = useState<AgentKycStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [nidNumber, setNidNumber] = useState('');
  const [nidFrontUrl, setNidFrontUrl] = useState('');
  const [nidBackUrl, setNidBackUrl] = useState('');

  const fetchKycStatus = async () => {
    try {
      const data = await counterAgentApi.getKycStatus();
      setStatus(data);
      if (data?.nidNumber) setNidNumber(data.nidNumber);
      if (data?.nidFrontDocUrl) setNidFrontUrl(data.nidFrontDocUrl);
      if (data?.nidBackDocUrl) setNidBackUrl(data.nidBackDocUrl);
    } catch {
      toast.error(lang === 'BN' ? 'কেওয়াইসি স্ট্যাটাস লোড করতে ব্যর্থ হয়েছে' : 'Failed to load KYC status');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchKycStatus();
  }, [lang]);

  const handleImageUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    setter: (url: string) => void,
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error(lang === 'BN' ? 'ফাইলের আকার ৫ এমবি (5MB)-এর কম হতে হবে' : 'File size must be under 5MB');
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === 'string') {
        setter(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nidNumber.trim()) {
      toast.error(lang === 'BN' ? 'অনুগ্রহ করে আপনার জাতীয় পরিচয়পত্র (NID) নম্বর দিন' : 'Please enter your National ID (NID) number');
      return;
    }
    if (!nidFrontUrl) {
      toast.error(lang === 'BN' ? 'অনুগ্রহ করে এনআইডির সামনের পিঠের ছবি আপলোড করুন' : 'Please upload NID Front Side Image');
      return;
    }
    if (!nidBackUrl) {
      toast.error(lang === 'BN' ? 'অনুগ্রহ করে এনআইডির পেছনের পিঠের ছবি আপলোড করুন' : 'Please upload NID Back Side Image');
      return;
    }

    setSubmitting(true);
    try {
      const res = await counterAgentApi.submitKyc({
        nidNumber: nidNumber.trim(),
        nidFrontDocUrl: nidFrontUrl,
        nidBackDocUrl: nidBackUrl,
      });
      setStatus(res);
      toast.success(lang === 'BN' ? 'কেওয়াইসি নথিপত্র সফলভাবে জমা দেওয়া হয়েছে! অ্যাডমিন যাচাইকরণের অপেক্ষায়।' : 'KYC Documents submitted successfully! Pending Admin verification.');
    } catch (err: any) {
      toast.error(err?.response?.data?.message || (lang === 'BN' ? 'কেওয়াইসি ফাইল জমা দিতে ব্যর্থ হয়েছে।' : 'Failed to submit KYC documents.'));
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 text-[#E31B23] animate-spin" />
      </div>
    );
  }

  const kycState = status?.kycStatus || 'NOT_SUBMITTED';

  return (
    <div className="p-6 sm:p-8 space-y-6 max-w-4xl mx-auto font-sans">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight flex items-center gap-2">
          <RiShieldCheckFill className="text-[#E31B23]" size={30} /> {lang === 'BN' ? 'এজেন্ট কেওয়াইসি (KYC) ভেরিফিকেশন' : 'Agent KYC Verification'}
        </h1>
        <p className="text-xs sm:text-sm text-gray-500 mt-1">
          {lang === 'BN'
            ? 'কাউন্টার এজেন্টদের বাল্ক টিকিট বরাদ্দ ক্রয়ের পূর্বে পরিচয়পত্র যাচাইকরণ সম্পন্ন করা আবশ্যক।'
            : 'Identity verification is required before counter agents can purchase bulk ticket allocations.'}
        </p>
      </div>

      {/* State Cards */}
      {kycState === 'VERIFIED' && (
        <div className="bg-emerald-50 border-2 border-emerald-200 rounded-3xl p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-emerald-600 text-white rounded-2xl shrink-0">
              <RiCheckboxCircleFill size={28} />
            </div>
            <div>
              <h3 className="text-base font-black text-emerald-950">
                {lang === 'BN' ? 'কেওয়াইসি ভেরিফিকেশন সম্পন্ন হয়েছে' : 'KYC Verification Completed'}
              </h3>
              <p className="text-xs text-emerald-800 mt-1 leading-relaxed">
                {lang === 'BN'
                  ? 'আপনার এনআইডি পরিচয়পত্রের ডকুমেন্টস অ্যাডমিন কর্তৃক যাচাই করা হয়েছে। আপনি এখন নির্দ্বিধায় বাল্ক টিকিট কোটা ক্রয় করতে পারেন।'
                  : 'Your NID identity documents have been verified by Admin. You can now freely purchase bulk ticket quotas.'}
              </p>
              {status?.nidNumber && (
                <span className="text-[11px] font-bold text-emerald-900 bg-emerald-100/80 px-2.5 py-1 rounded-lg inline-block mt-2">
                  {lang === 'BN' ? 'যাচাইকৃত এনআইডি:' : 'Verified NID:'} {status.nidNumber}
                </span>
              )}
            </div>
          </div>

          <Link
            href="/counter-agent/buy-bulk"
            className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs sm:text-sm rounded-xl transition-all shadow-md shrink-0 flex items-center gap-1.5"
          >
            <BsFillTicketPerforatedFill size={16} /> {lang === 'BN' ? 'বাল্ক টিকিট ক্রয় করুন' : 'Buy Bulk Tickets'} <RiArrowRightSLine size={16} />
          </Link>
        </div>
      )}

      {kycState === 'PENDING' && (
        <div className="bg-amber-50 border-2 border-amber-200 rounded-3xl p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-amber-500 text-white rounded-2xl shrink-0">
              <RiTimeFill size={28} />
            </div>
            <div>
              <h3 className="text-base font-black text-amber-950">
                {lang === 'BN' ? 'কেওয়াইসি ভেরিফিকেশন পর্যালোচনায় রয়েছে' : 'KYC Verification Under Review'}
              </h3>
              <p className="text-xs text-amber-800 mt-1 leading-relaxed">
                {lang === 'BN'
                  ? 'আপনার এনআইডি ডকুমেন্টস জমা দেওয়া হয়েছে এবং বর্তমানে অ্যাডমিন কর্তৃক পর্যালোচনা করা হচ্ছে। অনুমোদিত হলেই বাল্ক টিকিট কেনাকাটা আনলক হবে।'
                  : 'Your NID documents have been submitted and are currently being reviewed by Admin. Bulk ticket purchases will be unlocked once approved.'}
              </p>
              {status?.nidNumber && (
                <span className="text-[11px] font-bold text-amber-900 bg-amber-100 px-2.5 py-1 rounded-lg inline-block mt-2">
                  {lang === 'BN' ? 'জমা প্রদানকৃত এনআইডি:' : 'Submitted NID:'} {status.nidNumber}
                </span>
              )}
            </div>
          </div>
        </div>
      )}

      {kycState === 'REJECTED' && (
        <div className="bg-rose-50 border-2 border-rose-200 rounded-3xl p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-rose-600 text-white rounded-2xl shrink-0">
              <RiCloseCircleFill size={28} />
            </div>
            <div>
              <h3 className="text-base font-black text-rose-950">
                {lang === 'BN' ? 'কেওয়াইসি ভেরিফিকেশন বাতিল করা হয়েছে' : 'KYC Verification Rejected'}
              </h3>
              <p className="text-xs text-rose-800 mt-1 leading-relaxed">
                {lang === 'BN' ? 'কারণ:' : 'Reason:'} <strong>{status?.kycRejectReason || (lang === 'BN' ? 'এনআইডি ফাইল অস্পষ্ট বা ভুল ছিল।' : 'NID documents unreadable or invalid.')}</strong>
              </p>
              <p className="text-[11px] text-rose-700 mt-1 font-semibold">
                {lang === 'BN' ? 'অনুগ্রহ করে নিচে আপনার মূল এনআইডি কার্ডের সামনের ও পেছনের স্পষ্ট ছবি পুনরায় আপলোড করুন।' : 'Please re-upload clear front & back images of your original NID card below.'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Form (Active for NOT_SUBMITTED or REJECTED) */}
      {(kycState === 'NOT_SUBMITTED' || kycState === 'REJECTED') && (
        <div className="bg-white rounded-3xl border border-gray-200/80 shadow-xs p-6 sm:p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-2">
                {lang === 'BN' ? 'জাতীয় পরিচয়পত্র (NID) নম্বর' : 'National ID (NID) Number'} <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. 19941234567890"
                value={nidNumber}
                onChange={(e) => setNidNumber(e.target.value)}
                className="w-full p-3.5 bg-gray-50 border border-gray-300 rounded-xl text-gray-900 text-sm font-semibold focus:border-[#E31B23] focus:ring-2 focus:ring-[#E31B23]/20 outline-none"
              />
            </div>

            <div className="grid sm:grid-cols-2 gap-6">
              {/* Front Side */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-2">
                  {lang === 'BN' ? 'এনআইডি কার্ড — সামনের দিকের ছবি' : 'NID Card — Front Side Image'} <span className="text-red-500">*</span>
                </label>
                <div className="border-2 border-dashed border-gray-300 hover:border-[#E31B23] bg-gray-50/50 rounded-2xl p-4 text-center transition-all">
                  {nidFrontUrl ? (
                    <div className="space-y-3">
                      <img
                        src={nidFrontUrl}
                        alt="NID Front Preview"
                        className="h-36 w-full object-cover rounded-xl border border-gray-200"
                      />
                      <button
                        type="button"
                        onClick={() => setNidFrontUrl('')}
                        className="text-xs font-bold text-rose-600 hover:underline"
                      >
                        {lang === 'BN' ? 'মুছে পুনরায় আপলোড করুন' : 'Remove & Re-upload'}
                      </button>
                    </div>
                  ) : (
                    <label className="cursor-pointer block py-6">
                      <RiUploadCloud2Fill size={36} className="mx-auto text-gray-400 mb-2" />
                      <span className="text-xs font-bold text-gray-700 block">
                        {lang === 'BN' ? 'এনআইডি সামনের পিঠ আপলোড করতে ক্লিক করুন' : 'Click to upload NID Front'}
                      </span>
                      <span className="text-[10px] text-gray-400 block mt-1">PNG, JPG up to 5MB</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleImageUpload(e, setNidFrontUrl)}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>
              </div>

              {/* Back Side */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-2">
                  {lang === 'BN' ? 'এনআইডি কার্ড — পেছনের দিকের ছবি' : 'NID Card — Back Side Image'} <span className="text-red-500">*</span>
                </label>
                <div className="border-2 border-dashed border-gray-300 hover:border-[#E31B23] bg-gray-50/50 rounded-2xl p-4 text-center transition-all">
                  {nidBackUrl ? (
                    <div className="space-y-3">
                      <img
                        src={nidBackUrl}
                        alt="NID Back Preview"
                        className="h-36 w-full object-cover rounded-xl border border-gray-200"
                      />
                      <button
                        type="button"
                        onClick={() => setNidBackUrl('')}
                        className="text-xs font-bold text-rose-600 hover:underline"
                      >
                        {lang === 'BN' ? 'মুছে পুনরায় আপলোড করুন' : 'Remove & Re-upload'}
                      </button>
                    </div>
                  ) : (
                    <label className="cursor-pointer block py-6">
                      <RiUploadCloud2Fill size={36} className="mx-auto text-gray-400 mb-2" />
                      <span className="text-xs font-bold text-gray-700 block">
                        {lang === 'BN' ? 'এনআইডি পেছনের পিঠ আপলোড করতে ক্লিক করুন' : 'Click to upload NID Back'}
                      </span>
                      <span className="text-[10px] text-gray-400 block mt-1">PNG, JPG up to 5MB</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleImageUpload(e, setNidBackUrl)}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-4 bg-[#E31B23] hover:bg-[#c9121a] text-white font-extrabold text-sm sm:text-base rounded-2xl transition-all shadow-lg hover:shadow-red-600/30 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" /> {lang === 'BN' ? 'ডকুমেন্টস জমা দেওয়া হচ্ছে...' : 'Submitting Documents...'}
                </>
              ) : (
                lang === 'BN' ? 'অ্যাডমিন যাচাইকরণের জন্য এনআইডি ফাইল জমা দিন' : 'Submit NID Documents for Admin Verification'
              )}
            </button>
          </form>
        </div>
      )}

      {/* Upload Instructions */}
      <div className="bg-gray-100/80 p-5 rounded-2xl border border-gray-200 text-xs text-gray-600 space-y-2">
        <h4 className="font-black text-gray-900 flex items-center gap-1.5">
          <RiInformationFill size={16} className="text-[#E31B23]" /> {lang === 'BN' ? 'এনআইডি ছবি আপলোডের নির্দেশিকা:' : 'NID Image Verification Guidelines:'}
        </h4>
        <ul className="list-disc list-inside space-y-1 text-gray-500 font-medium">
          <li>{lang === 'BN' ? 'এনআইডি কার্ডের লেখা এবং ছবি পরিষ্কার ও স্পষ্ট হতে হবে।' : 'Ensure NID card text and photo are sharp and clearly legible.'}</li>
          <li>{lang === 'BN' ? 'কার্ডের কোণা কেটে বাদ দেওয়া বা অতিরিক্ত আলোর ঝলকানিযুক্ত ছবি ব্যবহার করা যাবে না।' : 'Do not crop out the corners or use reflection/glare-heavy photos.'}</li>
          <li>{lang === 'BN' ? 'অফিস চলাকালীন সাধারণত ১-২ ঘণ্টার মধ্যে অ্যাডমিন যাচাইকরণ সম্পন্ন হয়।' : 'Admin verification takes typically 1-2 hours during business operations.'}</li>
        </ul>
      </div>
    </div>
  );
}
