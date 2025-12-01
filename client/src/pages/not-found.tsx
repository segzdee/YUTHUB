import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertCircle, Home, ArrowLeft } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div className='min-h-screen w-full flex items-center justify-center bg-gray-50 dark:bg-gray-900'>
      <Card className='w-full max-w-md mx-4'>
        <CardContent className='pt-8 pb-6'>
          <div className='flex flex-col items-center text-center'>
            <AlertCircle className='h-16 w-16 text-red-500 mb-4' />
            <h1 className='text-4xl font-bold text-gray-900 dark:text-gray-100 mb-2'>
              404
            </h1>
            <h2 className='text-xl font-semibold text-gray-700 dark:text-gray-300 mb-4'>
              Page Not Found
            </h2>
            <p className='text-sm text-gray-600 dark:text-gray-400 mb-6'>
              The page you're looking for doesn't exist or has been moved.
            </p>

            <div className='flex flex-col sm:flex-row gap-3 w-full'>
              <Button
                onClick={() => navigate(-1)}
                variant='outline'
                className='flex-1'
              >
                <ArrowLeft className='mr-2 h-4 w-4' />
                Go Back
              </Button>
              <Button
                asChild
                className='flex-1'
              >
                <Link to='/'>
                  <Home className='mr-2 h-4 w-4' />
                  Home
                </Link>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
