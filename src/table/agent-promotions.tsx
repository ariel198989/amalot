import React, { useState, useEffect } from 'react';
import { Sparkles, Clock, Calendar, BarChart2, Brain, Plus, X, Gift, Target } from 'lucide-react';
import { Promotion, PromotionTarget } from '@/lib/types/sales';
import { getPromotions, createPromotion } from '@/lib/api/promotions';
import { useAuth } from '@/lib/auth';
import { toast } from 'react-hot-toast';

interface CreatePromotionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (promotion: Omit<Promotion, 'id' | 'currentAmounts' | 'daysLeft' | 'aiPrediction'>) => void;
}

interface PromotionCardProps {
  promotion: Promotion;
  onDelete: (id: string) => void;
}

const INSURANCE_COMPANIES = [
  'הראל',
  'כלל',
  'מגדל',
  'מנורה',
  'הפניקס',
  'הכשרה',
  'איילון',
  'מיטב',
  'אנליסט',
  'אקסלנס',
  'אלטשולר שחם',
  'מור'
] as const;

type InsuranceCompany = typeof INSURANCE_COMPANIES[number];
type TargetKey = keyof Promotion['targets'];

// Modal component for creating new promotion
const CreatePromotionModal: React.FC<CreatePromotionModalProps> = ({ isOpen, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    company: '',
    title: '',
    targets: {
      insurance: 0,
      finance: 0,
      pension: 0
    },
    prize: '',
    endDate: '',
    startDate: '',
    type: 'personal' as Promotion['type'],
    description: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-8 w-full max-w-3xl shadow-2xl transform transition-all overflow-y-auto max-h-[90vh]">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            יצירת מבצע חדש
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Info */}
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium mb-2">יצרן</label>
              <select 
                required
                className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                value={formData.company}
                onChange={(e) => setFormData({ ...formData, company: e.target.value })}
              >
                <option value="">בחר יצרן</option>
                {INSURANCE_COMPANIES.map(company => (
                  <option key={company} value={company}>{company}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">סוג מבצע</label>
              <select
                required
                className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as Promotion['type'] })}
              >
                <option value="personal">אישי</option>
                <option value="team">צוות</option>
                <option value="branch">סניף</option>
              </select>
            </div>
          </div>

          {/* Title & Description */}
          <div>
            <label className="block text-sm font-medium mb-2">שם המבצע</label>
            <input
              required
              type="text"
              className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="הכנס שם מבצע"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">תיאור המבצע</label>
            <textarea
              className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="תאר את המבצע"
              rows={3}
            />
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium mb-2">תאריך התחלה</label>
              <input
                required
                type="date"
                className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">תאריך סיום</label>
              <input
                required
                type="date"
                className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
              />
            </div>
          </div>

          {/* Targets */}
          <div>
            <label className="block text-sm font-medium mb-4">יעדים</label>
            <div className="grid grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium mb-2">יעד ביטוח</label>
                <input
                  type="number"
                  className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                  value={formData.targets.insurance}
                  onChange={(e) => setFormData({
                    ...formData,
                    targets: { ...formData.targets, insurance: Number(e.target.value) }
                  })}
                  placeholder="₪"
                  min="0"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">יעד פיננסים</label>
                <input
                  type="number"
                  className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                  value={formData.targets.finance}
                  onChange={(e) => setFormData({
                    ...formData,
                    targets: { ...formData.targets, finance: Number(e.target.value) }
                  })}
                  placeholder="₪"
                  min="0"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">יעד פנסיה</label>
                <input
                  type="number"
                  className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                  value={formData.targets.pension}
                  onChange={(e) => setFormData({
                    ...formData,
                    targets: { ...formData.targets, pension: Number(e.target.value) }
                  })}
                  placeholder="₪"
                  min="0"
                />
              </div>
            </div>
          </div>

          {/* Prize */}
          <div>
            <label className="block text-sm font-medium mb-2">פרס</label>
            <textarea
              required
              className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
              value={formData.prize}
              onChange={(e) => setFormData({ ...formData, prize: e.target.value })}
              placeholder="פרטי הפרס"
              rows={3}
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-4 mt-8">
            <button
              type="button"
              className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors"
              onClick={onClose}
            >
              ביטול
            </button>
            <button
              type="submit"
              className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-colors"
            >
              שמור מבצע
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Updated PromotionCard component
const PromotionCard: React.FC<PromotionCardProps> = ({ promotion, onDelete }) => {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isDeleting) return;

    try {
      setIsDeleting(true);
      await onDelete(promotion.id);
      toast.success('המבצע נמחק בהצלחה');
    } catch (error) {
      console.error('שגיאה במחיקת המבצע:', error);
      toast.error('שגיאה במחיקת המבצע');
    } finally {
      setIsDeleting(false);
    }
  };

  const getProgressColor = (progress: number) => {
    if (progress >= 80) return 'bg-gradient-to-r from-emerald-400 to-emerald-600';
    if (progress >= 50) return 'bg-gradient-to-r from-blue-400 to-blue-600';
    return 'bg-gradient-to-r from-orange-400 to-orange-600';
  };

  const colors: Record<keyof PromotionTarget, string> = {
    insurance: 'indigo',
    finance: 'emerald',
    pension: 'purple'
  };

  const titles: Record<keyof PromotionTarget, string> = {
    insurance: 'ביטוח',
    finance: 'פיננסים',
    pension: 'פנסיה'
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden transform transition-all duration-300 hover:scale-[1.02] hover:shadow-xl">
      <div className="relative h-48 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500">
        <div className="absolute inset-0 bg-black/10"></div>
        
        <div className="absolute top-4 right-4">
          <div className="flex items-center gap-2 bg-white/95 text-indigo-600 px-3 py-2 rounded-full text-sm font-medium shadow-lg">
            <Brain className="h-4 w-4" />
            <span>{promotion.aiPrediction}% סיכוי הצלחה</span>
          </div>
        </div>

        <div className="absolute top-4 left-4 flex gap-2">
          <div className="flex items-center gap-2 bg-white/95 px-3 py-2 rounded-full text-sm font-medium shadow-lg">
            <Target className="h-4 w-4 text-indigo-600" />
            {promotion.company}
          </div>
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className={`flex items-center justify-center w-8 h-8 bg-white/95 text-red-600 rounded-full shadow-lg hover:bg-red-50 transition-colors ${isDeleting ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {isDeleting ? (
              <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <X className="h-4 w-4" />
            )}
          </button>
        </div>

        <div className="absolute bottom-4 right-4 left-4">
          <h3 className="text-2xl font-bold text-white mb-3 drop-shadow-lg">{promotion.title}</h3>
          <div className="flex items-center gap-3">
            <div className="bg-white/95 px-3 py-2 rounded-full text-sm font-medium shadow-lg flex items-center">
              <Clock className="h-4 w-4 text-indigo-600 mr-2" />
              {promotion.daysLeft} ימים נותרו
            </div>
            <div className="bg-white/95 px-3 py-2 rounded-full text-sm font-medium shadow-lg flex items-center">
              <Calendar className="h-4 w-4 text-indigo-600 mr-2" />
              {promotion.endDate}
            </div>
          </div>
        </div>
      </div>

      <div className="p-8 space-y-8">
        {/* Progress Bars */}
        {(Object.entries(promotion.targets) as [keyof PromotionTarget, number][]).map(([key, target]) => {
          if (target > 0) {
            const current = promotion.currentAmounts[key];
            const progress = Math.min(Math.round((current / target) * 100), 100);
            
            return (
              <div key={key} className="space-y-4">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <div className={`p-2.5 bg-${colors[key]}-100 rounded-xl`}>
                      <BarChart2 className={`h-5 w-5 text-${colors[key]}-600`} />
                    </div>
                    <div>
                      <span className="text-base font-semibold">{titles[key]}</span>
                      <div className="text-sm text-gray-500">
                        יעד: ₪{target.toLocaleString()}
                      </div>
                    </div>
                  </div>
                  <span className={`text-lg font-bold ${progress >= 80 ? 'text-emerald-600' : 'text-gray-700'}`}>
                    {progress}%
                  </span>
                </div>
                <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${getProgressColor(progress)} transition-all duration-500 ease-out`}
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <div className="text-sm text-gray-600 flex justify-between items-center">
                  <span>₪{current.toLocaleString()}</span>
                  <span className="text-gray-400">מתוך ₪{target.toLocaleString()}</span>
                </div>
              </div>
            );
          }
          return null;
        })}

        {/* Prize Section */}
        <div className="bg-gradient-to-r from-indigo-50 to-purple-50 p-6 rounded-xl">
          <div className="flex items-center gap-2 text-indigo-600 font-semibold mb-3">
            <Gift className="h-5 w-5" />
            <span>פרס</span>
          </div>
          <p className="text-gray-700">{promotion.prize}</p>
        </div>
      </div>
    </div>
  );
};

