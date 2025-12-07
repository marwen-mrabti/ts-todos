import { authMiddleware } from '@/middleware/auth-middleware'
import { createFileRoute } from '@tanstack/react-router'


export const Route = createFileRoute('/_authed')({
  server: {
    middleware: [authMiddleware]
  }
})