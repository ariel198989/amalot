try {
  const { data, error } = await supabase.auth.signUp({
    email: 'example@email.com',
    password: 'example-password',
  })
  
  if (error) {
    console.error('שגיאת הרשמה:', error.message)
    throw error
  }
  
  // הרשמה הצליחה
  console.log('משתמש נרשם בהצלחה:', data)
  
} catch (error) {
  console.error('שגיאה:', error)
} 