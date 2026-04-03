import { Navigate } from 'react-router-dom';
import { ROUTES } from '@/lib/routes';

// Apple Sign In is handled on the main Auth page.
// This page was a non-functional stub — redirect to /auth.
export default function AppleAuth() {
  return <Navigate to={ROUTES.auth} replace />;
}
