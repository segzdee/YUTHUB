import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DollarSign } from 'lucide-react';

export function SupportLevelRatesTab() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className='flex items-center gap-2'>
          <DollarSign className='h-5 w-5' />
          Support Level Rates
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className='text-center py-8'>
          <DollarSign className='h-16 w-16 text-muted-foreground mx-auto mb-4' />
          <h3 className='text-lg font-semibold mb-2'>Support Level Rates</h3>
          <p className='text-muted-foreground'>
            Support level rate management features will be available here.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
