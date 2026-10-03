import { Request, Response } from 'express'
import { endpointSecret, stripe } from '../../../common/stripe'
import checkoutService from '../../../services/checkout/service';
import Stripe from 'stripe'

async function receiveUpdates(req: Request, res: Response): Promise<void> {
  console.log('Reached Stripe Webhoooks receive updates function')


  // 1. Signature Verification
  // STRIPE_WEBHOOK_SECRET Kontrolü (İmzasız istekleri engeller)
  if (!endpointSecret) {
    console.error('STRIPE_WEBHOOK_SECRET is missing!');
    res.status(500).json({ error: 'Webhook secret is not configured' });
    return;
  }

  // 2. Stripe Signature Kontrolü
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


  // 2. Handle Events (Olayları İşleme)
  try {
    switch (event.type) {
      // Başarılı Ödeme
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        console.log(`Checkout Session ${session.id} was successful!`);

        // Servisi çağırıp başarılı ödeme mantığını yürütüyoruz
        await checkoutService.handleSuccessfullCheckout(session.id);
        break;
      }

      // Süresi Dolan Ödeme Oturumu
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

      // Para İadesi İşlemi
      case 'charge.refunded': {
        const charge = event.data.object as Stripe.Charge;
        console.log(`Charge ${charge.id} was refunded.`)

        // service.ts dosyasındaki handleRefund fonksiyonumuzu çağırıyoruz
        await checkoutService.handleRefund(charge.id);
        break;
      }

      // Müşteri Bilgisi Güncelleme
      case 'customer.updated': {
        const customer = event.data.object as Stripe.Customer;
        console.log(`Customer update event received for ID: ${customer.id}`);
        await checkoutService.handleCustomerUpdated(customer.id);
        break;
      }

      // Ödeme İtirazı / Chargeback (Admin için kritik)
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

// Frontend'deki "Pay Total" Butonuna Basılınca Ödeme Linki Üreten Fonksiyon
async function createCheckout(req: Request, res: Response): Promise<void> {
  try {
    const { cartItems } = req.body;

    if (!cartItems || !Array.isArray(cartItems) || cartItems.length === 0) {
      res.status(400).json({ error: 'Cart is empty' });
      return;
    }

    // Stripe üzerinde güvenli ödeme oturumu başlatıyoruz
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: cartItems.map((item: any) => ({
        price: item.stripePriceId, // Sepetteki ürünün Stripe Price ID'si
        quantity: item.quantity,
      })),
      mode: 'payment',
      success_url: 'http://localhost:3000/checkout/success', // Ödeme bitince gidilecek sayfa
      cancel_url: 'http://localhost:3000',
    });

    // Stripe Ödeme Linkini Front-end'e Döneceğiz
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