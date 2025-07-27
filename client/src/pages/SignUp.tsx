import { useEffect } from 'react';
import { useLocation } from 'wouter';
import AuthLogin from './AuthLogin';

export default function SignUp() {
  const [location] = useLocation();
  const urlParams = new URLSearchParams(location.split('?')[1] || '');
  const selectedPlan = urlParams.get('plan') || 'trial';

  return <AuthLogin mode='signup' selectedPlan={selectedPlan} />;
}
