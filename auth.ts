// הרשמה רגילה למשתמשים
export async function signUpUser(email: string, password: string) {
  try {
    // לוג לפני הניסיון
    console.log('=== התחלת תהליך הרשמה ===')
    console.log('נתוני הרשמה:', { 
      email, 
      passwordLength: password.length,
      timestamp: new Date().toISOString()
    })
    
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: 'http://localhost:5173/auth/callback',
        data: {
          email,
          created_at: new Date().toISOString()
        }
      }
    })
    
    // לוג של התשובה המלאה
    console.log('=== תשובה מהשרת ===', {
      hasData: !!data,
      hasUser: !!data?.user,
      hasError: !!error,
      fullResponse: { data, error }
    })
    
    if (error) {
      console.error('=== פרטי השגיאה ===', {
        message: error.message,
        status: error.status,
        details: error.details,
        name: error.name,
        stack: error.stack,
        fullError: error
      })
      throw error
    }

    if (data?.user) {
      console.log('=== יצירת משתמש הצליחה ===', {
        userId: data.user.id,
        userEmail: data.user.email,
        userMetadata: data.user.user_metadata
      })

      // ניסיון ליצור פרופיל
      console.log('=== מנסה ליצור פרופיל ===')
      const { error: profileError } = await supabase
        .from('profiles')
        .insert([
          {
            id: data.user.id,
            email: data.user.email,
            username: email.split('@')[0]
          }
        ])

      if (profileError) {
        console.error('=== שגיאה ביצירת פרופיל ===', {
          error: profileError,
          details: profileError.details,
          message: profileError.message,
          hint: profileError.hint
        })
        throw profileError
      }

      console.log('=== פרופיל נוצר בהצלחה ===')
      
      return {
        user: data.user,
        message: 'ההרשמה הצליחה!'
      }
    }

    console.error('=== שגיאה: לא התקבלו פרטי משתמש ===')
    throw new Error('לא התקבלו פרטי משתמש')
    
  } catch (error) {
    console.error('=== שגיאה כללית בתהליך ההרשמה ===', {
      error,
      type: typeof error,
      isError: error instanceof Error,
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    })
    throw error
  }
}

// שליחת הזמנה למשתמש
export async function inviteUser(email: string) {
  try {
    const { data, error } = await supabase.auth.admin.inviteUserByEmail(email, {
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