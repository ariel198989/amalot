import React from 'react';
import { useForm } from 'react-hook-form';
import { supabase } from '@/lib/supabaseClient';
import { toast } from 'sonner';
import { Download, Share2 } from 'lucide-react';

import { 
  ProductSelection, 
  CompanySelection, 
  CustomerJourney, 
  FormData, 
  Product 
} from './CustomerJourneyTypes';

import { 
  calculatePensionCommissions, 
  calculateInsuranceCommissions, 
  calculateInvestmentCommissions, 
  calculatePolicyCommissions 
} from './CustomerJourneyCalculations';

import { 
  formatDate, 
  generateSummaryText, 
  generateNextSteps,
  calculateTotalCommission 
} from './CustomerJourneyHelpers';

import { 
  Dialog, 
  DialogContent 
} from "@/components/ui/dialog";

import { Button } from "@/components/ui/button";

export default function CustomerJourneyComponent() {
  console.log('CustomerJourneyComponent: Component mounted');

  const [selectedProducts, setSelectedProducts] = React.useState<ProductSelection>({
    pension: false,
    insurance: false,
    investment: false,
    policy: false
  });
  console.log('CustomerJourneyComponent: Selected products:', selectedProducts);

  const [selectedCompanies, setSelectedCompanies] = React.useState<CompanySelection>({
    pension: [],
    insurance: [],
    investment: [],
    policy: []
  });
  console.log('CustomerJourneyComponent: Selected companies:', selectedCompanies);

  const [journeys, setJourneys] = React.useState<CustomerJourney[]>([]);
  console.log('CustomerJourneyComponent: Journeys:', journeys);

  const { register, handleSubmit: handleFormSubmit, watch, setValue } = useForm<FormData>();

  const products: Product[] = [
    { id: 'pension', label: 'פנסיה', description: 'חישוב עמלות פנסיה',
      companies: ['מגדל', 'הראל', 'כלל', 'הפניקס', 'מנורה', 'מור'] },
    { id: 'insurance', label: 'ביטוח', description: 'חישוב עמלות ביטוח',
      companies: ['איילון', 'הראל', 'מגדל', 'מנורה', 'כלל', 'הפניקס', 'הכשרה'] },
    { id: 'investment', label: 'גמל והשתלמות', description: 'חישוב עמלות גמל והשתלמות',
      companies: ['אלטשולר שחם', 'מיטב דש', 'הראל', 'פסגות', 'מגדל', 'כלל'] },
    { id: 'policy', label: 'פוליסות', description: 'חישוב עמלות פוליסות',
      companies: ['הראל', 'מגדל', 'כלל', 'הפניקס'] }
  ];

  const [meetingSummary, setMeetingSummary] = React.useState<{
    isOpen: boolean;
    summary: string;
    next_steps: string;
    pdfContent?: string;
  }>({
    isOpen: false,
    summary: '',
    next_steps: ''
  });

  const handleDownloadPDF = () => {
    console.log('CustomerJourneyComponent: handleDownloadPDF triggered');
    // יישום הורדת PDF
  };

  const handleSubmit = async (data: FormData) => {
    console.log('CustomerJourneyComponent: Form submitted with data:', data);
    try {
      // Your existing code...
    } catch (error) {
      console.error('CustomerJourneyComponent: Error in form submission:', error);
    }
  };

  React.useEffect(() => {
    console.log('CustomerJourneyComponent: useEffect triggered');
    try {
      // Your existing code...
    } catch (error) {
      console.error('CustomerJourneyComponent: Error in useEffect:', error);
    }
  }, []);

  return (
    <div>
      <Dialog open={meetingSummary.isOpen} onOpenChange={() => setMeetingSummary(prev => ({ ...prev, isOpen: false }))}>
        <DialogContent className="max-w-4xl">
          <div className="sticky bottom-0 bg-white pt-4 border-t flex justify-end space-x-4 space-x-reverse">
            <Button onClick={handleDownloadPDF}>
              <Download className="h-4 w-4 ml-2" />
              הורד PDF
            </Button>
            <Button
              onClick={() => {
                const text = `${meetingSummary.summary}\n\nמשימות להמשך:\n${meetingSummary.next_steps}`;
                const encodedText = encodeURIComponent(text);
                window.open(`https://wa.me/?text=${encodedText}`, '_blank');
              }}
            >
              <Share2 className="h-4 w-4 ml-2" />
              שתף בווצאפ
            </Button>
            <Button
              onClick={() => setMeetingSummary(prev => ({ ...prev, isOpen: false }))}
              variant="outline"
            >
              סגור
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
