import { Stripe } from "stripe";
import { stripe } from "@/lib/stripe";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { db } from "@/db/drizzle";
import { userSubscription } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function POST(req: Request) {
  const body = await req.text();
  const signature = (await headers()).get("Stripe-Signature") as string;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (error) {
    return new NextResponse(`Webhook error: ${error.message}`, { status: 400 });
  }

  // Handle checkout.session.completed
  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session; // Correct type for this block
    const subscription = await stripe.subscriptions.retrieve(
      session.subscription as string
    );

    if (!session.metadata?.userId) {
      return new NextResponse(
        "User ID is required in session metadata for checkout.session.completed",
        { status: 400 }
      );
    }

    await db.insert(userSubscription).values({
      userId: session.metadata.userId,
      stripeSubscriptionId: subscription.id,
      stripeCustomerId: subscription.customer as string,
      stripePriceId: subscription.items.data[0].price.id,
      stripeCurrentPeriodEnd: new Date(subscription.current_period_end * 1000),
    });
  }
  // Handle invoice.payment_succeeded for subscription renewals
  else if (event.type === "invoice.payment_succeeded") {
    const invoice = event.data.object as Stripe.Invoice; // Correct type for this block

    // Ensure it's a subscription payment, not for other invoice items
    if (invoice.subscription && typeof invoice.subscription === "string") {
      const subscription = await stripe.subscriptions.retrieve(
        invoice.subscription as string
      );

      // We need userId to update the correct userSubscription record.
      // This usually means the original checkout session should have stored the userId
      // with the stripeCustomerId, or the subscription metadata has userId.
      // For simplicity, this example assumes we can identify the user from the subscription.id
      // but often you'd query userSubscription by stripeSubscriptionId.

      await db
        .update(userSubscription)
        .set({
          stripePriceId: subscription.items.data[0].price.id,
          stripeCurrentPeriodEnd: new Date(
            subscription.current_period_end * 1000
          ),
        })
        .where(eq(userSubscription.stripeSubscriptionId, subscription.id));
    } else {
      // It's an invoice for something other than a subscription we track here, or subscription ID is missing.
      // You might want to log this or handle it differently.
      return new NextResponse(
        "Invoice payment succeeded but no subscription ID found or not a subscription invoice.",
        { status: 200 }
      ); // 200 to acknowledge receipt to Stripe
    }
  }

  return new NextResponse(null, { status: 200 });
}
