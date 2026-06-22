import { API_FALLBACK_ERRORS, ERROR_MESSAGES } from '@/constants/messages'

interface ImgBbUploadSuccessData {
  url?: string
  display_url?: string
}

interface ImgBbUploadResponse {
  success?: boolean
  data?: ImgBbUploadSuccessData
  error?: {
    message?: string
  }
}

function getImgBbConfig(): { uploadUrl: string; apiKey: string } | null {
  const uploadUrl = process.env.NEXT_PUBLIC_IMAGE_URL?.trim() ?? ''
  const apiKey = process.env.NEXT_PUBLIC_IMAGE_KEY?.trim() ?? ''

  if (!uploadUrl || !apiKey) return null

  return { uploadUrl, apiKey }
}

function pickUploadError(response: ImgBbUploadResponse): string {
  const message = response.error?.message?.trim()
  if (message) return message
  return API_FALLBACK_ERRORS.IMAGE_UPLOAD
}

export async function uploadImageToImgBB(
  file: File,
): Promise<{ ok: true; url: string } | { ok: false; error: string }> {
  const config = getImgBbConfig()
  if (!config) {
    return {
      ok: false,
      error: ERROR_MESSAGES.IMAGE_UPLOAD_NOT_CONFIGURED,
    }
  }

  const formData = new FormData()
  formData.append('image', file)

  const endpoint = new URL(config.uploadUrl)
  endpoint.searchParams.set('key', config.apiKey)

  try {
    const response = await fetch(endpoint.toString(), {
      method: 'POST',
      body: formData,
    })

    const json = (await response.json()) as ImgBbUploadResponse
    if (!response.ok || json.success !== true) {
      return {
        ok: false,
        error: pickUploadError(json),
      }
    }

    const uploadedUrl = json.data?.url ?? json.data?.display_url ?? ''
    if (!uploadedUrl.trim()) {
      return {
        ok: false,
        error: API_FALLBACK_ERRORS.IMAGE_UPLOAD,
      }
    }

    return {
      ok: true,
      url: uploadedUrl,
    }
  } catch (error) {
    return {
      ok: false,
      error:
        error instanceof Error ? error.message : ERROR_MESSAGES.NETWORK_ERROR,
    }
  }
}
