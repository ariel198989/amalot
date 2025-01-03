interface ProductRates {
  scope_commission: number;
  monthly_rate: number;
}

interface Rates {
  products: {
    gemel: ProductRates;
    investment_gemel: ProductRates;
    hishtalmut: ProductRates;
  };
}

interface AgentAgreementFormProps {
  rates: Rates;
  handleProductRateChange: (product: string, field: string, value: string) => void;
}

export const AgentAgreementForm: React.FC<AgentAgreementFormProps> = ({ rates, handleProductRateChange }) => {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <label>גמל</label>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label>סכום למיליון (₪)</label>
            <input
              type="number"
              value={rates.products.gemel.scope_commission}
              onChange={(e) => handleProductRateChange('gemel', 'scope_commission', e.target.value)}
              className="w-full p-2 border rounded"
            />
          </div>
          <div>
            <label>עמלת נפרעים (₪ למיליון)</label>
            <input
              type="number"
              value={rates.products.gemel.monthly_rate}
              onChange={(e) => handleProductRateChange('gemel', 'monthly_rate', e.target.value)}
              className="w-full p-2 border rounded"
            />
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <label>גמל להשקעה</label>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label>סכום למיליון (₪)</label>
            <input
              type="number"
              value={rates.products.investment_gemel.scope_commission}
              onChange={(e) => handleProductRateChange('investment_gemel', 'scope_commission', e.target.value)}
              className="w-full p-2 border rounded"
            />
          </div>
          <div>
            <label>עמלת נפרעים (₪ למיליון)</label>
            <input
              type="number"
              value={rates.products.investment_gemel.monthly_rate}
              onChange={(e) => handleProductRateChange('investment_gemel', 'monthly_rate', e.target.value)}
              className="w-full p-2 border rounded"
            />
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <label>השתלמות</label>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label>סכום למיליון (₪)</label>
            <input
              type="number"
              value={rates.products.hishtalmut.scope_commission}
              onChange={(e) => handleProductRateChange('hishtalmut', 'scope_commission', e.target.value)}
              className="w-full p-2 border rounded"
            />
          </div>
          <div>
            <label>עמלת נפרעים (₪ למיליון)</label>
            <input
              type="number"
              value={rates.products.hishtalmut.monthly_rate}
              onChange={(e) => handleProductRateChange('hishtalmut', 'monthly_rate', e.target.value)}
              className="w-full p-2 border rounded"
            />
          </div>
        </div>
      </div>
    </div>
  );
}; 