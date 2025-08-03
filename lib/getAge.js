export function getAge(birthDate, deathDate = null) {
  if (!birthDate) return null
  
  const birth = new Date(birthDate)
  const end = deathDate ? new Date(deathDate) : new Date()
  
  if (isNaN(birth.getTime()) || (deathDate && isNaN(end.getTime()))) {
    return null
  }
  
  let age = end.getFullYear() - birth.getFullYear()
  const monthDiff = end.getMonth() - birth.getMonth()
  
  if (monthDiff < 0 || (monthDiff === 0 && end.getDate() < birth.getDate())) {
    age--
  }
  
  return age >= 0 ? age : null
}