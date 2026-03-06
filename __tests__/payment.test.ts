import { describe, it, expect, vi, beforeEach } from "vitest";
import crypto from "crypto";

// =============================================================================
// BUSINESS LOGIC RECREATION
// We recreate the exact logic from route handlers so we can test without
// Prisma/Next.js dependencies. This is the contract the routes must uphold.
// =============================================================================

// --- RefId Generation ---
function generateRefId(orderNumber: string): string {
  const timestamp = Date.now();
  const randomHex = crypto.randomBytes(4).toString("hex");
  return `XF-${orderNumber}-${timestamp}-${randomHex}`;
}

// --- HMAC Signature ---
function calculateHash(hashStr: string, secretKey: string): string {
  return crypto.createHmac("sha256", secretKey).update(hashStr).digest("base64");
}

function verifySignature(
  params: { merchant_oid: string; total_amount: string; status: string },
  receivedHash: string | undefined,
  secretKey: string | undefined,
  isProduction: boolean
): { valid: boolean; error?: string; statusCode?: number } {
  if (!secretKey && isProduction) {
    return { valid: false, error: "Payment secret key not configured", statusCode: 500 };
  }
  if (!secretKey) {
    // test mode — skip validation
    return { valid: true };
  }
  if (!receivedHash) {
    return { valid: false, error: "Missing signature hash", statusCode: 400 };
  }
  const hashStr = `${params.merchant_oid}${params.total_amount}${params.status}`;
  const expected = calculateHash(hashStr, secretKey);
  if (receivedHash !== expected) {
    return { valid: false, error: "Invalid signature", statusCode: 403 };
  }
  return { valid: true };
}

// --- Payment Status Mapping ---
function isPaymentSuccess(status: string | null | undefined): boolean {
  if (!status) return false;
  const normalized = status.toLowerCase().trim();
  return ["success", "completed", "paid"].includes(normalized);
}

// --- Field Extraction ---
function extractRefId(body: Record<string, unknown>): string | undefined {
  return (body.merchant_oid ?? body.order_id ?? body.refId) as string | undefined;
}

// --- Amount Formatting ---
function formatAmount(amount: number): string {
  return amount.toFixed(2);
}

// --- CSRF Soft Enforcement ---
function csrfCheck(
  csrfToken: string | undefined,
  verifyCsrf: (token: string) => boolean
): { pass: boolean; statusCode?: number } {
  if (csrfToken && !verifyCsrf(csrfToken)) {
    return { pass: false, statusCode: 403 };
  }
  return { pass: true };
}

// --- Initiate Validation ---
interface Order {
  id: string;
  number: string;
  userId: string;
  paid: boolean;
  totalAmount: number;
}

interface PaymentRecord {
  id: string;
  refId: string;
  orderId: string;
  amount: number;
  status: string;
  createdAt: Date;
}

function validateInitiate(
  userId: string | undefined,
  orderId: string | undefined,
  order: Order | null,
  csrfToken: string | undefined,
  verifyCsrf: (token: string) => boolean
): { ok: boolean; statusCode?: number; error?: string } {
  if (!userId) return { ok: false, statusCode: 401, error: "Unauthorized" };
  if (!orderId) return { ok: false, statusCode: 400, error: "orderId is required" };

  const csrf = csrfCheck(csrfToken, verifyCsrf);
  if (!csrf.pass) return { ok: false, statusCode: csrf.statusCode, error: "CSRF validation failed" };

  if (!order) return { ok: false, statusCode: 404, error: "Order not found" };
  if (order.userId !== userId) return { ok: false, statusCode: 403, error: "Forbidden" };
  if (order.paid) return { ok: false, statusCode: 400, error: "Order already paid" };

  return { ok: true };
}

