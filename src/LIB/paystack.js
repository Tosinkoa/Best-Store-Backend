// Require the library
import paystackPackage from "paystack-api";
const paystack = paystackPackage(process.env.PAYSTACK_SECRET_KEY);

export const makePayment = (email, first_name, last_name, amount, user_id, cart_data) => {
  const kobo = 100;
  return paystack.transaction.initialize({
    email,
    first_name,
    last_name,
    // amount: amount * kobo,
    amount: 400 * kobo,
    metadata: {
      type: "product_purchase",
      user_id,
      cart_data,
    },
  });
};

export const getTransaction = (reference) => {
  return paystack.transaction.verify({ reference }, (error, body) => {
    if (error) {
      console.error(error);
    } else {
      console.log(body.data.id);
    }
  });
};
