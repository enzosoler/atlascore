import React from 'react';
import { Navigate } from 'react-router-dom';
import { ROUTES } from '@/lib/routes';

export default function ConnectedServices() {
  return <Navigate to={ROUTES.integrations} replace />;
}
