try {
  const { data: { user }, error } = await supabase.auth.signUp({
    email: email,
    password: password,
    options: {
      data: {
        full_name: fullName // אם יש לך שדה שם מלא
      }
    }
  })
  
  if (error) {
    console.error('שגיאת הרשמה:', error.message)
    throw error
  }

  if (user) {
    // יצירת רשומה בטבלת profiles
    const { error: profileError } = await supabase
      .from('profiles')
      .insert([
        {
          id: user.id,
          email: user.email,
          username: user.email?.split('@')[0] // או כל username אחר שתרצה
        }
      ])
    
    if (profileError) {
      console.error('שגיאה ביצירת פרופיל:', profileError)
      // כדאי גם למחוק את המשתמש שנוצר אם יצירת הפרופיל נכשלה
      await supabase.auth.admin.deleteUser(user.id)
      throw profileError
    }
  }
  
  return { user }
  
} catch (error) {
  console.error('שגיאה:', error)
  throw error
} 