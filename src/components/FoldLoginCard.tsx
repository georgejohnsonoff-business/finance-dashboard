'use client';
import { useState, useEffect } from 'react';

interface FoldStatus {
  connected: boolean;
  expired?: boolean;
  user_id?: string;
}

export function FoldLoginCard({
  onConnected,
  onSync,
}: {
  onConnected: () => void;
  onSync: () => void;
}) {
  const [status, setStatus] = useState<FoldStatus | null>(null);
  const [step, setStep] = useState<'idle' | 'otp_sent' | 'verifying'>('idle');
  const [phone, setPhone] = useState('+91');
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [syncMsg, setSyncMsg] = useState('');

  useEffect(() => {
    fetch('/api/fold/status')
      .then((r) => r.json())
      .then(setStatus)
      .catch(() => setStatus({ connected: false }));
  }, []);

  async function handleSendOtp() {
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/fold/otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setStep('otp_sent');
    } catch (err: any) {
      setError(err.message);
    }
    setLoading(false);
  }

  async function handleVerify() {
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/fold/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, otp }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setStatus({ connected: true });
      setStep('idle');
      setOtp('');
      onConnected();
    } catch (err: any) {
      setError(err.message);
    }
    setLoading(false);
  }

  async function handleDisconnect() {
    await fetch('/api/fold/disconnect', { method: 'POST' });
    setStatus({ connected: false });
    setStep('idle');
  }

  async function handleSync() {
    setSyncing(true);
    setSyncMsg('');
    try {
      const res = await fetch('/api/fold/sync', { method: 'POST' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setSyncMsg(`Synced ${data.added} new transactions`);
      onSync();
    } catch (err: any) {
      setSyncMsg(`Sync failed: ${err.message}`);
    }
    setSyncing(false);
  }

  if (status === null) return null;

  if (status.connected) {
    return (
      <div className="rounded-xl border border-slate-800 bg-slate-900 p-5 mb-6">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-slate-200 text-sm font-medium">Fold Money Connected</span>
            {status.expired && (
              <span className="text-xs text-amber-400">(session expired — re-login)</span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleSync}
              disabled={syncing}
              className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white px-4 py-1.5 rounded-lg text-sm font-medium transition-colors"
            >
              {syncing ? 'Syncing...' : 'Sync Now'}
            </button>
            <button
              onClick={handleDisconnect}
              className="text-slate-500 hover:text-rose-400 text-sm transition-colors"
            >
              Disconnect
            </button>
          </div>
        </div>
        {syncMsg && (
          <p className={`text-xs mt-2 ${syncMsg.includes('failed') ? 'text-rose-400' : 'text-emerald-400'}`}>
            {syncMsg}
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900 p-5 mb-6">
      <div className="flex items-center gap-2 mb-3">
        <span className="w-2.5 h-2.5 rounded-full bg-slate-600" />
        <span className="text-slate-200 text-sm font-medium">Connect Fold Money</span>
      </div>
      <p className="text-slate-500 text-xs mb-4">
        Auto-import bank &amp; UPI transactions. Note: this will log you out of the Fold phone app.
      </p>

      {error && <p className="text-rose-400 text-xs mb-3">{error}</p>}

      {step === 'idle' && (
        <div className="flex gap-2">
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+91XXXXXXXXXX"
            className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 w-48"
          />
          <button
            onClick={handleSendOtp}
            disabled={loading || phone.length < 13}
            className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            {loading ? 'Sending...' : 'Send OTP'}
          </button>
        </div>
      )}

      {step === 'otp_sent' && (
        <div className="flex gap-2">
          <input
            type="text"
            value={otp}
            onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
            placeholder="6-digit OTP"
            maxLength={6}
            className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 w-36"
          />
          <button
            onClick={handleVerify}
            disabled={loading || otp.length !== 6}
            className="bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            {loading ? 'Verifying...' : 'Verify'}
          </button>
          <button
            onClick={() => { setStep('idle'); setOtp(''); setError(''); }}
            className="text-slate-500 hover:text-slate-300 text-sm transition-colors"
          >
            Back
          </button>
        </div>
      )}
    </div>
  );
}
