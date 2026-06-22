export interface CategoryPayload {
  name: string
}

export interface Category {
  id: string
  createdBy: string | null
  updatedBy: string | null
  deletedBy: string | null
  name: string
  slug: string
  createdAt: string | null
  updatedAt: string | null
  deletedAt: string | null
}
