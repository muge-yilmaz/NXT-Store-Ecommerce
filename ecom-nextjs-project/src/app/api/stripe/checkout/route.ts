// localhost:3000/stripe/checkout
import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { stripe } from '@/lib/stripe';
import { z } from 'zod';
import { requireUserOr401 } from '@/lib/auth0-utils';


const CheckoutSchema = z.object({
  cartItems: z.array(
    z.object({
      stripePriceId: z.string(),
      quantity: z.number().int().min(1),
    })
  ).min(1, "Cart cannot be empty"),
});

export async function POST(req: NextRequest) {
  try {
    const headersList = await headers()
    const origin = headersList.get('origin')

    // Check requireUserOr401
    const userOrResponse = await requireUserOr401();
    if (userOrResponse instanceof Response) {
      return userOrResponse; // If the user is not authenticated, return the 401 response directly
    }

    const user = userOrResponse;

    // Validate the request body against the schema
    const body = await req.json().catch(() => ({}));

    const parsed = CheckoutSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid cart data", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { cartItems } = parsed.data;

    const lineItems = cartItems.map(item => ({
      price: item.stripePriceId,
      quantity: item.quantity,
    }));


    const session = await stripe.checkout.sessions.create({
      line_items: lineItems,
      mode: 'payment',
      client_reference_id: (user as any)?.sub || (user as any)?.email || undefined,
      metadata: {
        userId: (user as any)?.sub || "",
        userEmail: (user as any)?.email || "",
      },
      success_url: `${origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/`,
    });


    if (!session.url) {
      return NextResponse.json(
        { error: "Stripe checkout session URL is missing." },
        { status: 500 }
      );
    }

    return NextResponse.json({ url: session.url });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message },
      { status: err.statusCode || 500 }
    )
  }
}