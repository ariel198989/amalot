import { supabase } from '@/lib/supabase';

export interface SalesData {
  id: string;
  date: string;
  client_name: string;
  total_commission: number;
  company: string;
  user_id: string;
}

export interface ProductDistribution {
  type: 'pension' | 'insurance' | 'investment' | 'policy';
  count: number;
  commission: number;
  details: SalesData[];
}

export interface DashboardStats {
  totalSales: number;
  totalCommission: number;
  monthlySales: {
    month: string;
    sales: number;
    commission: number;
  }[];
  productDistribution: ProductDistribution[];
}

export interface MeetingSummary {
  summary: string;
  next_steps: string;
  pdfContent: string;
}

export const reportService = {
  async fetchDashboardStats(): Promise<DashboardStats> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('משתמש לא מחובר');

    // קבלת כל הנתונים מהטבלאות השונות
    const [
      { data: pensionSales },
      { data: insuranceSales },
      { data: investmentSales },
      { data: policySales }
    ] = await Promise.all([
      supabase.from('pension_sales')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: false }),
      supabase.from('insurance_sales')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: false }),
      supabase.from('investment_sales')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: false }),
      supabase.from('policy_sales')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: false })
    ]);

    const productDistribution: ProductDistribution[] = [
      {
        type: 'pension',
        count: pensionSales?.length || 0,
        commission: pensionSales?.reduce((sum: number, sale: SalesData) => 
          sum + (sale.total_commission || 0), 0) || 0,
        details: pensionSales || []
      },
      {
        type: 'insurance',
        count: insuranceSales?.length || 0,
        commission: insuranceSales?.reduce((sum: number, sale: SalesData) => 
          sum + (sale.total_commission || 0), 0) || 0,
        details: insuranceSales || []
      },
      {
        type: 'investment',
        count: investmentSales?.length || 0,
        commission: investmentSales?.reduce((sum: number, sale: SalesData) => 
          sum + (sale.total_commission || 0), 0) || 0,
        details: investmentSales || []
      },
      {
        type: 'policy',
        count: policySales?.length || 0,
        commission: policySales?.reduce((sum: number, sale: SalesData) => 
          sum + (sale.total_commission || 0), 0) || 0,
        details: policySales || []
      }
    ];

    const totalSales = productDistribution.reduce((sum, product) => sum + product.count, 0);
    const totalCommission = productDistribution.reduce((sum, product) => sum + product.commission, 0);

    // חישוב נתונים חודשיים
    const monthlySales = this.calculateMonthlySales([
      ...(pensionSales || []),
      ...(insuranceSales || []),
      ...(investmentSales || []),
      ...(policySales || [])
    ]);

    return {
      totalSales,
      totalCommission,
      monthlySales,
      productDistribution
    };
  },

  calculateMonthlySales(sales: SalesData[]): { month: string; sales: number; commission: number }[] {
    const monthlyData: { [key: string]: { sales: number; commission: number } } = {};
    
    sales.forEach(sale => {
      const month = new Date(sale.date).toLocaleString('he-IL', { month: 'long', year: 'numeric' });
      if (!monthlyData[month]) {
        monthlyData[month] = { sales: 0, commission: 0 };
      }
      monthlyData[month].sales++;
      monthlyData[month].commission += sale.total_commission;
    });

    return Object.entries(monthlyData)
      .map(([month, data]) => ({
        month,
        ...data
      }))
      .sort((a, b) => {
        const [aMonth, aYear] = a.month.split(' ');
        const [bMonth, bYear] = b.month.split(' ');
        return new Date(`${aMonth} 1, ${aYear}`).getTime() - 
               new Date(`${bMonth} 1, ${bYear}`).getTime();
      });
  },

  generateMeetingSummary(journeyData: {
    client_name: string;
    selected_products: string[];
    selected_companies: Record<string, string[]>;
    commission_details: Record<string, { 
      total: number; 
      companies: Record<string, any>;
    }>;
    formData: {
      pensionSalary?: number;
      pensionAccumulation?: number;
      pensionProvision?: number;
      insurancePremium?: number;
      insuranceType?: string;
      investmentAmount?: number;
      policyAmount?: number;
      policyPeriod?: number;
    };
  }): MeetingSummary {
    const today = new Date().toLocaleDateString('he-IL');
    const pdfParts: string[] = [];
    
    // הוספת הכותרת
    pdfParts.push(`
      <div dir="rtl" style="font-family: Arial, sans-serif; padding: 40px; max-width: 800px; margin: 0 auto;">
        <div style="text-align: center; margin-bottom: 40px;">
          <h1 style="color: #1e3a8a; font-size: 28px; margin-bottom: 10px;">סיכום פגישת ייעוץ</h1>
          <div style="color: #64748b; font-size: 16px;">
            <p>תאריך: ${today}</p>
            <p>שם לקוח: ${journeyData.client_name}</p>
          </div>
        </div>

        <div style="background: #f8fafc; padding: 30px; border-radius: 12px; margin-bottom: 30px;">
          <h2 style="color: #1e3a8a; font-size: 20px; margin-bottom: 20px; border-bottom: 2px solid #1e3a8a; padding-bottom: 10px;">
            פירוט הפעולות שבוצעו
          </h2>
    `);

    let summaryText = '';

    const insuranceTypeMap: Record<string, string> = {
      risk: 'ביטוח חיים',
      mortgage_risk: 'ביטוח משכנתא',
      health: 'ביטוח בריאות',
      critical_illness: 'מחלות קשות',
      service_letter: 'כתבי שירות',
      disability: 'אובדן כושר עבודה'
    };

    // פנסיה
    if (journeyData.selected_products.includes('pension')) {
      const companies = journeyData.selected_companies.pension;
      const salary = journeyData.formData.pensionSalary?.toLocaleString() || '';
      const accumulation = journeyData.formData.pensionAccumulation?.toLocaleString() || '';
      const provision = journeyData.formData.pensionProvision || '';

      companies.forEach(company => {
        pdfParts.push(`
          <div style="background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
            <h3 style="color: #2563eb; font-size: 18px; margin-bottom: 15px;">
              <span style="margin-left: 8px;">🔹</span>
              ניוד קרן פנסיה ל${company}
            </h3>
            <div style="padding-right: 20px; line-height: 1.6;">
              <p>• שכר: ${salary} ₪</p>
              ${accumulation ? `<p>• צבירה: ${accumulation} ₪</p>` : ''}
              <p>• אחוז הפרשה: ${provision}%</p>
              <p style="color: #059669; font-weight: bold;">
                • צפי עמלות: ${journeyData.commission_details.pension.companies[company].totalCommission.toLocaleString()} ₪
              </p>
            </div>
          </div>
        `);

        // גרסת טקסט לווצאפ
        summaryText += `\n🔹 ניוד קרן פנסיה ל${company}:\n`;
        summaryText += `   • שכר: ${salary} ₪\n`;
        if (accumulation) summaryText += `   • צבירה: ${accumulation} ₪\n`;
        summaryText += `   • אחוז הפרשה: ${provision}%\n`;
        summaryText += `   • צפי עמלות: ${journeyData.commission_details.pension.companies[company].totalCommission.toLocaleString()} ₪\n`;
      });
    }

    // ביטוח
    if (journeyData.selected_products.includes('insurance')) {
      const companies = journeyData.selected_companies.insurance;
      const premium = journeyData.formData.insurancePremium?.toLocaleString() || '';
      const type = insuranceTypeMap[journeyData.formData.insuranceType || ''] || '';

      companies.forEach(company => {
        pdfParts.push(`
          <div style="background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
            <h3 style="color: #2563eb; font-size: 18px; margin-bottom: 15px;">
              <span style="margin-left: 8px;">🔹</span>
              הצטרפות ל${type} בחברת ${company}
            </h3>
            <div style="padding-right: 20px; line-height: 1.6;">
              <p>• פרמיה חודשית: ${premium} ₪</p>
              <p style="color: #059669; font-weight: bold;">
                • צפי עמלות: ${journeyData.commission_details.insurance.companies[company].totalCommission.toLocaleString()} ₪
              </p>
            </div>
          </div>
        `);

        // גרסת טקסט לווצאפ
        summaryText += `\n🔹 הצטרפות ל${type} בחברת ${company}:\n`;
        summaryText += `   • פרמיה חודשית: ${premium} ₪\n`;
        summaryText += `   • צפי עמלות: ${journeyData.commission_details.insurance.companies[company].totalCommission.toLocaleString()} ₪\n`;
      });
    }

    // גמל והשתלמות
    if (journeyData.selected_products.includes('investment')) {
      const companies = journeyData.selected_companies.investment;
      const amount = journeyData.formData.investmentAmount?.toLocaleString() || '';

      companies.forEach(company => {
        const commissionDetails = journeyData.commission_details.investment.companies[company];
        pdfParts.push(`
          <div style="background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
            <h3 style="color: #2563eb; font-size: 18px; margin-bottom: 15px;">
              <span style="margin-left: 8px;">🔹</span>
              ניוד כספי גמל והשתלמות ל${company}
            </h3>
            <div style="padding-right: 20px; line-height: 1.6;">
              <p>• סכום: ${amount} ₪</p>
              <div style="background: #f8fafc; padding: 15px; border-radius: 8px; margin: 10px 0;">
                <h4 style="color: #1e3a8a; font-size: 16px; margin-bottom: 10px;">פירוט עמלות:</h4>
                <p>• עמלת היקף (חד פעמי): ${commissionDetails.scopeCommission.toLocaleString()} ₪</p>
                <p>• עמלת נפרעים חודשית: ${commissionDetails.monthlyCommission.toLocaleString()} ₪</p>
                <p>• עמלת נפרעים שנתית: ${commissionDetails.annualCommission.toLocaleString()} ₪</p>
              </div>
              <p style="color: #059669; font-weight: bold; margin-top: 10px;">
                • סה"כ עמלות בשנה הראשונה: ${commissionDetails.totalCommission.toLocaleString()} ₪
              </p>
            </div>
          </div>
        `);

        // גרסת טקסט לווצאפ
        summaryText += `\n🔹 ניוד כספי גמל והשתלמות ל${company}:\n`;
        summaryText += `   • סכום: ${amount} ₪\n`;
        summaryText += `   • עמלת היקף (חד פעמי): ${commissionDetails.scopeCommission.toLocaleString()} ₪\n`;
        summaryText += `   • עמלת נפרעים חודשית: ${commissionDetails.monthlyCommission.toLocaleString()} ₪\n`;
        summaryText += `   • עמלת נפרעים שנתית: ${commissionDetails.annualCommission.toLocaleString()} ₪\n`;
        summaryText += `   • סה"כ עמלות בשנה הראשונה: ${commissionDetails.totalCommission.toLocaleString()} ₪\n`;
      });
    }

    // פוליסת חיסכון
    if (journeyData.selected_products.includes('policy')) {
      const companies = journeyData.selected_companies.policy;
      const amount = journeyData.formData.policyAmount?.toLocaleString() || '';
      const period = journeyData.formData.policyPeriod || '';

      companies.forEach(company => {
        pdfParts.push(`
          <div style="background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
            <h3 style="color: #2563eb; font-size: 18px; margin-bottom: 15px;">
              <span style="margin-left: 8px;">🔹</span>
              פתיחת פוליסת חיסכון ב${company}
            </h3>
            <div style="padding-right: 20px; line-height: 1.6;">
              <p>• סכום הפקדה: ${amount} ₪</p>
              <p>• תקופה: ${period} שנים</p>
              <p style="color: #059669; font-weight: bold;">
                • צפי עמלות: ${journeyData.commission_details.policy.companies[company].totalCommission.toLocaleString()} ₪
              </p>
            </div>
          </div>
        `);

        // גרסת טקסט לווצאפ
        summaryText += `\n🔹 פתיחת פוליסת חיסכון ב${company}:\n`;
        summaryText += `   • סכום הפקדה: ${amount} ₪\n`;
        summaryText += `   • תקופה: ${period} שנים\n`;
        summaryText += `   • צפי עמלות: ${journeyData.commission_details.policy.companies[company].totalCommission.toLocaleString()} ₪\n`;
      });
    }

    // סיכום כללי
    const totalCommission = Object.values(journeyData.commission_details)
      .reduce((sum, detail) => sum + (detail.total || 0), 0);

    // הוספת סיכום העמלות
    pdfParts.push(`
        </div>

        <div style="background: #1e3a8a; color: white; padding: 20px; border-radius: 12px; margin-bottom: 30px;">
          <h2 style="font-size: 20px; margin-bottom: 10px;">סיכום עמלות</h2>
          <p style="font-size: 24px; font-weight: bold;">
            💰 סה"כ צפי עמלות: ${totalCommission.toLocaleString()} ₪
          </p>
        </div>

        <div style="margin-top: 40px; text-align: center; color: #64748b; font-size: 14px;">
          <p>מסמך זה הופק באופן אוטומטי ע"י מערכת ניהול עמלות</p>
        </div>
      </div>
    `);

    const finalPdfContent = pdfParts.join('');

    return {
      summary: summaryText.trim(),
      next_steps: '',
      pdfContent: finalPdfContent.trim()
    };
  }
}; 