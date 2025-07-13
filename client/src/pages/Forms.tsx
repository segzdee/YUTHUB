import { useState } from "react";
import Sidebar from "@/components/Layout/Sidebar";
import Header from "@/components/Layout/Header";
import FormSelector from "@/components/Forms/FormSelector";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default function Forms() {
  const [selectedForm, setSelectedForm] = useState<{
    component: React.ComponentType<any>;
    formType: string;
  } | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

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
    <div className="flex h-screen bg-background">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      <div className="flex-1 lg:ml-64 flex flex-col">
        <Header onMenuClick={() => setSidebarOpen(true)} />
        
        <main className="flex-1 overflow-y-auto p-4 sm:p-6">
          {selectedForm ? (
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <Button
                  variant="outline"
                  onClick={handleBackToSelector}
                  className="flex items-center gap-2"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back to Forms
                </Button>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Form Entry</h1>
              </div>
              <div className="flex justify-center">
                <selectedForm.component onSuccess={handleFormSuccess} />
              </div>
            </div>
          ) : (
            <FormSelector onFormSelect={handleFormSelect} />
          )}
        </main>
      </div>
    </div>
  );
}