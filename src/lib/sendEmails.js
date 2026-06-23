export async function sendPasswordChangedEmail(userEmail, userName) {
  try {
    const response = await fetch('/api/send-password-changed', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userEmail, userName }),
    })
    return await response.json()
  } catch (error) {
    console.error('Error sending email:', error)
    throw error
  }
}

export async function sendPasswordResetConfirmationEmail(userEmail, userName) {
  try {
    const response = await fetch('/api/send-password-reset-confirmation', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userEmail, userName }),
    })
    return await response.json()
  } catch (error) {
    console.error('Error sending email:', error)
    throw error
  }
}
