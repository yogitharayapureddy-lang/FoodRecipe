
import { useState } from "react";
import "./Donation.css";

type RazorpayResponse = {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
};

type RazorpayOptions = {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  handler: (response: RazorpayResponse) => void;
  modal?: { ondismiss: () => void };
  theme?: { color: string };
};

type RazorpayInstance = {
  open: () => void;
  on: (
    event: string,
    callback: (response: {
      error?: { description?: string };
    }) => void
  ) => void;
};

declare global {
  interface Window {
    Razorpay?: new (
      options: RazorpayOptions
    ) => RazorpayInstance;
  }
}

type OrderResponse = {
  keyId: string;
  orderId: string;
  amount: number;
  currency: string;
};

type DonationProps = {
  recipeId: number;
  recipeName: string;
  creatorName: string;
};

const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:8081";

function loadRazorpay(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (window.Razorpay) {
      resolve();
      return;
    }

    const script = document.createElement("script");
    script.src =
      "https://checkout.razorpay.com/v1/checkout.js";

    script.onload = () => resolve();
    script.onerror = () =>
      reject(new Error("Razorpay failed to load"));

    document.body.appendChild(script);
  });
}

export default function Donation({
  recipeId,
  recipeName,
  creatorName
}: DonationProps) {
  const [amount, setAmount] = useState("100");
  const [donorName, setDonorName] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function handleDonate() {
    const rupees = Number(amount);

    if (
      !donorName.trim() ||
      donorName.trim().length > 100
    ) {
      setMessage("Please enter a valid name.");
      return;
    }

    if (
      !Number.isFinite(rupees) ||
      rupees < 10 ||
      rupees > 10000 ||
      !Number.isInteger(rupees * 100)
    ) {
      setMessage(
        "Enter an amount between ₹10 and ₹10,000."
      );
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      await loadRazorpay();

      const orderResponse = await fetch(
        `${API_URL}/api/donations/create-order`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            donorName: donorName.trim(),
            amount: rupees,
            recipeId: recipeId
          })
        }
      );

     if (!orderResponse.ok) {
  const errorText = await orderResponse.text();

  console.error("Donation API error:", {
    status: orderResponse.status,
    response: errorText,
  });

  throw new Error(
    `Donation order failed (${orderResponse.status}): ${
      errorText || orderResponse.statusText
    }`
  );
}

      const order: OrderResponse =
        await orderResponse.json();

      if (!window.Razorpay) {
        throw new Error(
          "Razorpay Checkout unavailable"
        );
      }

      const checkout = new window.Razorpay({
        key: order.keyId,
        amount: order.amount,
        currency: order.currency,
        name: "RecipeHub",
        description:
          `Support ${creatorName} - ${recipeName}`,
        order_id: order.orderId,
        theme: { color: "#326b4a" },

        handler: async (response) => {
          setMessage(
            "Payment received. Verifying..."
          );

          try {
            const verifyResponse = await fetch(
              `${API_URL}/api/donations/verify`,
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/json"
                },
                body: JSON.stringify({
                  razorpayOrderId:
                    response.razorpay_order_id,
                  razorpayPaymentId:
                    response.razorpay_payment_id,
                  razorpaySignature:
                    response.razorpay_signature
                })
              }
            );

            if (!verifyResponse.ok) {
              throw new Error(
                "Payment verification failed"
              );
            }

            const result: { status: string } =
              await verifyResponse.json();

            if (result.status === "PAID") {
              setMessage(
                `❤️ Thank you for supporting ${creatorName}!`
              );
            } else {
              setMessage(
                "Payment is processing. " +
                "Please check its status later."
              );
            }
          } catch (error) {
            console.error(error);
            setMessage(
              "Payment verification could not " +
              "be completed. Please check your " +
              "Razorpay payment status before retrying."
            );
          } finally {
            setLoading(false);
          }
        },

        modal: {
          ondismiss: () => {
            setLoading(false);
            setMessage(
              "Checkout closed. " +
              "No new payment confirmed."
            );
          }
        }
      });

      checkout.on(
        "payment.failed",
        (response) => {
          setLoading(false);
          setMessage(
            response.error?.description ||
            "Payment failed. Please retry."
          );
        }
      );

      checkout.open();
    } catch (error) {
      console.error(error);
      setMessage(
        "Unable to open payment checkout."
      );
      setLoading(false);
    }
  }

  return (
    <section className="donation-section">
      <div className="donation-card">
        <div className="donation-heart">♥</div>

        <span className="donation-kicker">
          SUPPORT RECIPE CREATOR
        </span>

        <h2>❤️ Support {creatorName}</h2>

        <p>
          Enjoyed <strong>{recipeName}</strong>?
          Show your appreciation to the recipe
          creator with a voluntary donation.
        </p>

        <label htmlFor={`donor-name-${recipeId}`}>
          Your name
        </label>

        <input
          id={`donor-name-${recipeId}`}
          type="text"
          placeholder="Enter your name"
          value={donorName}
          maxLength={100}
          onChange={(e) =>
            setDonorName(e.target.value)
          }
        />

        <label>Choose an amount</label>

        <div className="donation-amounts">
          {[50, 100, 200, 500].map(
            (value) => (
              <button
                key={value}
                type="button"
                className={
                  amount === String(value)
                    ? "selected"
                    : ""
                }
                onClick={() =>
                  setAmount(String(value))
                }
              >
                ₹{value}
              </button>
            )
          )}
        </div>

        <label htmlFor={`donation-amount-${recipeId}`}>
          Amount in rupees
        </label>

        <input
          id={`donation-amount-${recipeId}`}
          type="number"
          min="10"
          max="10000"
          step="0.01"
          value={amount}
          onChange={(e) =>
            setAmount(e.target.value)
          }
        />

        <button
          className="donation-submit"
          type="button"
          disabled={loading}
          onClick={handleDonate}
        >
          {loading
            ? "Please wait..."
            : `♥ Donate ₹${amount || "0"}`}
        </button>

        {message && (
          <p
            className="donation-message"
            role="status"
          >
            {message}
          </p>
        )}

        <small>
          Secure checkout powered by Razorpay.
          Payments are collected by RecipeHub
          and attributed to this creator
          in the database.
        </small>
      </div>
    </section>
  );
}
