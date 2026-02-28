// Re-export auth functions from config
export { auth, signIn, signOut, handlers } from './config'

// Re-export middleware functions
export { requireAuth, getOptionalAuth, withAuth } from './middleware'
