// לרישום רגיל
const handleSignUp = async (email: string, password: string) => {
  try {
    const result = await signUpUser(email, password)
    // טיפול בהצלחה
  } catch (error) {
    // טיפול בשגיאה
  }
}

// לשליחת הזמנה
const handleInvite = async (email: string) => {
  try {
    const result = await inviteUser(email)
    // טיפול בהצלחה
  } catch (error) {
    // טיפול בשגיאה
  }
} 