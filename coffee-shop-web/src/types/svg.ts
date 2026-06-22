export interface SVGProps {
  color?: string
  width?: number | string
  height?: number | string
  className?: string
  onClick?: () => void
}
export enum DIRECTION {
  UP = 'up',
  DOWN = 'down',
  LEFT = 'left',
  RIGHT = 'right',
}
