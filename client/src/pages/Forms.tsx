import { useState } from "react";
import Layout from "@/components/Layout";
import FormSelector from "@/components/Forms/FormSelector";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default function Forms() {
  const [selectedForm, setSelectedForm] = useState<{
    component: React.ComponentType<any>;
    formType: string;
  } | null>(null);

  const handleFormSelect = (FormComponent: React.ComponentType<any>, formType: string) => {
    setSelectedForm({ component: FormComponent, formType });
  };

  const handleBackToSelector = () => {
    setSelectedForm(null);
  };

  const handleFormSuccess = () => {
    setSelectedForm(null);
  };

  return (
    <Layout>
      <div className="space-y-6">
        {selectedForm ? (
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                onClick={handleBackToSelector}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Forms
              </Button>
              <h1 className="text-2xl font-bold">Form Entry</h1>
            </div>
            <div className="flex justify-center">
              <selectedForm.component onSuccess={handleFormSuccess} />
            </div>
          </div>
        ) : (
          <FormSelector onFormSelect={handleFormSelect} />
        )}
      </div>
    </Layout>
  );
}