import { getUserProgress, getUserSubscription } from "@/db/queries";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

const DebugSubscriptionPage = async () => {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const userProgress = await getUserProgress();
  const userSubscription = await getUserSubscription();

  const currentTime = new Date();
  const DAY_IN_MS = 86_400_000;

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Subscription Debug Info</h1>

      <div className="grid gap-6">
        {/* User Info */}
        <div className="border rounded-lg p-4">
          <h2 className="text-xl font-semibold mb-2">User Information</h2>
          <p>
            <strong>User ID:</strong> {userId}
          </p>
          <p>
            <strong>Hearts:</strong> {userProgress?.hearts || "Not found"}
          </p>
          <p>
            <strong>Points:</strong> {userProgress?.points || "Not found"}
          </p>
        </div>

        {/* Subscription Status */}
        <div className="border rounded-lg p-4">
          <h2 className="text-xl font-semibold mb-2">Subscription Status</h2>
          {userSubscription ? (
            <div className="space-y-2">
              <p>
                <strong>Has Subscription:</strong> ✅ Yes
              </p>
              <p>
                <strong>Is Active:</strong>{" "}
                {userSubscription.isActive ? "✅ Active" : "❌ Inactive"}
              </p>
              <p>
                <strong>Stripe Customer ID:</strong>{" "}
                {userSubscription.stripeCustomerId}
              </p>
              <p>
                <strong>Stripe Subscription ID:</strong>{" "}
                {userSubscription.stripeSubscriptionId}
              </p>
              <p>
                <strong>Stripe Price ID:</strong>{" "}
                {userSubscription.stripePriceId}
              </p>
              <p>
                <strong>Current Period End:</strong>{" "}
                {userSubscription.stripeCurrentPeriodEnd?.toISOString()}
              </p>

              {userSubscription.stripeCurrentPeriodEnd && (
                <div className="mt-4 p-3 bg-gray-100 rounded">
                  <h3 className="font-semibold">Time Analysis:</h3>
                  <p>
                    <strong>Current Time:</strong> {currentTime.toISOString()}
                  </p>
                  <p>
                    <strong>Period End:</strong>{" "}
                    {userSubscription.stripeCurrentPeriodEnd.toISOString()}
                  </p>
                  <p>
                    <strong>Time Until Expiry:</strong>{" "}
                    {Math.round(
                      (userSubscription.stripeCurrentPeriodEnd.getTime() +
                        DAY_IN_MS -
                        Date.now()) /
                        (1000 * 60 * 60 * 24)
                    )}{" "}
                    days
                  </p>
                  <p>
                    <strong>Is Period End + 1 Day Now:</strong>{" "}
                    {userSubscription.stripeCurrentPeriodEnd.getTime() +
                      DAY_IN_MS >
                    Date.now()
                      ? "✅ Yes"
                      : "❌ No"}
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div>
              <p>
                <strong>Has Subscription:</strong> ❌ No subscription found
              </p>
              <p className="text-sm text-gray-600 mt-2">
                This could mean:
                <br />• User hasn&apos;t subscribed yet
                <br />• Stripe webhook failed to create subscription record
                <br />• Database connection issue
              </p>
            </div>
          )}
        </div>

        {/* Environment Check */}
        <div className="border rounded-lg p-4">
          <h2 className="text-xl font-semibold mb-2">Environment Check</h2>
          <div className="space-y-1">
            <p>
              <strong>STRIPE_API_KEY:</strong>{" "}
              {process.env.STRIPE_API_KEY ? "✅ Set" : "❌ Missing"}
            </p>
            <p>
              <strong>STRIPE_WEBHOOK_SECRET:</strong>{" "}
              {process.env.STRIPE_WEBHOOK_SECRET ? "✅ Set" : "❌ Missing"}
            </p>
            <p>
              <strong>DATABASE_URL:</strong>{" "}
              {process.env.DATABASE_URL ? "✅ Set" : "❌ Missing"}
            </p>
          </div>
        </div>

        {/* Heart System Debug */}
        <div className="border rounded-lg p-4">
          <h2 className="text-xl font-semibold mb-2">Heart System Logic</h2>
          <div className="space-y-2">
            <p>
              <strong>Should Show Unlimited Hearts:</strong>{" "}
              {userSubscription?.isActive
                ? "✅ Yes (Subscription Active)"
                : "❌ No (Show Limited Hearts)"}
            </p>
            <p>
              <strong>Hearts Deduction on Wrong Answer:</strong>{" "}
              {userSubscription?.isActive
                ? "✅ Disabled (Unlimited)"
                : "❌ Enabled (Will Lose Hearts)"}
            </p>
            <p>
              <strong>Hearts Modal on Zero Hearts:</strong>{" "}
              {userSubscription?.isActive ? "✅ Disabled" : "❌ Will Show"}
            </p>
          </div>
        </div>

        {/* Manual Testing */}
        <div className="border rounded-lg p-4">
          <h2 className="text-xl font-semibold mb-2">Manual Testing</h2>
          <div className="space-y-2">
            <p className="text-sm">To test the subscription system:</p>
            <ol className="list-decimal list-inside text-sm space-y-1">
              <li>Go to /shop and click &quot;Upgrade&quot; button</li>
              <li>
                Complete Stripe checkout (use test card: 4242 4242 4242 4242)
              </li>
              <li>Verify webhook is received and subscription is created</li>
              <li>Check this page again to see updated status</li>
              <li>Go to lesson and verify unlimited hearts display</li>
            </ol>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4">
          <a
            href="/shop"
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Go to Shop
          </a>
          <a
            href="/learn"
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
          >
            Go to Learn
          </a>
          <button
            onClick={() => window.location.reload()}
            className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
          >
            Refresh Debug Info
          </button>
        </div>
      </div>
    </div>
  );
};

export default DebugSubscriptionPage;
