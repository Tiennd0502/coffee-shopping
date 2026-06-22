import React from 'react'

import { DIRECTION, type SVGProps } from '@/types/svg'

interface ChevronIconProps extends SVGProps {
  direction?: DIRECTION
  rotate?: number
  duration?: number
}

export const ChevronIcon = ({
  color = 'currentColor',
  width = 17,
  height = 9,
  direction = DIRECTION.DOWN,
  rotate,
  duration = 0,
  className,
  onClick,
}: ChevronIconProps) => {
  const rotateValue = (): number => {
    switch (direction) {
      case DIRECTION.LEFT:
        return 90
      case DIRECTION.UP:
        return 180
      case DIRECTION.RIGHT:
        return -90
      case DIRECTION.DOWN:
      default:
        return 0
    }
  }

  const appliedRotate = rotate ?? rotateValue()

  return (
    <svg
      width={width}
      height={height}
      className={className}
      viewBox="0 0  17 9"
      fill="none"
      onClick={onClick}
      style={{
        transform: `rotate(${appliedRotate}deg)`,
        transition: duration ? `transform ${duration}ms ease` : undefined,
        cursor: onClick ? 'pointer' : undefined,
      }}
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M16.8261 0.173913C16.5918 -0.057971 16.211 -0.057971 15.9767 0.173913L8.50822 7.57971L1.02509 0.173913C0.790781 -0.057971 0.410035 -0.057971 0.175729 0.173913C-0.0585764 0.405797 -0.0585764 0.782609 0.175729 1.01449L8.06889 8.82609C8.18605 8.94203 8.33249 9 8.49357 9C8.64001 9 8.8011 8.94203 8.91825 8.82609L16.8114 1.01449C17.0604 0.782609 17.0604 0.405797 16.8261 0.173913Z"
        fill={color}
      />
    </svg>
  )
}
