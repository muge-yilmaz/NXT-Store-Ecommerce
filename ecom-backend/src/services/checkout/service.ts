import { stripe } from '../../common/stripe';

async function updateStockAfterPurchase(sessionId: string) {
  // We retrieve the checkout session to get the line items
  const checkoutSession = await stripe.checkout.sessions.retrieve(sessionId, {
    expand: ['line_items'],
  })

  const lineItems = checkoutSession?.line_items?.data || []
  console.log(`Updating stock for session: ${sessionId}`);

  lineItems.forEach((item) => {
    console.log(`Product: ${item.description || item.price?.product} | Quantity Sold: ${item.quantity}`
    )
  })
}


async function restockAfterRefund(chargeId: string) {
  console.log(`Restocking items for refunded charge: ${chargeId}`);
}


async function handleSuccessfullCheckout(checkoutSessionId: string) {
  console.log(`[SERVICE] 🛍️ Processing successful checkout: ${checkoutSessionId}`)

  await updateStockAfterPurchase(checkoutSessionId);
}


async function handleRefund(chargeId: string) {
  console.log(`Charge ${chargeId} was refunded.`)

  await restockAfterRefund(chargeId);
}


async function handleProductUpdated(productId: string) {
  console.log(`Stripe product ${productId} updated.`)
}


async function handleProductDeleted(productId: string) {
  console.log(`Stripe product ${productId} was deleted.`);
}


async function handlePriceCreatedOrUpdated(priceId: string) {
  console.log(`Stripe price ${priceId} created or updated.`)
}


async function handleCustomerUpdated(customerId: string) {
  console.log(`Customer ${customerId} profile updated.`)
}

async function handleDisputeCreated(disputeId: string) {
  console.log(`Urgent: Chargeback/Dispute created: ${disputeId}`)
}


export default {
  handleSuccessfullCheckout,
  handleRefund,
  handleProductUpdated,
  handleProductDeleted,
  handlePriceCreatedOrUpdated,
  handleCustomerUpdated,
  handleDisputeCreated,
  updateStockAfterPurchase,
  restockAfterRefund,
}