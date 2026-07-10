import crypto from "crypto";

export const verifyRazorpaySignature = (
  orderId,
  paymentId,
  signature,
  secretKey,
) => {
  if (!orderId || !paymentId || !signature || !secretKey) {
    console.error("Missing required parameters for signature verification");
    return false;
  }

  try {
    const body = `${orderId}|${paymentId}`;
    const expectedSignature = crypto
      .createHmac("sha256", secretKey)
      .update(body)
      .digest("hex");

    const isValid = crypto.timingSafeEqual(
      Buffer.from(expectedSignature),
      Buffer.from(signature),
    );

    return isValid;
  } catch (error) {
    console.error("Signature verification error:", error);
    return false;
  }
};

export const validatePaymentAmount = (expectedAmount, receivedAmount) => {
  return expectedAmount === receivedAmount;
};

export default {
  verifyRazorpaySignature,
  validatePaymentAmount,
};
