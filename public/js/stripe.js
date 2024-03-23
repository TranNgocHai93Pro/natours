/* eslint-disable */

import axios from 'axios';
import { showAlert } from './alerts';
const stripe = Stripe(
  'pk_test_51OucRaA9PeMzX95acfVEAdPuxU4GA7L3NNkVLLAt5xEweo8eMAIqbBXudTsriayW5nA54bNYln1v6p5PGFhFscN800dqNYuYab'
);

export const bookTour = async tourId => {
  try {
    const session = await axios({
      method: 'GET',
      url: `/api/v1/bookings/checkout-session/${tourId}`
    });
    showAlert('success', 'Get Booking success');
    console.log(session.data.session.id);
    await stripe.redirectToCheckout({
      sessionId: session.data.session.id
    });
  } catch (err) {
    showAlert('error', err);
  }
};
