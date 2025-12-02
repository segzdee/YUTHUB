import { useCreateResident } from '@/hooks/useResidents';
import ResidentIntakeForm from '@/components/Forms/ResidentIntakeForm';

export default function ResidentIntakeWrapper() {
  return (
    <div className="space-y-6">
      <ResidentIntakeForm />
    </div>
  );
}
