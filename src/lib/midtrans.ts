import midtransClient from 'midtrans-client';
import crypto from 'crypto';

export interface CreateSnapTransactionParams {
  orderNumber: string;
  grossAmount: number;
  customerDetails: {
    first_name: string;
    email: string;
    phone: string;
  };
  itemDetails: Array<{
    id: string;
    price: number;
    quantity: number;
    name: string;
  }>;
}

export interface SnapTransactionResult {
  token: string;
  redirect_url: string;
}

export interface MidtransNotificationPayload {
  order_id: string;
  status_code: string;
  gross_amount: string;
  signature_key: string;
  transaction_status: string;
  fraud_status?: string;
  payment_type?: string;
  transaction_id?: string;
  transaction_time?: string;
  settlement_time?: string;
  [key: string]: unknown;
}

function getMidtransConfig() {
  const serverKey = process.env.MIDTRANS_SERVER_KEY;
  const clientKey = process.env.MIDTRANS_CLIENT_KEY;
  const isProduction = process.env.MIDTRANS_IS_PRODUCTION === 'true';

  if (!serverKey || !clientKey) {
    throw new Error(
      'Midtrans configuration missing: MIDTRANS_SERVER_KEY and MIDTRANS_CLIENT_KEY must be configured in environment variables.'
    );
  }

  return { serverKey, clientKey, isProduction };
}

/**
 * Creates a Midtrans Snap payment transaction token and redirect URL.
 */
export async function createSnapTransaction(
  params: CreateSnapTransactionParams
): Promise<SnapTransactionResult> {
  const { serverKey, clientKey, isProduction } = getMidtransConfig();

  const snap = new midtransClient.Snap({
    isProduction,
    serverKey,
    clientKey,
  });

  const parameter = {
    transaction_details: {
      order_id: params.orderNumber,
      gross_amount: params.grossAmount,
    },
    credit_card: {
      secure: true,
    },
    customer_details: {
      first_name: params.customerDetails.first_name,
      email: params.customerDetails.email,
      phone: params.customerDetails.phone,
    },
    item_details: params.itemDetails,
  };

  const response = (await snap.createTransaction(parameter)) as SnapTransactionResult;
  return response;
}

/**
 * Verifies SHA-512 signature key sent by Midtrans webhook payload.
 * SHA-512(order_id + status_code + gross_amount + ServerKey)
 */
export function verifySignature(
  orderId: string,
  statusCode: string,
  grossAmount: string,
  signatureKey: string
): boolean {
  const serverKey = process.env.MIDTRANS_SERVER_KEY;
  if (!serverKey) {
    return false;
  }

  const payload = `${orderId}${statusCode}${grossAmount}${serverKey}`;
  const calculatedSignature = crypto.createHash('sha512').update(payload).digest('hex');

  return calculatedSignature === signatureKey;
}

/**
 * Parses and verifies Midtrans HTTP notification request.
 */
export async function verifyNotification(
  notificationPayload: MidtransNotificationPayload
): Promise<MidtransNotificationPayload> {
  const { serverKey, clientKey, isProduction } = getMidtransConfig();

  const snap = new midtransClient.Snap({
    isProduction,
    serverKey,
    clientKey,
  });

  const statusResponse = (await snap.transaction.notification(
    notificationPayload
  )) as MidtransNotificationPayload;

  return statusResponse;
}

/**
 * Checks actual transaction status directly from Midtrans API by order_id.
 */
export async function getTransactionStatus(
  orderId: string
): Promise<MidtransNotificationPayload> {
  const { serverKey, clientKey, isProduction } = getMidtransConfig();

  const snap = new midtransClient.Snap({
    isProduction,
    serverKey,
    clientKey,
  });

  const statusResponse = (await snap.transaction.status(orderId)) as MidtransNotificationPayload;
  return statusResponse;
}
