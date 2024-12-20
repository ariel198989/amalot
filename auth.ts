// הרשמה רגילה למשתמשים
export async function signUpUser(email: string, password: string) {
  try {
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
    
    if (error) {
      console.error('שגיאת הרשמה:', error)
      throw error
    }

    if (data?.user) {
      const { error: profileError } = await supabase
        .from('profiles')
        .insert([{ id: data.user.id, email: data.user.email }])

      if (profileError) {
        console.error('שגיאה ביצירת פרופיל:', profileError)
        throw profileError
      }

      return {
        user: data.user,
        message: 'ההרשמה הצליחה!'
      }
    }

    throw new Error('שגיאה ביצירת משתמש')
    
  } catch (error) {
    console.error('שגיאה:', error)
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