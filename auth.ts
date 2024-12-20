try {
  const { data: { user }, error } = await supabase.auth.signUp({
    email: email,
    password: password,
    options: {
      data: {
        full_name: fullName
      }
    }
  })
  
  if (error) {
    console.error('שגיאת הרשמה:', error.message)
    throw error
  }

  if (user) {
    const { error: profileError } = await supabase
      .from('profiles')
      .insert([
        {
          id: user.id,
          email: user.email,
          username: user.email?.split('@')[0]
        }
      ])
    
    if (profileError) {
      console.error('שגיאה ביצירת פרופיל:', profileError)
      throw profileError
    }
  }
  
  return { user }
  
} catch (error) {
  console.error('שגיאה:', error)
  throw error
} 