import { Navigate } from 'react-router-dom';
import { ROUTES } from '@/lib/routes';

// Email auth is handled on the main Auth page (mode=login / mode=signup).
// This page was a dead route — redirect to /auth.
export default function EmailAuth() {
  return <Navigate to={ROUTES.auth} replace />;
}
