import crypto from 'crypto';

/**
 * Verify Razorpay signature to ensure payment authenticity
 * @param {string} orderId - Razorpay order ID
 * @param {string} paymentId - Razorpay payment ID
 * @param {string} signature - Razorpay signature from payment response
 * @param {string} secretKey - RAZORPAY_KEY_SECRET from environment
 * @returns {boolean} - True if signature is valid, false otherwise
 */
export const verifyRazorpaySignature = (orderId, paymentId, signature, secretKey) => {
  if (!orderId || !paymentId || !signature || !secretKey) {
    console.error('Missing required parameters for signature verification');
    return false;
  }

  try {
    // Generate signature: SHA256(order_id|payment_id, secret_key)
    const body = `${orderId}|${paymentId}`;
    const expectedSignature = crypto
      .createHmac('sha256', secretKey)
      .update(body)
      .digest('hex');

    // Constant-time comparison to prevent timing attacks
    const isValid = crypto.timingSafeEqual(
      Buffer.from(expectedSignature),
      Buffer.from(signature)
    );

    return isValid;
  } catch (error) {
    console.error('Signature verification error:', error);
    return false;
  }
};

/**
 * Validate payment amount hasn't been tampered with
 * @param {number} expectedAmount - Amount in paise (e.g., 50000 for ₹500)
 * @param {number} receivedAmount - Amount received from payment
 * @returns {boolean} - True if amounts match
 */
export const validatePaymentAmount = (expectedAmount, receivedAmount) => {
  return expectedAmount === receivedAmount;
};

export default {
  verifyRazorpaySignature,
  validatePaymentAmount,
};
