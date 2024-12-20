try {
  const { data, error } = await supabase.auth.signUp({
    email: email,
    password: password,
    options: {
      emailRedirectTo: 'http://localhost:5173/auth/callback'
    }
  })
  
  if (error) {
    if (error.message.includes('Email rate limit exceeded')) {
      throw new Error('נסה שוב בעוד מספר דקות')
    }
    console.error('שגיאת הרשמה:', error)
    throw error
  }

  return {
    user: data.user,
    message: 'ההרשמה הצליחה!'
  }
  
} catch (error) {
  console.error('שגיאה:', error)
  throw error
} 