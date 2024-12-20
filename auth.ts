try {
  const { data, error } = await supabase.auth.signUp({
    email: email,
    password: password,
    options: {
      emailRedirectTo: `${window.location.origin}/auth/callback`
    }
  })
  
  if (error) {
    console.error('שגיאת הרשמה:', error)
    throw error
  }

  if (data?.user?.identities?.length === 0) {
    return {
      user: data.user,
      message: 'נשלח מייל אימות. אנא בדוק את תיבת הדואר שלך.'
    }
  }

  return data
  
} catch (error) {
  console.error('שגיאה:', error)
  throw error
} 