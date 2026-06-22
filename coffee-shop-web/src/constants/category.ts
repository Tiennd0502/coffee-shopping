import { FolderTree, Layers, Tags } from 'lucide-react'

import type { StatCardItem } from '@/components/StatsCards'
import type { TableColumn } from '@/components/Table'

export const CATEGORIES_TABLE_COLUMNS: TableColumn[] = [
  {
    key: 'name',
    label: 'Name',
    className: 'w-auto min-w-0 px-6 py-4',
  },
  {
    key: 'slug',
    label: 'Slug',
    className:
      'w-[24%] px-6 py-4 text-center truncate overflow-hidden text-ellipsis',
  },
  {
    key: 'created',
    label: 'Created',
    className: 'w-[16%] px-6 py-4 text-center',
  },
  {
    key: 'updated',
    label: 'Updated',
    className: 'w-[16%] px-6 py-4 text-center',
  },
  {
    key: 'actions',
    label: 'Actions',
    className: 'w-27 px-6 py-4 text-center',
  },
]

export const CATEGORIES_DASHBOARD_STATS: StatCardItem[] = [
  {
    id: 'total-categories',
    label: 'Total categories',
    value: '48',
    footnote: '+4 this month',
    footnoteTone: 'success',
    footnoteIcon: Tags,
  },
  {
    id: 'active-groups',
    label: 'Product groups',
    value: 12,
    footnote: 'Linked to roasts',
    footnoteIcon: Layers,
  },
  {
    id: 'taxonomy-depth',
    label: 'Max depth',
    value: 3,
    footnote: 'Flat + 2 nested',
    footnoteIcon: FolderTree,
  },
  {
    id: 'pending-review',
    label: 'Pending review',
    value: '02',
    footnote: 'Slug conflicts',
    variant: 'accent',
    icon: Tags,
    footnoteIcon: FolderTree,
  },
]

export const CATEGORY_QUERY_OPTIONS = {
  page: 1,
  limit: 100,
  search: '',
} as const
