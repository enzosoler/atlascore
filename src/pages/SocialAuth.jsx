import { Navigate } from 'react-router-dom';
import { ROUTES } from '@/lib/routes';

// Social auth options are consolidated on the main Auth page.
// This page was a dead route — redirect to /auth.
export default function SocialAuth() {
  return <Navigate to={ROUTES.auth} replace />;
}
