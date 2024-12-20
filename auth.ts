try {
  const { data, error } = await supabase.auth.signUp({
    email: email,
    password: password,
    options: {
      emailRedirectTo: 'http://localhost:5173/auth/callback',
      data: {
        email: email,
        created_at: new Date().toISOString()
      }
    }
  })
  
  if (error) {
    console.error('פרטי השגיאה:', {
      message: error.message,
      status: error.status,
      error
    })
    throw error
  }

  if (data?.user) {
    const { error: profileError } = await supabase
      .from('profiles')
      .insert([
        {
          id: data.user.id,
          email: data.user.email
        }
      ])

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