// Main component
export default function AgentPromotions() {
  const { user, loading: userLoading } = useAuth();
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(Date.now());

  useEffect(() => {
    let isMounted = true;
    let intervalId: NodeJS.Timeout;

    console.log('AgentPromotions useEffect - מצב נוכחי:', {
      userId: user?.id,
      userLoading,
      isLoading,
      promotionsCount: promotions.length,
      lastUpdate
    });
    
    const loadData = async () => {
      if (!isMounted) return;

      if (userLoading) {
        console.log('ממתין לטעינת המשתמש...');
        return;
      }

      try {
        const storedSession = localStorage.getItem('supabase.auth.token');
        if (!user?.id && storedSession) {
          console.log('מנסה לשחזר משתמש מהסשן המאוחסן');
          const parsedSession = JSON.parse(storedSession);
          if (parsedSession?.user?.id) {
            console.log('נמצא משתמש בסשן:', parsedSession.user.id);
            const data = await getPromotions(parsedSession.user.id);
            if (isMounted) {
              setPromotions(data || []);
              setIsLoading(false);
            }
            return;
          }
        }

        if (!user?.id) {
          console.log('לא נמצא משתמש מחובר');
          if (isMounted) {
            setIsLoading(false);
            setPromotions([]);
          }
          return;
        }

        console.log('טוען מבצעים עבור משתמש:', user.id);
        if (isMounted) setIsLoading(true);
        
        const data = await getPromotions(user.id);
        console.log('נטענו המבצעים:', data);
        
        if (isMounted) {
          setPromotions(data || []);
          setIsLoading(false);
        }
      } catch (error) {
        console.error('שגיאה בטעינת המבצעים:', error);
        if (isMounted) {
          toast.error('שגיאה בטעינת המבצעים');
          setPromotions([]);
          setIsLoading(false);
        }
      }
    };

    loadData();

    // מתחיל לרענן כל 30 שניות
    intervalId = setInterval(() => {
      setLastUpdate(Date.now());
    }, 30000);

    return () => {
      isMounted = false;
      if (intervalId) clearInterval(intervalId);
    };
  }, [user?.id, userLoading, lastUpdate]);

  const handleSavePromotion = async (newPromotion: Omit<Promotion, 'id' | 'currentAmounts' | 'daysLeft' | 'aiPrediction'>) => {
    if (!user?.id) {
      console.error('לא נמצא משתמש מחובר');
      toast.error('משתמש לא מחובר');
      return;
    }

    try {
      setIsLoading(true);
      console.log('שומר מבצע חדש:', newPromotion);
      
      const savedPromotion = await createPromotion(newPromotion);
      console.log('המבצע נשמר:', savedPromotion);
      
      // טוען מחדש את כל המבצעי
      const updatedPromotions = await getPromotions(user.id);
      setPromotions(updatedPromotions);
      
      toast.success('המבצע נוצר בהצלחה');
      setIsModalOpen(false);
    } catch (error) {
      console.error('שגיאה ביצירת המבצע:', error);
      toast.error('שגיאה ביצירת המבצע');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeletePromotion = async (id: string) => {
    try {
      const promotionsModule = await import('@/lib/api/promotions');
      await promotionsModule.deletePromotion(id);
      setPromotions(prev => prev.filter(p => p.id !== id));
    } catch (error) {
      console.error('שגיאה במחיקת המבצע:', error);
      throw error;
    }
  };

  const filteredPromotions = promotions.filter(promotion => {
    if (selectedFilter === 'active') {
      return promotion.daysLeft > 0;
    }
    if (selectedFilter === 'ending') {
      return promotion.daysLeft > 0 && promotion.daysLeft <= 7;
    }
    return true;
  });

  console.log('Rendering AgentPromotions - Loading:', isLoading, 'Promotions count:', promotions.length);

  return (
    <div className="p-8 max-w-[1400px] mx-auto">
      {/* Header */}
      <div className="mb-12 space-y-8">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-2xl shadow-lg">
              <Sparkles className="h-7 w-7 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                ניתוח מבצעים
              </h1>
              <p className="text-gray-500 mt-1">ניהול ומעקב אחר מבצעי מכירות</p>
            </div>
          </div>
          
          <button
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-colors shadow-lg"
            onClick={() => setIsModalOpen(true)}
          >
            <Plus className="h-5 w-5" />
            מבצע חדש
          </button>
        </div>

        <div className="flex gap-4 items-center bg-white p-4 rounded-xl shadow-sm">
          <select 
            className="p-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
            value={selectedFilter}
            onChange={(e) => setSelectedFilter(e.target.value)}
          >
            <option value="all">כל המבצעים</option>
            <option value="active">מבצעים פעילים</option>
            <option value="ending">מסתיימים בקרוב</option>
          </select>
          
          <select className="p-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all">
            <option value="">כל היצרנים</option>
            {INSURANCE_COMPANIES.map(company => (
              <option key={company} value={company}>{company}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Cards Grid */}
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        </div>
      ) : filteredPromotions.length === 0 ? (
        <div className="text-center py-12">
          <Target className="h-12 w-12 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900">אין מבצעים</h3>
          <p className="mt-2 text-sm text-gray-500">
            {selectedFilter === 'all' 
              ? 'לא נמצאו מבצעים במערכת'
              : selectedFilter === 'active'
                ? 'אין מבצעים פעילים כרגע'
                : 'אין מבצעים שמסתיימים בקרוב'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
          {filteredPromotions.map((promotion) => (
            <PromotionCard 
              key={promotion.id} 
              promotion={promotion} 
              onDelete={handleDeletePromotion}
            />
          ))}
        </div>
      )}

      {/* Create Promotion Modal */}
      <CreatePromotionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSavePromotion}
      />
    </div>
  );
} 