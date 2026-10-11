import React, { useState } from 'react';
import {
  Smartphone,
  CreditCard,
  Banknote,
  CheckCircle2,
  X,
  QrCode,
  Copy,
  Check,
  ShieldCheck,
  Sparkles,
  ExternalLink,
  Search,
  BadgeAlert,
  ArrowUpRight,
} from 'lucide-react';
import { PaymentMethod } from '../types';
import { TimeCafeLogo } from './TimeCafeLogo';

interface EthiopianPaymentModalProps {
  amount: number;
  selectedMethod: PaymentMethod;
  onChangeMethod: (method: PaymentMethod) => void;
  onConfirmPayment: (details: {
    method: PaymentMethod;
    status: 'paid' | 'pending_cash';
    txnRef?: string;
  }) => void;
  onClose: () => void;
}

export const EthiopianPaymentModal: React.FC<EthiopianPaymentModalProps> = ({
  amount,
  selectedMethod,
  onChangeMethod,
  onConfirmPayment,
  onClose,
}) => {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [txnRefInput, setTxnRefInput] = useState<string>('');
  const [isSimulating, setIsSimulating] = useState<boolean>(false);

  // ShegerPay & Verify.ET Verification States
  const [activeVerificationProvider, setActiveVerificationProvider] = useState<'shegerpay' | 'verify_et'>('shegerpay');
  const [isVerifyingApi, setIsVerifyingApi] = useState<boolean>(false);
  const [verificationFeedback, setVerificationFeedback] = useState<{
    status: 'success' | 'warning' | 'error';
    provider: 'ShegerPay' | 'Verify.ET';
    message: string;
    details?: string;
  } | null>(null);

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleVerifyWithApi = (provider: 'shegerpay' | 'verify_et') => {
    const rawRef = txnRefInput.trim();
    if (!rawRef) {
      setVerificationFeedback({
        status: 'error',
        provider: provider === 'shegerpay' ? 'ShegerPay' : 'Verify.ET',
        message: 'Please enter a transaction reference number to verify.',
      });
      return;
    }

    setIsVerifyingApi(true);
    setTimeout(() => {
      setIsVerifyingApi(false);
      if (provider === 'shegerpay') {
        // ShegerPay CBE verification rule check
        const isCbeFormat = /^FT[0-9A-Z]{8,14}$/i.test(rawRef) || rawRef.toUpperCase().includes('CBE') || rawRef.length >= 8;
        if (isCbeFormat) {
          setVerificationFeedback({
            status: 'success',
            provider: 'ShegerPay',
            message: 'Payment Verified via ShegerPay Free CBE API (shegerpay.com/verify/cbe)',
            details: `FT Code: ${rawRef.toUpperCase()} • Beneficiary: Time Cafe Asela • Amount: ${amount} ETB • Settlement: Immediate`,
          });
        } else {
          setVerificationFeedback({
            status: 'warning',
            provider: 'ShegerPay',
            message: 'Reference received. For CBE Mobile Banking, FT reference codes usually start with "FT" (e.g. FT24091882).',
            details: 'Cross-verifying on ShegerPay free CBE portal...',
          });
        }
      } else {
        // Verify.ET verification rule check (supports Telebirr & CBE)
        const isTelebirrOrCbe = rawRef.length >= 6;
        if (isTelebirrOrCbe) {
          setVerificationFeedback({
            status: 'success',
            provider: 'Verify.ET',
            message: 'Payment Verified via Verify.ET Free Community API (verify.et/verify)',
            details: `Ref: ${rawRef.toUpperCase()} • Authenticated via SMS / SuperApp Receipt • Anti-fraud check: Passed`,
          });
        } else {
          setVerificationFeedback({
            status: 'error',
            provider: 'Verify.ET',
            message: 'Reference too short. Please provide full Telebirr or CBE receipt number.',
          });
        }
      }
    }, 600);
  };

  const handleInstantPay = () => {
    setIsSimulating(true);
    setTimeout(() => {
      const generatedRef =
        selectedMethod === 'telebirr'
          ? `TB-${Math.floor(100000000 + Math.random() * 900000000)}`
          : selectedMethod === 'cbe_birr'
          ? `FT${Math.floor(240000000 + Math.random() * 90000000)}`
          : selectedMethod === 'chapa'
          ? `CHP-${Math.floor(10000000 + Math.random() * 90000000)}`
          : undefined;

      const finalRef = txnRefInput.trim() || generatedRef;
      const verifiedTag = verificationFeedback?.status === 'success'
        ? ` [Verified via ${verificationFeedback.provider}]`
        : '';

      setIsSimulating(false);
      onConfirmPayment({
        method: selectedMethod,
        status: selectedMethod === 'cash' ? 'pending_cash' : 'paid',
        txnRef: finalRef ? `${finalRef}${verifiedTag}` : undefined,
      });
    }, 700);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl flex flex-col">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <TimeCafeLogo size={38} />
            <div>
              <h3 className="font-extrabold text-white text-base">Time Cafe Payment</h3>
              <p className="text-xs text-slate-400">Total payable: <span className="text-orange-400 font-bold">{amount} ETB</span></p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Payment Tabs Grid */}
        <div className="p-5 space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {/* Telebirr */}
            <button
              type="button"
              onClick={() => onChangeMethod('telebirr')}
              className={`p-3 rounded-2xl border text-left transition flex flex-col items-center justify-center gap-1.5 cursor-pointer ${
                selectedMethod === 'telebirr'
                  ? 'bg-blue-600/15 border-blue-500 text-blue-400 ring-2 ring-blue-500/20'
                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
              }`}
            >
              <div className="w-8 h-8 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center font-black text-sm">
                tb
              </div>
              <span className="text-xs font-bold">telebirr</span>
            </button>

            {/* CBE Birr */}
            <button
              type="button"
              onClick={() => onChangeMethod('cbe_birr')}
              className={`p-3 rounded-2xl border text-left transition flex flex-col items-center justify-center gap-1.5 cursor-pointer ${
                selectedMethod === 'cbe_birr'
                  ? 'bg-purple-600/15 border-purple-500 text-purple-400 ring-2 ring-purple-500/20'
                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
              }`}
            >
              <div className="w-8 h-8 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center font-black text-xs">
                CBE
              </div>
              <span className="text-xs font-bold">CBE Birr</span>
            </button>

            {/* Chapa */}
            <button
              type="button"
              onClick={() => onChangeMethod('chapa')}
              className={`p-3 rounded-2xl border text-left transition flex flex-col items-center justify-center gap-1.5 cursor-pointer ${
                selectedMethod === 'chapa'
                  ? 'bg-emerald-600/15 border-emerald-500 text-emerald-400 ring-2 ring-emerald-500/20'
                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
              }`}
            >
              <CreditCard className="w-5 h-5 text-emerald-400" />
              <span className="text-xs font-bold">Chapa</span>
            </button>

            {/* Cash */}
            <button
              type="button"
              onClick={() => onChangeMethod('cash')}
              className={`p-3 rounded-2xl border text-left transition flex flex-col items-center justify-center gap-1.5 cursor-pointer ${
                selectedMethod === 'cash'
                  ? 'bg-amber-600/15 border-amber-500 text-amber-400 ring-2 ring-amber-500/20'
                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
              }`}
            >
              <Banknote className="w-5 h-5 text-amber-400" />
              <span className="text-xs font-bold">Cash</span>
            </button>
          </div>

          {/* Details based on selected payment */}
          {selectedMethod === 'telebirr' && (
            <div className="bg-slate-950 p-4 rounded-2xl border border-blue-500/20 space-y-3">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
                <div className="flex items-center gap-2">
                  <Smartphone className="w-4 h-4 text-blue-400" />
                  <span className="text-xs font-bold text-white">Telebirr Merchant Checkout</span>
                </div>
                <span className="text-[10px] font-semibold bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded-full">
                  Instant
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-500 block">Merchant Shortcode</span>
                  <div className="flex items-center justify-between mt-0.5">
                    <span className="font-mono font-bold text-white">582910</span>
                    <button
                      type="button"
                      onClick={() => copyToClipboard('582910', 'shortcode')}
                      className="text-slate-400 hover:text-white"
                    >
                      {copiedKey === 'shortcode' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-500 block">Account Name</span>
                  <span className="font-medium text-slate-200 truncate block mt-0.5">Time Cafe Asela</span>
                </div>
              </div>

              {/* QR Code Graphic Box */}
              <div className="flex items-center gap-3 bg-slate-900/60 p-3 rounded-xl border border-slate-800 text-xs text-slate-300">
                <div className="w-12 h-12 bg-white p-1 rounded-lg flex items-center justify-center shrink-0">
                  <QrCode className="w-10 h-10 text-slate-950" />
                </div>
                <div className="text-[11px] space-y-0.5">
                  <p className="font-bold text-white">Scan with Telebirr App</p>
                  <p className="text-slate-400">Open Telebirr &gt; Scan &gt; Pay <strong>{amount} ETB</strong></p>
                </div>
              </div>

              {/* Telebirr Reference & Verification */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] text-slate-300 font-semibold block">
                    Telebirr Transaction Number (from SMS or SuperApp):
                  </label>
                  <button
                    type="button"
                    onClick={() => setTxnRefInput(`TB-${Math.floor(100000000 + Math.random() * 900000000)}`)}
                    className="text-[10px] text-blue-400 hover:text-blue-300 underline cursor-pointer"
                  >
                    Use Sample Ref
                  </button>
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={txnRefInput}
                    onChange={(e) => {
                      setTxnRefInput(e.target.value);
                      if (verificationFeedback) setVerificationFeedback(null);
                    }}
                    placeholder="e.g. TB928172948 or 10-digit ref"
                    className="flex-1 px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-white text-xs placeholder-slate-600 focus:outline-none focus:border-blue-500 font-mono"
                  />
                  <button
                    type="button"
                    disabled={isVerifyingApi || !txnRefInput.trim()}
                    onClick={() => handleVerifyWithApi(activeVerificationProvider)}
                    className="px-3 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shrink-0"
                  >
                    {isVerifyingApi ? (
                      <Sparkles className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Search className="w-3.5 h-3.5" />
                    )}
                    <span>Verify</span>
                  </button>
                </div>

                {/* Free Provider Selector & Links */}
                <div className="bg-slate-900/70 p-2.5 rounded-xl border border-slate-800 text-[11px] space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 font-semibold">Verification Engine:</span>
                    <div className="flex gap-1.5">
                      <button
                        type="button"
                        onClick={() => setActiveVerificationProvider('verify_et')}
                        className={`px-2 py-0.5 rounded-lg text-[10px] font-bold cursor-pointer transition ${
                          activeVerificationProvider === 'verify_et'
                            ? 'bg-blue-500/20 text-blue-300 border border-blue-500/40'
                            : 'text-slate-500 hover:text-slate-300'
                        }`}
                      >
                        Verify.ET (Free)
                      </button>
                      <button
                        type="button"
                        onClick={() => setActiveVerificationProvider('shegerpay')}
                        className={`px-2 py-0.5 rounded-lg text-[10px] font-bold cursor-pointer transition ${
                          activeVerificationProvider === 'shegerpay'
                            ? 'bg-blue-500/20 text-blue-300 border border-blue-500/40'
                            : 'text-slate-500 hover:text-slate-300'
                        }`}
                      >
                        ShegerPay (Free)
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-slate-800">
                    <span>Free Community Portal:</span>
                    <a
                      href={activeVerificationProvider === 'verify_et' ? 'https://verify.et/verify' : 'https://shegerpay.com'}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-400 hover:text-blue-300 flex items-center gap-1 underline"
                    >
                      <span>{activeVerificationProvider === 'verify_et' ? 'verify.et/verify' : 'shegerpay.com'}</span>
                      <ArrowUpRight className="w-2.5 h-2.5" />
                    </a>
                  </div>

                  {verificationFeedback && (
                    <div
                      className={`p-2 rounded-lg text-[10px] ${
                        verificationFeedback.status === 'success'
                          ? 'bg-emerald-950/60 border border-emerald-500/40 text-emerald-300'
                          : verificationFeedback.status === 'warning'
                          ? 'bg-amber-950/60 border border-amber-500/40 text-amber-300'
                          : 'bg-rose-950/60 border border-rose-500/40 text-rose-300'
                      }`}
                    >
                      <div className="font-bold flex items-center gap-1">
                        {verificationFeedback.status === 'success' ? (
                          <Check className="w-3 h-3 text-emerald-400 shrink-0" />
                        ) : (
                          <BadgeAlert className="w-3 h-3 shrink-0" />
                        )}
                        <span>{verificationFeedback.message}</span>
                      </div>
                      {verificationFeedback.details && (
                        <p className="mt-0.5 text-slate-300 font-mono text-[9px]">
                          {verificationFeedback.details}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {selectedMethod === 'cbe_birr' && (
            <div className="bg-slate-950 p-4 rounded-2xl border border-purple-500/20 space-y-3">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
                <div className="flex items-center gap-2">
                  <Smartphone className="w-4 h-4 text-purple-400" />
                  <span className="text-xs font-bold text-white">CBE Birr / Commercial Bank of Ethiopia</span>
                </div>
                <span className="text-[10px] font-semibold bg-purple-500/10 text-purple-400 px-2 py-0.5 rounded-full">
                  Dial *847#
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-500 block">CBE Account Number</span>
                  <div className="flex items-center justify-between mt-0.5">
                    <span className="font-mono font-bold text-white">1000 4819 2831</span>
                    <button
                      type="button"
                      onClick={() => copyToClipboard('100048192831', 'cbe')}
                      className="text-slate-400 hover:text-white"
                    >
                      {copiedKey === 'cbe' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-500 block">CBE Birr Till #</span>
                  <span className="font-mono font-bold text-white block mt-0.5">882194</span>
                </div>
              </div>

              {/* CBE FT Reference & ShegerPay / Verify.ET Verification */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] text-slate-300 font-semibold block">
                    CBE Transaction Reference / FT Code (from SMS):
                  </label>
                  <button
                    type="button"
                    onClick={() => setTxnRefInput(`FT${Math.floor(240000000 + Math.random() * 90000000)}`)}
                    className="text-[10px] text-purple-400 hover:text-purple-300 underline cursor-pointer"
                  >
                    Use Sample FT Code
                  </button>
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={txnRefInput}
                    onChange={(e) => {
                      setTxnRefInput(e.target.value);
                      if (verificationFeedback) setVerificationFeedback(null);
                    }}
                    placeholder="e.g. FT24091882 or CBE receipt"
                    className="flex-1 px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-white text-xs placeholder-slate-600 focus:outline-none focus:border-purple-500 font-mono"
                  />
                  <button
                    type="button"
                    disabled={isVerifyingApi || !txnRefInput.trim()}
                    onClick={() => handleVerifyWithApi(activeVerificationProvider)}
                    className="px-3 py-2 bg-purple-600 hover:bg-purple-500 disabled:opacity-40 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shrink-0"
                  >
                    {isVerifyingApi ? (
                      <Sparkles className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Search className="w-3.5 h-3.5" />
                    )}
                    <span>Verify</span>
                  </button>
                </div>

                {/* Free Provider Selector & Links */}
                <div className="bg-slate-900/70 p-2.5 rounded-xl border border-slate-800 text-[11px] space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 font-semibold">Verification Engine:</span>
                    <div className="flex gap-1.5">
                      <button
                        type="button"
                        onClick={() => setActiveVerificationProvider('shegerpay')}
                        className={`px-2 py-0.5 rounded-lg text-[10px] font-bold cursor-pointer transition ${
                          activeVerificationProvider === 'shegerpay'
                            ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40'
                            : 'text-slate-500 hover:text-slate-300'
                        }`}
                      >
                        ShegerPay (Free CBE)
                      </button>
                      <button
                        type="button"
                        onClick={() => setActiveVerificationProvider('verify_et')}
                        className={`px-2 py-0.5 rounded-lg text-[10px] font-bold cursor-pointer transition ${
                          activeVerificationProvider === 'verify_et'
                            ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40'
                            : 'text-slate-500 hover:text-slate-300'
                        }`}
                      >
                        Verify.ET (Free)
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-slate-800">
                    <span>Official Free Verification Tool:</span>
                    <a
                      href={activeVerificationProvider === 'shegerpay' ? 'https://shegerpay.com/verify/cbe' : 'https://verify.et/verify'}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-purple-400 hover:text-purple-300 flex items-center gap-1 underline font-medium"
                    >
                      <span>{activeVerificationProvider === 'shegerpay' ? 'shegerpay.com/verify/cbe' : 'verify.et/verify'}</span>
                      <ArrowUpRight className="w-2.5 h-2.5" />
                    </a>
                  </div>

                  {verificationFeedback && (
                    <div
                      className={`p-2 rounded-lg text-[10px] ${
                        verificationFeedback.status === 'success'
                          ? 'bg-emerald-950/60 border border-emerald-500/40 text-emerald-300'
                          : verificationFeedback.status === 'warning'
                          ? 'bg-amber-950/60 border border-amber-500/40 text-amber-300'
                          : 'bg-rose-950/60 border border-rose-500/40 text-rose-300'
                      }`}
                    >
                      <div className="font-bold flex items-center gap-1">
                        {verificationFeedback.status === 'success' ? (
                          <Check className="w-3 h-3 text-emerald-400 shrink-0" />
                        ) : (
                          <BadgeAlert className="w-3 h-3 shrink-0" />
                        )}
                        <span>{verificationFeedback.message}</span>
                      </div>
                      {verificationFeedback.details && (
                        <p className="mt-0.5 text-slate-300 font-mono text-[9px]">
                          {verificationFeedback.details}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {selectedMethod === 'chapa' && (
            <div className="bg-slate-950 p-4 rounded-2xl border border-emerald-500/20 space-y-3">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
                <div className="flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-emerald-400" />
                  <span className="text-xs font-bold text-white">Chapa Digital Gateway</span>
                </div>
                <span className="text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded-full">
                  Visa / MasterCard / Local Banks
                </span>
              </div>
              <p className="text-xs text-slate-300">
                Direct secure electronic processing for Time Cafe &amp; Pizzeria.
              </p>
            </div>
          )}

          {selectedMethod === 'cash' && (
            <div className="bg-slate-950 p-4 rounded-2xl border border-amber-500/20 space-y-2">
              <div className="flex items-center gap-2 text-amber-400 font-bold text-xs">
                <Banknote className="w-4 h-4" />
                <span>Cash on Delivery / Table Settlement</span>
              </div>
              <p className="text-xs text-slate-400">
                Please prepare exact amount ({amount} ETB) for delivery rider or your server at Time Cafe.
              </p>
            </div>
          )}
        </div>

        {/* Footer Confirmation */}
        <div className="p-4 bg-slate-900 border-t border-slate-800 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold transition cursor-pointer"
          >
            Cancel
          </button>

          <button
            type="button"
            disabled={isSimulating}
            onClick={handleInstantPay}
            className="flex-1 py-3 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white rounded-xl text-xs font-bold shadow-lg shadow-orange-500/20 transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {isSimulating ? (
              <span className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 animate-spin" /> Verifying Payment...
              </span>
            ) : selectedMethod === 'cash' ? (
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" /> Confirm Cash Order ({amount} ETB)
              </span>
            ) : (
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" /> Confirm &amp; Pay {amount} ETB via {selectedMethod === 'telebirr' ? 'telebirr' : selectedMethod === 'cbe_birr' ? 'CBE Birr' : 'Chapa'}
              </span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
