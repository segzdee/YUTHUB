import { useEffect } from 'react';
import AuthLogin from './AuthLogin';

export default function Login() {
  // Get URL parameters to determine mode and selected plan
  const urlParams = new URLSearchParams(window.location.search);
  const mode = urlParams.get('signup') === 'true' ? 'signup' : 'signin';
  const selectedPlan = urlParams.get('plan');

  return (
    <AuthLogin 
      mode={mode} 
      selectedPlan={selectedPlan || undefined}
    />
  );
}