// --- Callback Processing ---
function processCallback(
  body: Record<string, unknown>,
  payment: PaymentRecord | null,
  secretKey: string | undefined,
  isProduction: boolean
): {
  statusCode: number;
  message: string;
  updatedPayment?: Partial<PaymentRecord>;
  updatedOrder?: { paid: boolean };
  shouldNotifyAdmin?: boolean;
} {
  const refId = extractRefId(body);
  if (!refId) return { statusCode: 400, message: "Missing refId" };
  if (!payment) return { statusCode: 404, message: "Payment not found" };

  // Idempotency
  if (payment.status === "Paid") {
    return { statusCode: 200, message: "Already processed" };
  }

  const status = (body.status as string) || "";
  const sigResult = verifySignature(
    {
      merchant_oid: refId as string,
      total_amount: (body.total_amount as string) || formatAmount(payment.amount),
      status,
    },
    body.hash as string | undefined,
    secretKey,
    isProduction
  );

  if (!sigResult.valid) {
    const result: ReturnType<typeof processCallback> = {
      statusCode: sigResult.statusCode!,
      message: sigResult.error!,
    };
    if (sigResult.statusCode === 403) {
      result.updatedPayment = { status: "Denied" };
    }
    return result;
  }

  if (isPaymentSuccess(status)) {
    return {
      statusCode: 200,
      message: "Payment successful",
      updatedPayment: { status: "Paid" },
      updatedOrder: { paid: true },
      shouldNotifyAdmin: true,
    };
  }

  return {
    statusCode: 200,
    message: "Payment failed",
    updatedPayment: { status: "Failed" },
  };
}

// --- Redirect URL Builder ---
function buildRedirectUrl(
  refId: string | undefined,
  payment: PaymentRecord | null,
  queryStatus: string | undefined,
  isMock: boolean,
  isDevelopment: boolean
): string {
  if (!refId) return "/profile";
  if (!payment) return "/profile";

  if (queryStatus === "fail") {
    return `/payment/${payment.orderId}?error=payment_failed`;
  }

  if (isMock && !isDevelopment) {
    return "/profile";
  }

  return `/profile?payment=success&order=${payment.orderId}`;
}

// --- Live vs Test Mode ---
function isLiveMode(env: {
  PAYMENT_API_KEY?: string;
  PAYMENT_SECRET_KEY?: string;
  PAYMENT_MERCHANT_ID?: string;
}): boolean {
  return !!(env.PAYMENT_API_KEY && env.PAYMENT_SECRET_KEY && env.PAYMENT_MERCHANT_ID);
}

// =============================================================================
// TESTS
// =============================================================================

