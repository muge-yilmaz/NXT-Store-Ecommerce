import { Request, Response } from 'express'
import { endpointSecret, stripe } from '../../../common/stripe'
import checkoutService from '../../../services/checkout/service';
import Stripe from 'stripe'

async function receiveUpdates(req: Request, res: Response): Promise<void> {
  console.log('Reached Stripe Webhoooks receive updates function')

  // 1. Signature Verification
  if (!endpointSecret) {
    console.error('STRIPE_WEBHOOK_SECRET is missing!');
    res.status(500).json({ error: 'Webhook secret is not configured' });
    return;
  }

  // 2. Stripe Signature Verification
  const signature = req.headers['stripe-signature'];
  if (!signature || Array.isArray(signature)) {
    console.log('Stripe signature missing or invalid header.');
    res.status(400).send('Missing signature');
    return;
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      signature,
      endpointSecret
    );
  } catch (err: any) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown signature error';
    console.log(`Webhook signature verification failed:`, errorMessage);
    res.status(400).send(`Webhook Error: ${errorMessage}`);
    return;
  }


  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        console.log(`Checkout Session ${session.id} was successful!`);

        await checkoutService.handleSuccessfullCheckout(session.id);
        break;
      }

      case 'checkout.session.expired': {
        const session = event.data.object as Stripe.Checkout.Session;
        console.log(`Checkout Session ${session.id} expired.`)
        break;
      }

      case 'checkout.session.async_payment_failed': {
        const session = event.data.object as Stripe.Checkout.Session;
        console.log(`Async Payment failed for Checkout Session ${session.id}.`)
        break;
      }

      case 'checkout.session.async_payment_succeeded': {
        const session = event.data.object as Stripe.Checkout.Session;
        console.log(`Async Payment succeeded for Checkout Session ${session.id}.`)
        break;
      }

      case 'charge.refunded': {
        const charge = event.data.object as Stripe.Charge;
        console.log(`Charge ${charge.id} was refunded.`)

        await checkoutService.handleRefund(charge.id);
        break;
      }

      case 'customer.updated': {
        const customer = event.data.object as Stripe.Customer;
        console.log(`Customer update event received for ID: ${customer.id}`);
        await checkoutService.handleCustomerUpdated(customer.id);
        break;
      }

      // Chargeback
      case 'charge.dispute.created': {
        const dispute = event.data.object as Stripe.Dispute;
        console.log(`Dispute created event received for ID: ${dispute.id}`);
        await checkoutService.handleDisputeCreated(dispute.id);
        break;
      }


      default:
        console.log(`Unhandled event type ${event.type}.`);
    }
  } catch (processErr) {
    console.error('Error processing webhook event:', processErr);
  }

  res.status(200).json({ received: true });
}

async function createCheckout(req: Request, res: Response): Promise<void> {
  try {
    const { cartItems } = req.body;

    if (!cartItems || !Array.isArray(cartItems) || cartItems.length === 0) {
      res.status(400).json({ error: 'Cart is empty' });
      return;
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: cartItems.map((item: any) => ({
        price: item.stripePriceId,
        quantity: item.quantity,
      })),
      mode: 'payment',
      success_url: 'http://localhost:3000/checkout/success',
      cancel_url: 'http://localhost:3000',
    });


    res.status(200).json({ url: session.url });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Checkout error';
    console.error('Checkout error:', errorMessage);
    res.status(500).json({ error: errorMessage });
  }
}

export default {
  receiveUpdates,
  createCheckout,
}