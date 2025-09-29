const DEFAULT_TIMEOUT = 15000;
const PLACEHOLDER_PATTERN = /replace/i;

function isPlaceholder(value) {
  return !value || PLACEHOLDER_PATTERN.test(String(value));
}

function withTimeout(factory, timeout) {
  const controller = new AbortController();
  const operation = factory(controller.signal);
  if (!timeout) {
    return operation;
  }
  const timer = setTimeout(() => controller.abort(), timeout);
  const finalize = () => clearTimeout(timer);
  if (typeof operation.finally === "function") {
    return operation.finally(finalize);
  }
  return (async () => {
    try {
      return await operation;
    } finally {
      finalize();
    }
  })();
}

export class PaymentGateway {
  constructor(config = {}) {
    this.mode = config.mode || "test";
    this.provider = config.provider || "Gateway";
    this.endpoint = config.endpoint || "";
    this.publishableKey = config.publishableKey || "";
    this.timeout = Number(config.timeoutMs) || DEFAULT_TIMEOUT;
  }

  static fromEnv(config = {}) {
    return new PaymentGateway(config || {});
  }

  get isLive() {
    return String(this.mode).toLowerCase() === "live";
  }

  get isConfigured() {
    if (isPlaceholder(this.publishableKey)) {
      return false;
    }
    if (this.isLive() && !this.endpoint) {
      return false;
    }
    return true;
  }

  ensureConfigured() {
    if (!this.isConfigured) {
      throw new Error(
        "Payment gateway is not configured. Update paymentGateway settings in assets/js/env.local.js."
      );
    }
  }

  buildPayload({ order, card, billing }) {
    return {
      amount: order.amount,
      currency: order.currency,
      reference: order.reference,
      planId: order.plan?.id || null,
      services: (order.services || []).map((service) => ({
        id: service.id,
        title: service.title,
        price: service.price || null,
        priceLabel: service.priceLabel || null,
      })),
      customer: {
        name: order.name,
        email: order.email,
      },
      billing: {
        address: billing?.address || null,
      },
      card: {
        number: card.number,
        expMonth: card.expMonth,
        expYear: card.expYear,
        cvc: card.cvc,
      },
      metadata: {
        provider: this.provider,
        mode: this.mode,
      },
    };
  }

  async request(payload) {
    if (!this.endpoint || (!this.isLive() && !this.endpoint)) {
      return {
        ok: true,
        transactionId: `test_${Date.now()}`,
        mode: this.mode,
      };
    }
    return withTimeout(
      async (signal) => {
        const response = await fetch(this.endpoint, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${this.publishableKey}`,
          },
          body: JSON.stringify(payload),
          signal,
        });
        if (!response.ok) {
          const message = await response.text();
          throw new Error(message || "Payment request failed");
        }
        const data = await response.json().catch(() => ({}));
        if (data && data.error) {
          throw new Error(data.error);
        }
        return data || { ok: true };
      },
      this.timeout
    );
  }

  async processPayment({ order, card, billing }) {
    this.ensureConfigured();
    if (!order?.reference) {
      throw new Error("Missing order reference. Refresh and try again.");
    }
    if (!card?.number || !card?.expMonth || !card?.expYear) {
      throw new Error("Card details are incomplete. Check the number and expiry.");
    }
    const payload = this.buildPayload({ order, card, billing });
    try {
      const result = await this.request(payload);
      return {
        ok: result?.ok !== false,
        transactionId:
          result?.transactionId || result?.id || `txn_${Date.now().toString(36)}`,
        receiptUrl: result?.receiptUrl || null,
        mode: result?.mode || this.mode,
      };
    } catch (error) {
      if (error.name === "AbortError") {
        throw new Error("Payment timed out. Please try again.");
      }
      throw new Error(error?.message || "Unable to process payment.");
    }
  }
}