describe("Payment Flow - HARDCORE", () => {
  // -------------------------------------------------------------------------
  // RefId Generation
  // -------------------------------------------------------------------------
  describe("RefId generation", () => {
    it("matches format XF-{number}-{timestamp}-{hex}", () => {
      const refId = generateRefId("1001");
      expect(refId).toMatch(/^XF-1001-\d{13,}-[0-9a-f]{8}$/);
    });

    it("each call produces a unique refId", () => {
      const ids = new Set(Array.from({ length: 100 }, () => generateRefId("1001")));
      expect(ids.size).toBe(100);
    });

    it("contains the order number in the refId", () => {
      const refId = generateRefId("9999");
      expect(refId).toContain("9999");
      expect(refId.startsWith("XF-9999-")).toBe(true);
    });

    it("handles order numbers with leading zeros", () => {
      const refId = generateRefId("0001");
      expect(refId).toMatch(/^XF-0001-\d+-[0-9a-f]{8}$/);
    });

    it("handles very large order numbers", () => {
      const refId = generateRefId("9999999999");
      expect(refId).toContain("9999999999");
    });

    it("timestamp portion is within reasonable range", () => {
      const before = Date.now();
      const refId = generateRefId("1");
      const after = Date.now();
      const parts = refId.split("-");
      // XF - orderNum - timestamp - hex  →  index 2 is timestamp
      const ts = parseInt(parts[2], 10);
      expect(ts).toBeGreaterThanOrEqual(before);
      expect(ts).toBeLessThanOrEqual(after);
    });

    it("hex portion is exactly 8 characters", () => {
      const refId = generateRefId("42");
      const hex = refId.split("-").pop()!;
      expect(hex).toHaveLength(8);
      expect(/^[0-9a-f]+$/.test(hex)).toBe(true);
    });
  });

  // -------------------------------------------------------------------------
  // Signature Validation
  // -------------------------------------------------------------------------
  describe("Signature validation", () => {
    const SECRET = "test-secret-key-xforgea";

    it("valid HMAC matches", () => {
      const hashStr = "XF-100-1700000000-abcd1234" + "149.90" + "success";
      const hash = calculateHash(hashStr, SECRET);
      const result = verifySignature(
        { merchant_oid: "XF-100-1700000000-abcd1234", total_amount: "149.90", status: "success" },
        hash,
        SECRET,
        false
      );
      expect(result.valid).toBe(true);
    });

    it("tampered amount fails", () => {
      const hashStr = "XF-100-1700000000-abcd1234" + "149.90" + "success";
      const hash = calculateHash(hashStr, SECRET);
      const result = verifySignature(
        { merchant_oid: "XF-100-1700000000-abcd1234", total_amount: "999.99", status: "success" },
        hash,
        SECRET,
        false
      );
      expect(result.valid).toBe(false);
      expect(result.statusCode).toBe(403);
    });

    it("tampered refId fails", () => {
      const hashStr = "XF-100-1700000000-abcd1234" + "149.90" + "success";
      const hash = calculateHash(hashStr, SECRET);
      const result = verifySignature(
        { merchant_oid: "XF-TAMPERED-1700000000-abcd1234", total_amount: "149.90", status: "success" },
        hash,
        SECRET,
        false
      );
      expect(result.valid).toBe(false);
      expect(result.statusCode).toBe(403);
    });

    it("missing hash with secret key configured returns 400", () => {
      const result = verifySignature(
        { merchant_oid: "XF-100-1700000000-abcd1234", total_amount: "149.90", status: "success" },
        undefined,
        SECRET,
        false
      );
      expect(result.valid).toBe(false);
      expect(result.statusCode).toBe(400);
      expect(result.error).toBe("Missing signature hash");
    });

    it("no secret key in test mode skips validation", () => {
      const result = verifySignature(
        { merchant_oid: "XF-100-1700000000-abcd1234", total_amount: "149.90", status: "success" },
        undefined,
        undefined,
        false
      );
      expect(result.valid).toBe(true);
    });

    it("no secret key in production returns 500", () => {
      const result = verifySignature(
        { merchant_oid: "XF-100-1700000000-abcd1234", total_amount: "149.90", status: "success" },
        "somehash",
        undefined,
        true
      );
      expect(result.valid).toBe(false);
      expect(result.statusCode).toBe(500);
    });

    it("tampered status fails", () => {
      const hashStr = "XF-100-1700000000-abcd1234" + "149.90" + "success";
      const hash = calculateHash(hashStr, SECRET);
      const result = verifySignature(
        { merchant_oid: "XF-100-1700000000-abcd1234", total_amount: "149.90", status: "failed" },
        hash,
        SECRET,
        false
      );
      expect(result.valid).toBe(false);
    });

    it("hash is base64 encoded", () => {
      const hash = calculateHash("test", SECRET);
      // base64 contains only A-Z, a-z, 0-9, +, /, =
      expect(hash).toMatch(/^[A-Za-z0-9+/]+=*$/);
    });

    it("empty string hash input produces valid base64", () => {
      const hash = calculateHash("", SECRET);
      expect(hash.length).toBeGreaterThan(0);
      expect(hash).toMatch(/^[A-Za-z0-9+/]+=*$/);
    });
  });

  // -------------------------------------------------------------------------
  // Payment Status Mapping
  // -------------------------------------------------------------------------
  describe("Payment status mapping", () => {
    it('"success" maps to isSuccess=true', () => {
      expect(isPaymentSuccess("success")).toBe(true);
    });

    it('"completed" maps to isSuccess=true', () => {
      expect(isPaymentSuccess("completed")).toBe(true);
    });

    it('"paid" maps to isSuccess=true', () => {
      expect(isPaymentSuccess("paid")).toBe(true);
    });

    it('"failed" maps to isSuccess=false', () => {
      expect(isPaymentSuccess("failed")).toBe(false);
    });

    it('"declined" maps to isSuccess=false', () => {
      expect(isPaymentSuccess("declined")).toBe(false);
    });

    it('"error" maps to isSuccess=false', () => {
      expect(isPaymentSuccess("error")).toBe(false);
    });

    it("null maps to isSuccess=false", () => {
      expect(isPaymentSuccess(null)).toBe(false);
    });

    it("undefined maps to isSuccess=false", () => {
      expect(isPaymentSuccess(undefined)).toBe(false);
    });

    it("empty string maps to isSuccess=false", () => {
      expect(isPaymentSuccess("")).toBe(false);
    });

    it("case-insensitive: SUCCESS maps to true", () => {
      expect(isPaymentSuccess("SUCCESS")).toBe(true);
    });

    it("case-insensitive: Completed maps to true", () => {
      expect(isPaymentSuccess("Completed")).toBe(true);
    });

    it("whitespace-trimmed: ' success ' maps to true", () => {
      expect(isPaymentSuccess(" success ")).toBe(true);
    });

    it('"pending" maps to isSuccess=false', () => {
      expect(isPaymentSuccess("pending")).toBe(false);
    });

    it("random garbage maps to isSuccess=false", () => {
      expect(isPaymentSuccess("asdf1234")).toBe(false);
    });
  });

  // -------------------------------------------------------------------------
  // Idempotency
  // -------------------------------------------------------------------------
  describe("Idempotency", () => {
    const paidPayment: PaymentRecord = {
      id: "pay-1",
      refId: "XF-100-1700000000-abcd1234",
      orderId: "order-1",
      amount: 149.9,
      status: "Paid",
      createdAt: new Date(),
    };

    it("already processed payment returns 200 without re-processing", () => {
      const result = processCallback(
        { merchant_oid: paidPayment.refId, status: "success" },
        paidPayment,
        undefined,
        false
      );
      expect(result.statusCode).toBe(200);
      expect(result.message).toBe("Already processed");
      expect(result.updatedPayment).toBeUndefined();
      expect(result.updatedOrder).toBeUndefined();
    });

    it("double callback does not double-update", () => {
      const first = processCallback(
        { merchant_oid: paidPayment.refId, status: "success" },
        paidPayment,
        undefined,
        false
      );
      const second = processCallback(
        { merchant_oid: paidPayment.refId, status: "success" },
        paidPayment,
        undefined,
        false
      );
      expect(first.statusCode).toBe(200);
      expect(second.statusCode).toBe(200);
      expect(first.shouldNotifyAdmin).toBeUndefined();
      expect(second.shouldNotifyAdmin).toBeUndefined();
    });

    it("idempotent even when callback sends different status", () => {
      const result = processCallback(
        { merchant_oid: paidPayment.refId, status: "failed" },
        paidPayment,
        undefined,
        false
      );
      expect(result.statusCode).toBe(200);
      expect(result.message).toBe("Already processed");
    });
  });

  // -------------------------------------------------------------------------
  // Field Extraction
  // -------------------------------------------------------------------------
  describe("Field extraction", () => {
    it("extracts from merchant_oid", () => {
      expect(extractRefId({ merchant_oid: "XF-100" })).toBe("XF-100");
    });

    it("extracts from order_id", () => {
      expect(extractRefId({ order_id: "XF-200" })).toBe("XF-200");
    });

    it("extracts from refId", () => {
      expect(extractRefId({ refId: "XF-300" })).toBe("XF-300");
    });

    it("prefers merchant_oid over order_id", () => {
      expect(extractRefId({ merchant_oid: "XF-A", order_id: "XF-B", refId: "XF-C" })).toBe("XF-A");
    });

    it("prefers order_id over refId when merchant_oid absent", () => {
      expect(extractRefId({ order_id: "XF-B", refId: "XF-C" })).toBe("XF-B");
    });

    it("returns undefined when all fields missing", () => {
      expect(extractRefId({ foo: "bar" })).toBeUndefined();
    });

    it("returns undefined for empty object", () => {
      expect(extractRefId({})).toBeUndefined();
    });

    it("ignores null merchant_oid, falls to order_id", () => {
      // nullish coalescing: null ?? order_id → order_id
      expect(extractRefId({ merchant_oid: null, order_id: "XF-B" })).toBe("XF-B");
    });

    it("handles 0 as merchant_oid (falsy but not nullish)", () => {
      // ?? only skips null/undefined, not 0
      expect(extractRefId({ merchant_oid: 0 as any, order_id: "XF-B" })).toBe(0 as any);
    });
  });

  // -------------------------------------------------------------------------
  // Callback Body Parsing
  // -------------------------------------------------------------------------
  describe("Callback body parsing", () => {
    const pendingPayment: PaymentRecord = {
      id: "pay-2",
      refId: "XF-200-1700000000-deadbeef",
      orderId: "order-2",
      amount: 59.99,
      status: "Pending",
      createdAt: new Date(),
    };

    it("JSON body with merchant_oid processes correctly", () => {
      const result = processCallback(
        { merchant_oid: pendingPayment.refId, status: "success", total_amount: "59.99" },
        pendingPayment,
        undefined,
        false
      );
      expect(result.statusCode).toBe(200);
      expect(result.updatedPayment?.status).toBe("Paid");
    });

    it("missing all ref fields returns 400", () => {
      const result = processCallback({ status: "success" }, pendingPayment, undefined, false);
      expect(result.statusCode).toBe(400);
      expect(result.message).toBe("Missing refId");
    });

    it("payment not found returns 404", () => {
      const result = processCallback(
        { merchant_oid: "XF-NONEXIST" },
        null,
        undefined,
        false
      );
      expect(result.statusCode).toBe(404);
    });

    it("successful payment triggers admin notification flag", () => {
      const result = processCallback(
        { merchant_oid: pendingPayment.refId, status: "success" },
        pendingPayment,
        undefined,
        false
      );
      expect(result.shouldNotifyAdmin).toBe(true);
    });

    it("failed payment does NOT trigger admin notification", () => {
      const result = processCallback(
        { merchant_oid: pendingPayment.refId, status: "declined" },
        pendingPayment,
        undefined,
        false
      );
      expect(result.shouldNotifyAdmin).toBeUndefined();
    });

    it("invalid signature marks payment as Denied", () => {
      const result = processCallback(
        { merchant_oid: pendingPayment.refId, status: "success", hash: "INVALID", total_amount: "59.99" },
        pendingPayment,
        "real-secret",
        false
      );
      expect(result.statusCode).toBe(403);
      expect(result.updatedPayment?.status).toBe("Denied");
    });
  });

  // -------------------------------------------------------------------------
  // Redirect URLs
  // -------------------------------------------------------------------------
  describe("Redirect URLs", () => {
    const payment: PaymentRecord = {
      id: "pay-3",
      refId: "XF-300-1700000000-cafebabe",
      orderId: "order-3",
      amount: 299.0,
      status: "Paid",
      createdAt: new Date(),
    };

    it("success redirect URL format", () => {
      const url = buildRedirectUrl(payment.refId, payment, undefined, false, true);
      expect(url).toBe("/profile?payment=success&order=order-3");
    });

    it("failure redirect URL format", () => {
      const url = buildRedirectUrl(payment.refId, payment, "fail", false, true);
      expect(url).toBe("/payment/order-3?error=payment_failed");
    });

    it("missing refId redirects to /profile", () => {
      const url = buildRedirectUrl(undefined, payment, undefined, false, true);
      expect(url).toBe("/profile");
    });

    it("payment not found redirects to /profile", () => {
      const url = buildRedirectUrl("XF-XXX", null, undefined, false, true);
      expect(url).toBe("/profile");
    });

    it("mock payment in production redirects to /profile (blocked)", () => {
      const url = buildRedirectUrl(payment.refId, payment, undefined, true, false);
      expect(url).toBe("/profile");
    });

    it("mock payment in development succeeds", () => {
      const url = buildRedirectUrl(payment.refId, payment, undefined, true, true);
      expect(url).toBe("/profile?payment=success&order=order-3");
    });
  });

  // -------------------------------------------------------------------------
  // Tax and Financial Calculations
  // -------------------------------------------------------------------------
  describe("Tax and financial calculations", () => {
    it("amount formatting with toFixed(2)", () => {
      expect(formatAmount(149.9)).toBe("149.90");
    });

    it("whole number formatted correctly", () => {
      expect(formatAmount(100)).toBe("100.00");
    });

    it("large payment amount", () => {
      expect(formatAmount(999999.99)).toBe("999999.99");
    });

    it("small payment amount 0.01 TL", () => {
      expect(formatAmount(0.01)).toBe("0.01");
    });

    it("floating point edge case 0.1 + 0.2", () => {
      // JavaScript classic: 0.1 + 0.2 = 0.30000000000000004
      // toFixed(2) should handle it
      expect(formatAmount(0.1 + 0.2)).toBe("0.30");
    });

    it("zero amount", () => {
      expect(formatAmount(0)).toBe("0.00");
    });

    it("three decimal places are rounded", () => {
      expect(formatAmount(99.999)).toBe("100.00");
    });

    it("negative amount (refund scenario)", () => {
      expect(formatAmount(-50.5)).toBe("-50.50");
    });
  });

  // -------------------------------------------------------------------------
  // Initiate Validation
  // -------------------------------------------------------------------------
  describe("Initiate validation", () => {
    const validOrder: Order = {
      id: "order-10",
      number: "10042",
      userId: "user-1",
      paid: false,
      totalAmount: 250.0,
    };
    const alwaysValid = () => true;
    const alwaysInvalid = () => false;

    it("missing userId returns 401", () => {
      const r = validateInitiate(undefined, "order-10", validOrder, undefined, alwaysValid);
      expect(r.ok).toBe(false);
      expect(r.statusCode).toBe(401);
    });

    it("missing orderId returns 400", () => {
      const r = validateInitiate("user-1", undefined, validOrder, undefined, alwaysValid);
      expect(r.ok).toBe(false);
      expect(r.statusCode).toBe(400);
    });

    it("CSRF token present but invalid returns 403", () => {
      const r = validateInitiate("user-1", "order-10", validOrder, "bad-token", alwaysInvalid);
      expect(r.ok).toBe(false);
      expect(r.statusCode).toBe(403);
    });

    it("CSRF token missing is OK (soft enforcement)", () => {
      const r = validateInitiate("user-1", "order-10", validOrder, undefined, alwaysInvalid);
      expect(r.ok).toBe(true);
    });

    it("order not found returns 404", () => {
      const r = validateInitiate("user-1", "order-10", null, undefined, alwaysValid);
      expect(r.ok).toBe(false);
      expect(r.statusCode).toBe(404);
    });

    it("order belongs to different user returns 403", () => {
      const r = validateInitiate("user-OTHER", "order-10", validOrder, undefined, alwaysValid);
      expect(r.ok).toBe(false);
      expect(r.statusCode).toBe(403);
    });

    it("order already paid returns 400", () => {
      const paidOrder = { ...validOrder, paid: true };
      const r = validateInitiate("user-1", "order-10", paidOrder, undefined, alwaysValid);
      expect(r.ok).toBe(false);
      expect(r.statusCode).toBe(400);
    });

    it("valid request passes all checks", () => {
      const r = validateInitiate("user-1", "order-10", validOrder, undefined, alwaysValid);
      expect(r.ok).toBe(true);
    });

    it("valid request with valid CSRF passes", () => {
      const r = validateInitiate("user-1", "order-10", validOrder, "good-token", alwaysValid);
      expect(r.ok).toBe(true);
    });
  });

  // -------------------------------------------------------------------------
  // Live vs Test Mode
  // -------------------------------------------------------------------------
  describe("Live vs test mode", () => {
    it("all keys present = live mode", () => {
      expect(
        isLiveMode({
          PAYMENT_API_KEY: "pk_live_xxx",
          PAYMENT_SECRET_KEY: "sk_live_xxx",
          PAYMENT_MERCHANT_ID: "m_123",
        })
      ).toBe(true);
    });

    it("missing API key = test mode", () => {
      expect(
        isLiveMode({ PAYMENT_SECRET_KEY: "sk", PAYMENT_MERCHANT_ID: "m" })
      ).toBe(false);
    });

    it("missing secret key = test mode", () => {
      expect(
        isLiveMode({ PAYMENT_API_KEY: "pk", PAYMENT_MERCHANT_ID: "m" })
      ).toBe(false);
    });

    it("missing merchant ID = test mode", () => {
      expect(
        isLiveMode({ PAYMENT_API_KEY: "pk", PAYMENT_SECRET_KEY: "sk" })
      ).toBe(false);
    });

    it("all empty = test mode", () => {
      expect(isLiveMode({})).toBe(false);
    });

    it("empty string values = test mode", () => {
      expect(
        isLiveMode({ PAYMENT_API_KEY: "", PAYMENT_SECRET_KEY: "", PAYMENT_MERCHANT_ID: "" })
      ).toBe(false);
    });
  });

  // -------------------------------------------------------------------------
  // Full Callback Flow (integration-style)
  // -------------------------------------------------------------------------
  describe("Full callback flow", () => {
    const SECRET = "integration-test-secret";
    const pendingPayment: PaymentRecord = {
      id: "pay-flow-1",
      refId: "XF-500-1700000000-1a2b3c4d",
      orderId: "order-flow-1",
      amount: 199.99,
      status: "Pending",
      createdAt: new Date(),
    };

    it("successful payment with valid signature marks paid and notifies admin", () => {
      const hashStr = `${pendingPayment.refId}199.99success`;
      const hash = calculateHash(hashStr, SECRET);
      const result = processCallback(
        { merchant_oid: pendingPayment.refId, status: "success", total_amount: "199.99", hash },
        pendingPayment,
        SECRET,
        false
      );
      expect(result.statusCode).toBe(200);
      expect(result.updatedPayment?.status).toBe("Paid");
      expect(result.updatedOrder?.paid).toBe(true);
      expect(result.shouldNotifyAdmin).toBe(true);
    });

    it("failed payment with valid signature marks as Failed", () => {
      const hashStr = `${pendingPayment.refId}199.99failed`;
      const hash = calculateHash(hashStr, SECRET);
      const result = processCallback(
        { merchant_oid: pendingPayment.refId, status: "failed", total_amount: "199.99", hash },
        pendingPayment,
        SECRET,
        false
      );
      expect(result.statusCode).toBe(200);
      expect(result.updatedPayment?.status).toBe("Failed");
      expect(result.updatedOrder).toBeUndefined();
    });

    it("production callback without secret key returns 500", () => {
      const result = processCallback(
        { merchant_oid: pendingPayment.refId, status: "success", total_amount: "199.99", hash: "x" },
        pendingPayment,
        undefined,
        true
      );
      expect(result.statusCode).toBe(500);
    });

    it("test mode callback without secret key processes successfully", () => {
      const result = processCallback(
        { merchant_oid: pendingPayment.refId, status: "completed" },
        pendingPayment,
        undefined,
        false
      );
      expect(result.statusCode).toBe(200);
      expect(result.updatedPayment?.status).toBe("Paid");
    });
  });
});
