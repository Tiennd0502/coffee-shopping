import React from 'react'

import type { SVGProps } from '@/types/svg'

const PublishIcon = ({ width = 14, height = 14, className }: SVGProps) => {
  return (
    <svg
      width={width}
      height={height}
      className={className}
      viewBox="0 0 14 14"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M5.83333 13.3333V6.54167L3.66667 8.70833L2.5 7.5L6.66667 3.33333L10.8333 7.5L9.66667 8.70833L7.5 6.54167V13.3333H5.83333V13.3333M0 4.16667V1.66667C0 1.20833 0.163194 0.815972 0.489583 0.489583C0.815972 0.163194 1.20833 0 1.66667 0H11.6667C12.125 0 12.5174 0.163194 12.8438 0.489583C13.1701 0.815972 13.3333 1.20833 13.3333 1.66667V4.16667H11.6667V1.66667V1.66667V1.66667H1.66667V1.66667V1.66667V4.16667H0V4.16667"
        fill="currentColor"
      />
    </svg>
  )
}

export default PublishIcon
