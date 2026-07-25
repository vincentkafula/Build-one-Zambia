import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import { CheckCircle2, XCircle, Loader2, Heart, ShoppingBag } from 'lucide-react';
import { gatewayApi } from '../../lib/api';

// Landing page Flutterwave redirects back to after the hosted checkout-link
// flow (the fallback used when the inline widget's script fails to load —
// see gatewayApi.checkoutLink). Flutterwave appends status/tx_ref/
// transaction_id as query params; this page reads them, verifies the
// transaction against the real order/donation record server-side, and
// shows the actual result rather than just trusting the redirect itself
// (a bare redirect with no server-side verification could be spoofed).
export default function PaymentCompletePage() {
  const [state, setState] = useState<'checking' | 'success' | 'failed' | 'error'>('checking');
  const [message, setMessage] = useState('');
  const [type, setType] = useState<'order' | 'donation'>('order');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const status = params.get('status');
    const transactionId = params.get('transaction_id');
    const paymentType = (params.get('type') === 'donation' ? 'donation' : 'order') as 'order' | 'donation';
    const id = params.get('id') || '';
    setType(paymentType);

    if (status !== 'successful' && status !== 'completed') {
      setState('failed');
      setMessage('The payment was cancelled or did not complete.');
      return;
    }
    if (!transactionId || !id) {
      setState('error');
      setMessage('Missing payment details — if you were charged, please contact support with your reference number.');
      return;
    }

    const verify = paymentType === 'donation'
      ? gatewayApi.verifyDonationCard({ transactionId: Number(transactionId), donationId: id })
      : gatewayApi.verifyCard({ transactionId: Number(transactionId), txRef: params.get('tx_ref') || '', orderId: id });

    verify
      .then(res => {
        if (res.verified) {
          setState('success');
          setMessage(paymentType === 'donation' ? 'Your donation has been received. Thank you for your support!' : 'Your order has been paid and confirmed.');
        } else {
          setState('failed');
          setMessage('We could not verify this payment. If you were charged, please contact support with your reference number.');
        }
      })
      .catch(() => {
        setState('error');
        setMessage('Something went wrong verifying your payment. If you were charged, please contact support.');
      });
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ backgroundColor: '#007A30' }}>
      <div className="w-full max-w-md rounded-2xl bg-white p-8 text-center shadow-2xl">
        {state === 'checking' && (
          <>
            <Loader2 className="w-14 h-14 mx-auto mb-4 animate-spin" style={{ color: '#007A30' }} />
            <h1 className="text-xl font-bold text-gray-900 mb-2">Verifying your payment…</h1>
            <p className="text-sm text-gray-500">This will only take a moment.</p>
          </>
        )}
        {state === 'success' && (
          <>
            <CheckCircle2 className="w-14 h-14 mx-auto mb-4" style={{ color: '#007A30' }} />
            <h1 className="text-xl font-bold text-gray-900 mb-2">Payment Successful</h1>
            <p className="text-sm text-gray-600 mb-6">{message}</p>
            <Link
              to={type === 'donation' ? '/donate' : '/shop'}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-white text-sm font-semibold"
              style={{ backgroundColor: '#007A30' }}
            >
              {type === 'donation' ? <Heart size={16} /> : <ShoppingBag size={16} />}
              {type === 'donation' ? 'Back to Donate' : 'Back to Shop'}
            </Link>
          </>
        )}
        {(state === 'failed' || state === 'error') && (
          <>
            <XCircle className="w-14 h-14 mx-auto mb-4 text-red-600" />
            <h1 className="text-xl font-bold text-gray-900 mb-2">Payment Not Completed</h1>
            <p className="text-sm text-gray-600 mb-6">{message}</p>
            <Link
              to={type === 'donation' ? '/donate' : '/shop'}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-white text-sm font-semibold bg-gray-700"
            >
              Try Again
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
