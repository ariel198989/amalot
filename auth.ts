import { createClient } from '@supabase/supabase-js'

const serviceSupabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true
    }
  }
)

// הרשמה רגילה למשתמשים
export async function signUpUser(email: string, password: string) {
  try {
    console.log('=== התחלת תהליך הרשמה ===')
    
    // בדיקות תקינות בסיסיות
    if (!email || !password) {
      throw new Error('חסרים פרטי התחברות')
    }
    
    if (password.length < 6) {
      throw new Error('הסיסמה חייבת להכיל לפחות 6 תווים')
    }

    // קימוש ב-service role key
    const { data: authData, error: authError } = await serviceSupabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true  // אוטומטית מאשר את המייל
    })
    
    console.log('=== תשובה מהשרת ===', {
      hasData: !!authData,
      hasUser: !!authData?.user,
      userId: authData?.user?.id
    })
    
    if (authError) {
      console.error('=== שגיאת הרשמה ===', authError)
      throw authError
    }

    if (!authData?.user?.id) {
      throw new Error('לא התקבל ID משתמש')
    }

    // אחרי שהמשתמש נוצר, ניצור את הפרופיל
    const { error: profileError } = await serviceSupabase
      .from('profiles')
      .insert({
        id: authData.user.id,
        email: authData.user.email,
        username: email.split('@')[0],
        created_at: new Date().toISOString()
      })
      .select()

    if (profileError) {
      console.error('=== שגיאה ביצירת פרופיל ===', profileError)
      // נמשיך גם אם יצירת הפרופיל נכשלה
    } else {
      console.log('=== פרופיל נוצר בהצלחה ===')
    }

    return {
      user: authData.user,
      message: 'ההרשמה הצליחה!'
    }
    
  } catch (error) {
    console.error('=== שגיאה כללית ===', error)
    throw error
  }
}

// שליחת הזמנה למשתמש
export async function inviteUser(email: string) {
  try {
    const { data, error } = await serviceSupabase.auth.admin.inviteUserByEmail(email, {
      redirectTo: 'http://localhost:5173/auth/callback',
      data: {
        invited_by: 'admin',
        created_at: new Date().toISOString()
      }
    })

    if (error) {
      console.error('שגיאת הזמנה:', error)
      throw error
    }

    return {
      message: 'הזמנה נשלחה בהצלחה!',
      data
    }

  } catch (error) {
    console.error('שגיאה בשליחת הזמנה:', error)
    throw error
  }
} 