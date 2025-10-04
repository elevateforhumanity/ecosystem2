import { api } from './api';

class PaymentService {
  constructor() {
    this.stripe = null;
    this.isInitialized = false;
  }

  async initialize(publishableKey) {
    if (this.isInitialized) return;

    try {
      if (typeof window !== 'undefined' && window.Stripe) {
        this.stripe = window.Stripe(publishableKey);
        this.isInitialized = true;
      } else {
        await this.loadStripeScript();
        this.stripe = window.Stripe(publishableKey);
        this.isInitialized = true;
      }
    } catch (error) {
      console.error('Failed to initialize Stripe:', error);
      throw error;
    }
  }

  loadStripeScript() {
    return new Promise((resolve, reject) => {
      if (window.Stripe) {
        resolve();
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://js.stripe.com/v3/';
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }

  async createPaymentIntent(amount, currency = 'usd', metadata = {}) {
    try {
      const response = await api.post('/payments/create-intent', {
        amount,
        currency,
        metadata,
      });
      return response;
    } catch (error) {
      console.error('Failed to create payment intent:', error);
      throw error;
    }
  }

  async confirmPayment(clientSecret, paymentMethod) {
    if (!this.stripe) {
      throw new Error('Stripe not initialized');
    }

    try {
      const result = await this.stripe.confirmCardPayment(clientSecret, {
        payment_method: paymentMethod,
      });

      if (result.error) {
        throw new Error(result.error.message);
      }

      return result.paymentIntent;
    } catch (error) {
      console.error('Payment confirmation failed:', error);
      throw error;
    }
  }

  async createCheckoutSession(items, successUrl, cancelUrl) {
    try {
      const response = await api.post('/payments/create-checkout', {
        items,
        successUrl,
        cancelUrl,
      });

      if (this.stripe && response.sessionId) {
        await this.stripe.redirectToCheckout({ sessionId: response.sessionId });
      }

      return response;
    } catch (error) {
      console.error('Failed to create checkout session:', error);
      throw error;
    }
  }

  async getPaymentHistory() {
    try {
      const response = await api.get('/payments/history');
      return response.payments || [];
    } catch (error) {
      console.error('Failed to fetch payment history:', error);
      throw error;
    }
  }

  async refundPayment(paymentId, amount = null) {
    try {
      const response = await api.post(`/payments/${paymentId}/refund`, {
        amount,
      });
      return response;
    } catch (error) {
      console.error('Failed to refund payment:', error);
      throw error;
    }
  }

  formatAmount(amount, currency = 'USD') {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
    }).format(amount / 100);
  }

  validateCardNumber(cardNumber) {
    const cleaned = cardNumber.replace(/\s/g, '');
    
    if (!/^\d{13,19}$/.test(cleaned)) {
      return false;
    }

    let sum = 0;
    let isEven = false;

    for (let i = cleaned.length - 1; i >= 0; i--) {
      let digit = parseInt(cleaned[i], 10);

      if (isEven) {
        digit *= 2;
        if (digit > 9) {
          digit -= 9;
        }
      }

      sum += digit;
      isEven = !isEven;
    }

    return sum % 10 === 0;
  }

  getCardType(cardNumber) {
    const cleaned = cardNumber.replace(/\s/g, '');
    
    const patterns = {
      visa: /^4/,
      mastercard: /^5[1-5]/,
      amex: /^3[47]/,
      discover: /^6(?:011|5)/,
    };

    for (const [type, pattern] of Object.entries(patterns)) {
      if (pattern.test(cleaned)) {
        return type;
      }
    }

    return 'unknown';
  }
}

export const paymentService = new PaymentService();

export function usePayment() {
  return paymentService;
}
