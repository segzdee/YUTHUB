import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { AuthPageLayout } from '@/components/PageLayout';
import AuthLogin from './AuthLogin';

export default function SignUp() {
  const location = useLocation();
  const urlParams = new URLSearchParams(location.search);
  const selectedPlan = urlParams.get('plan') || 'trial';

  return (
    <AuthPageLayout>
      <AuthLogin mode='signup' selectedPlan={selectedPlan} />
    </AuthPageLayout>
  );
}
