import React, { useState } from 'react';
import { paymentService } from '../lib/payment';
import { useNotification } from '../hooks/useNotification';

export function PaymentForm({ amount, currency = 'USD', onSuccess, onError }) {
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvc, setCvc] = useState('');
  const [name, setName] = useState('');
  const [processing, setProcessing] = useState(false);
  const [errors, setErrors] = useState({});
  const notification = useNotification();

  const formatCardNumber = (value) => {
    const cleaned = value.replace(/\s/g, '');
    const groups = cleaned.match(/.{1,4}/g);
    return groups ? groups.join(' ') : cleaned;
  };

  const formatExpiry = (value) => {
    const cleaned = value.replace(/\D/g, '');
    if (cleaned.length >= 2) {
      return `${cleaned.slice(0, 2)}/${cleaned.slice(2, 4)}`;
    }
    return cleaned;
  };

  const validateForm = () => {
    const newErrors = {};

    if (!paymentService.validateCardNumber(cardNumber.replace(/\s/g, ''))) {
      newErrors.cardNumber = 'Invalid card number';
    }

    const expiryParts = expiry.split('/');
    if (expiryParts.length !== 2 || expiryParts[0].length !== 2 || expiryParts[1].length !== 2) {
      newErrors.expiry = 'Invalid expiry date (MM/YY)';
    }

    if (!/^\d{3,4}$/.test(cvc)) {
      newErrors.cvc = 'Invalid CVC';
    }

    if (!name.trim()) {
      newErrors.name = 'Name is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setProcessing(true);

    try {
      const { clientSecret } = await paymentService.createPaymentIntent(
        amount * 100,
        currency.toLowerCase()
      );

      const paymentMethod = {
        card: {
          number: cardNumber.replace(/\s/g, ''),
          exp_month: parseInt(expiry.split('/')[0], 10),
          exp_year: parseInt(`20${expiry.split('/')[1]}`, 10),
          cvc,
        },
        billing_details: {
          name,
        },
      };

      const result = await paymentService.confirmPayment(clientSecret, paymentMethod);

      notification.success('Payment successful!');
      onSuccess?.(result);
    } catch (error) {
      console.error('Payment error:', error);
      notification.error(error.message || 'Payment failed');
      onError?.(error);
    } finally {
      setProcessing(false);
    }
  };

  const cardType = paymentService.getCardType(cardNumber);

  return (
    <form onSubmit={handleSubmit} style={{ maxWidth: 400 }}>
      <div style={{ marginBottom: 20 }}>
        <label
          style={{
            display: 'block',
            fontSize: 14,
            fontWeight: 600,
            marginBottom: 8,
            color: 'var(--color-text-primary)',
          }}
        >
          Card Number
        </label>
        <div style={{ position: 'relative' }}>
          <input
            type="text"
            value={cardNumber}
            onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
            placeholder="1234 5678 9012 3456"
            maxLength={19}
            style={{
              width: '100%',
              padding: '10px 40px 10px 12px',
              fontSize: 14,
              border: `1px solid ${errors.cardNumber ? 'var(--color-danger)' : 'var(--color-border)'}`,
              borderRadius: 6,
              backgroundColor: 'var(--color-input-bg)',
              color: 'var(--color-text-primary)',
            }}
          />
          {cardType !== 'unknown' && (
            <div
              style={{
                position: 'absolute',
                right: 12,
                top: '50%',
                transform: 'translateY(-50%)',
                fontSize: 12,
                fontWeight: 600,
                color: 'var(--color-text-tertiary)',
                textTransform: 'uppercase',
              }}
            >
              {cardType}
            </div>
          )}
        </div>
        {errors.cardNumber && (
          <div style={{ fontSize: 12, color: 'var(--color-danger)', marginTop: 4 }}>
            {errors.cardNumber}
          </div>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
        <div>
          <label
            style={{
              display: 'block',
              fontSize: 14,
              fontWeight: 600,
              marginBottom: 8,
              color: 'var(--color-text-primary)',
            }}
          >
            Expiry Date
          </label>
          <input
            type="text"
            value={expiry}
            onChange={(e) => setExpiry(formatExpiry(e.target.value))}
            placeholder="MM/YY"
            maxLength={5}
            style={{
              width: '100%',
              padding: '10px 12px',
              fontSize: 14,
              border: `1px solid ${errors.expiry ? 'var(--color-danger)' : 'var(--color-border)'}`,
              borderRadius: 6,
              backgroundColor: 'var(--color-input-bg)',
              color: 'var(--color-text-primary)',
            }}
          />
          {errors.expiry && (
            <div style={{ fontSize: 12, color: 'var(--color-danger)', marginTop: 4 }}>
              {errors.expiry}
            </div>
          )}
        </div>

        <div>
          <label
            style={{
              display: 'block',
              fontSize: 14,
              fontWeight: 600,
              marginBottom: 8,
              color: 'var(--color-text-primary)',
            }}
          >
            CVC
          </label>
          <input
            type="text"
            value={cvc}
            onChange={(e) => setCvc(e.target.value.replace(/\D/g, ''))}
            placeholder="123"
            maxLength={4}
            style={{
              width: '100%',
              padding: '10px 12px',
              fontSize: 14,
              border: `1px solid ${errors.cvc ? 'var(--color-danger)' : 'var(--color-border)'}`,
              borderRadius: 6,
              backgroundColor: 'var(--color-input-bg)',
              color: 'var(--color-text-primary)',
            }}
          />
          {errors.cvc && (
            <div style={{ fontSize: 12, color: 'var(--color-danger)', marginTop: 4 }}>
              {errors.cvc}
            </div>
          )}
        </div>
      </div>

      <div style={{ marginBottom: 20 }}>
        <label
          style={{
            display: 'block',
            fontSize: 14,
            fontWeight: 600,
            marginBottom: 8,
            color: 'var(--color-text-primary)',
          }}
        >
          Cardholder Name
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="John Doe"
          style={{
            width: '100%',
            padding: '10px 12px',
            fontSize: 14,
            border: `1px solid ${errors.name ? 'var(--color-danger)' : 'var(--color-border)'}`,
            borderRadius: 6,
            backgroundColor: 'var(--color-input-bg)',
            color: 'var(--color-text-primary)',
          }}
        />
        {errors.name && (
          <div style={{ fontSize: 12, color: 'var(--color-danger)', marginTop: 4 }}>
            {errors.name}
          </div>
        )}
      </div>

      <button
        type="submit"
        disabled={processing}
        style={{
          width: '100%',
          padding: '12px 24px',
          fontSize: 16,
          fontWeight: 600,
          border: 'none',
          borderRadius: 6,
          backgroundColor: processing ? 'var(--color-border)' : 'var(--color-primary)',
          color: 'white',
          cursor: processing ? 'not-allowed' : 'pointer',
          transition: 'background-color 0.2s',
        }}
      >
        {processing ? 'Processing...' : `Pay ${paymentService.formatAmount(amount * 100, currency)}`}
      </button>

      <div
        style={{
          marginTop: 16,
          padding: 12,
          backgroundColor: 'var(--color-bg-secondary)',
          borderRadius: 6,
          fontSize: 12,
          color: 'var(--color-text-secondary)',
          textAlign: 'center',
        }}
      >
        🔒 Your payment information is secure and encrypted
      </div>
    </form>
  );
}

export function PaymentHistory() {
  const [payments, setPayments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  React.useEffect(() => {
    loadPayments();
  }, []);

  const loadPayments = async () => {
    setIsLoading(true);
    try {
      const data = await paymentService.getPaymentHistory();
      setPayments(data);
    } catch (error) {
      console.error('Failed to load payments:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <div style={{ padding: 20, textAlign: 'center' }}>Loading...</div>;
  }

  if (payments.length === 0) {
    return (
      <div style={{ padding: 40, textAlign: 'center', color: 'var(--color-text-secondary)' }}>
        No payment history
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {payments.map((payment) => (
        <div
          key={payment.id}
          style={{
            padding: 16,
            backgroundColor: 'var(--color-card-bg)',
            border: '1px solid var(--color-border)',
            borderRadius: 8,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <div>
            <div style={{ fontSize: 16, fontWeight: 500, marginBottom: 4 }}>
              {payment.description || 'Payment'}
            </div>
            <div style={{ fontSize: 12, color: 'var(--color-text-tertiary)' }}>
              {new Date(payment.created).toLocaleDateString()}
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 18, fontWeight: 600, color: 'var(--color-primary)' }}>
              {paymentService.formatAmount(payment.amount, payment.currency)}
            </div>
            <div
              style={{
                fontSize: 12,
                color: payment.status === 'succeeded' ? 'var(--color-success)' : 'var(--color-text-tertiary)',
                textTransform: 'capitalize',
              }}
            >
              {payment.status}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
