export const handleError = (error, context = '') => {
  console.error(`Error in ${context}:`, error)
  
  // Handle specific Supabase errors
  if (error.code) {
    switch (error.code) {
      case '23505': // Unique violation
        return 'This record already exists'
      case '23503': // Foreign key violation
        return 'Related record not found'
      case '42501': // Insufficient privileges
        return 'You do not have permission to perform this action'
      default:
        return error.message || 'An unexpected error occurred'
    }
  }
  
  return error.message || 'An unexpected error occurred'
} 