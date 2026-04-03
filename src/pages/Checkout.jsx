import { Navigate } from 'react-router-dom';
import { ROUTES } from '@/lib/routes';

// Checkout is handled by Stripe Hosted Checkout, launched from the Pricing page.
// This route exists only as a fallback — redirect users to Pricing so they can
// start the real checkout flow via create-checkout edge function.
export default function Checkout() {
  return <Navigate to={ROUTES.pricing} replace />;
}
