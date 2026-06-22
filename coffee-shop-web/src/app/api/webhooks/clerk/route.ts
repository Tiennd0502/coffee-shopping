import type { NextRequest } from 'next/server'
import { clerkClient } from '@clerk/nextjs/server'
import { verifyWebhook } from '@clerk/nextjs/webhooks'

import { DEFAULT_USER_PUBLIC_ROLE } from '@/constants/user'

export async function POST(req: NextRequest) {
  try {
    const evt = await verifyWebhook(req)

    if (evt.type === 'user.created') {
      const { id, public_metadata: publicMetadata } = evt.data
      const base =
        publicMetadata &&
        typeof publicMetadata === 'object' &&
        !Array.isArray(publicMetadata)
          ? { ...(publicMetadata as Record<string, unknown>) }
          : {}

      if (base.role !== DEFAULT_USER_PUBLIC_ROLE) {
        const client = await clerkClient()
        await client.users.updateUser(id, {
          publicMetadata: {
            ...base,
            role: DEFAULT_USER_PUBLIC_ROLE,
          },
        })
      }
    }

    return Response.json({ received: true })
  } catch {
    return Response.json({ received: false }, { status: 400 })
  }
}
