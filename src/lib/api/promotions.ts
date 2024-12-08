import { Promotion, AgentSalesData, calculatePromotionProgress } from '../types/sales';
import { supabase } from '../supabase';

interface PromotionDB {
  id: string;
  title: string;
  company: string;
  start_date: string;
  end_date: string;
  type: 'personal' | 'team' | 'branch';
  targets: {
    pension: number;
    insurance: number;
    finance: number;
  };
  description: string;
  prize: string;
  status: 'ACTIVE' | 'INACTIVE' | 'COMPLETED';
}

interface AgentPromotionDB {
  promotion_id: string;
  promotions: PromotionDB;
}

export const getPromotions = async (agentId: string): Promise<Promotion[]> => {
  try {
    console.log('מתחיל לטעון מבצעים עבור סוכן:', agentId);
    
    if (!agentId) {
      console.error('לא התקבל מזהה סוכן');
      return [];
    }

    // קדיקת חיבור לפני הבקשה
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    if (sessionError) {
      console.error('שגיאה בבדיקת הסשן:', sessionError);
      throw sessionError;
    }

    if (!session?.user) {
      console.error('��א נמצא משתמש מחובר בסשן');
      return [];
    }

    // קודם כל מביא את המבצעים של הסוכן
    const { data: agentPromotions, error: agentPromotionsError } = await supabase
      .from('agent_promotions')
      .select(`
        promotion_id,
        promotions (
          id,
          title,
          company,
          start_date,
          end_date,
          type,
          targets,
          description,
          prize,
          status
        )
      `)
      .eq('agent_id', agentId);

    if (agentPromotionsError) {
      console.error('שגיאה בטעינת מבצעי הסוכן:', agentPromotionsError);
      throw agentPromotionsError;
    }

    console.log('מבצעי הסוכן:', agentPromotions);

    if (!agentPromotions?.length) {
      console.log('לא נמצאו מבצעים לסוכן');
      return [];
    }

    // מסנן מבצעים פעילים
    const activePromotions = (agentPromotions as AgentPromotionDB[])
      .filter(ap => ap.promotions?.status === 'ACTIVE')
      .map(ap => ap.promotions)
      .filter((promotion): promotion is PromotionDB => {
        if (!promotion) return false;
        const endDate = new Date(promotion.end_date);
        const isActive = endDate >= new Date();
        console.log(`מבצע ${promotion.id} - תאריך סיום: ${promotion.end_date}, פעיל: ${isActive}`);
        return isActive;
      });

    console.log('מבצעים פעילים מסוננים:', activePromotions);

    if (activePromotions.length === 0) {
      console.log('לא נמצאו מבצעים פעילים');
      return [];
    }

    // מביא את נתוני המכירות של הסוכן לתקופה הרלוונטית
    const oldestPromotion = activePromotions.reduce((oldest, current) => 
      new Date(current.start_date) < new Date(oldest.start_date) ? current : oldest,
      activePromotions[0]
    );

    console.log('המבצע הישן ביותר:', oldestPromotion);

    // מביא את כל סוגי המכירות
    const startDate = oldestPromotion.start_date;
    const endDate = new Date().toISOString().split('T')[0];

    const [
      { data: pensionSales, error: pensionError },
      { data: insuranceSales, error: insuranceError },
      { data: investmentSales, error: investmentError }
    ] = await Promise.all([
      supabase
        .from('pension_sales')
        .select('*')
        .eq('user_id', agentId)
        .gte('date', startDate)
        .lte('date', endDate),
      supabase
        .from('insurance_sales')
        .select('*')
        .eq('user_id', agentId)
        .gte('date', startDate)
        .lte('date', endDate),
      supabase
        .from('investment_sales')
        .select('*')
        .eq('user_id', agentId)
        .gte('date', startDate)
        .lte('date', endDate)
    ]);

    if (pensionError || insuranceError || investmentError) {
      console.error('שגיאה בטעינת נתוני מכירות:', { pensionError, insuranceError, investmentError });
      throw new Error('שגיאה בטעינת נתוני מכירות');
    }

    // ממפה את הנתונים לפורמט הנכון
    const salesData = [
      ...(pensionSales || []).map(sale => ({
        agentId,
        date: sale.date,
        sales: {
          pension: { transfers: sale.accumulation || 0 },
          insurance: { monthlyPremium: 0 },
          finance: { accumulation: 0 }
        }
      })),
      ...(insuranceSales || []).map(sale => ({
        agentId,
        date: sale.date,
        sales: {
          pension: { transfers: 0 },
          insurance: { monthlyPremium: sale.premium || 0 },
          finance: { accumulation: 0 }
        }
      })),
      ...(investmentSales || []).map(sale => ({
        agentId,
        date: sale.date,
        sales: {
          pension: { transfers: 0 },
          insurance: { monthlyPremium: 0 },
          finance: { accumulation: sale.investment_amount || 0 }
        }
      }))
    ];

    console.log('נתוני מכירות מאוחדים:', salesData);

    // מחשב את הסכומים הנוכחיים לכל מבצע
    const mappedPromotions = activePromotions.map(promotion => {
      const currentAmounts = calculatePromotionProgress(salesData, {
        id: promotion.id,
        title: promotion.title,
        company: promotion.company,
        startDate: promotion.start_date,
        endDate: promotion.end_date,
        type: promotion.type,
        targets: promotion.targets,
        description: promotion.description,
        prize: promotion.prize,
        currentAmounts: { pension: 0, insurance: 0, finance: 0 },
        daysLeft: 0,
        aiPrediction: 0
      });
      
      console.log(`חישוב סכומים למבצע ${promotion.id}:`, currentAmounts);
      
      return {
        id: promotion.id,
        title: promotion.title,
        company: promotion.company,
        startDate: promotion.start_date,
        endDate: promotion.end_date,
        type: promotion.type,
        targets: promotion.targets,
        description: promotion.description,
        prize: promotion.prize,
        currentAmounts,
        daysLeft: Math.ceil((new Date(promotion.end_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)),
        aiPrediction: Math.floor(Math.random() * 30) + 70
      };
    });

    console.log('מבצעים סופיים:', mappedPromotions);
    return mappedPromotions;
  } catch (error) {
    console.error('שגיאה בפונקציית getPromotions:', error);
    throw error;
  }
};

export const createPromotion = async (
  promotion: Omit<Promotion, 'id' | 'currentAmounts' | 'daysLeft' | 'aiPrediction'>
): Promise<Promotion> => {
  try {
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    if (sessionError) throw sessionError;
    
    if (!session?.user) throw new Error('לא נמצא משתמש מחובר');

    console.log('יוצר מבצע חדש עבור משתמש:', session.user.id);

    // יוצר את המבצע
    const { data: promotionData, error: promotionError } = await supabase
      .from('promotions')
      .insert([{
        title: promotion.title,
        company: promotion.company,
        start_date: promotion.startDate,
        end_date: promotion.endDate,
        type: promotion.type,
        targets: promotion.targets,
        description: promotion.description,
        prize: promotion.prize,
        created_at: new Date().toISOString(),
        status: 'ACTIVE'
      }])
      .select()
      .single();

    if (promotionError) {
      console.error('שגיאה ביצירת המבצע:', promotionError);
      throw promotionError;
    }

    console.log('נוצר מבצע:', promotionData);

    // יוצר את הקשר בין הסוכן למבצע
    const { error: agentPromotionError } = await supabase
      .from('agent_promotions')
      .insert([{
        agent_id: session.user.id,
        promotion_id: promotionData.id,
        created_at: new Date().toISOString()
      }]);

    if (agentPromotionError) {
      console.error('שגיאה ביצירת הקשר סוכן-מבצע:', agentPromotionError);
      // מנסה למחוק את המבצע שנוצר אם יש שגיאה
      await supabase
        .from('promotions')
        .delete()
        .eq('id', promotionData.id);
      throw agentPromotionError;
    }

    console.log('נוצר קשר סוכן-מבצע עבור סוכן:', session.user.id);

    return {
      id: promotionData.id,
      title: promotionData.title,
      company: promotionData.company,
      startDate: promotionData.start_date,
      endDate: promotionData.end_date,
      type: promotionData.type as 'personal' | 'team' | 'branch',
      targets: promotionData.targets,
      description: promotionData.description,
      prize: promotionData.prize,
      currentAmounts: { pension: 0, insurance: 0, finance: 0 },
      daysLeft: Math.ceil((new Date(promotionData.end_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)),
      aiPrediction: Math.floor(Math.random() * 30) + 70
    };
  } catch (error) {
    console.error('שגיאה ביצירת מבצע:', error);
    throw error;
  }
};

export const deletePromotion = async (promotionId: string): Promise<void> => {
  try {
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    if (sessionError) throw sessionError;
    
    if (!session?.user) throw new Error('לא נמצא משתמש מחובר');

    console.log('מוחק מבצע:', promotionId);

    // קודם מוחק את הקשרים עם סוכנים
    const { error: agentPromotionError } = await supabase
      .from('agent_promotions')
      .delete()
      .eq('promotion_id', promotionId);

    if (agentPromotionError) {
      console.error('שגיאה במחיקת קשרי סוכן-מבצע:', agentPromotionError);
      throw agentPromotionError;
    }

    // מוחק את המבצע עצמו
    const { error: promotionError } = await supabase
      .from('promotions')
      .delete()
      .eq('id', promotionId);

    if (promotionError) {
      console.error('שגיאה במחיקת המבצע:', promotionError);
      throw promotionError;
    }

    console.log('המבצע נמחק בהצלחה');
  } catch (error) {
    console.error('שגיאה במחיקת מבצע:', error);
    throw error;
  }
}; 