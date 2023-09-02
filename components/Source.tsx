import { ReactNode } from 'react'

interface Props {
  children: ReactNode
}

export default function Source({ children }: Props) {
  return <div style={{ fontSize: '14px', textAlign: 'right', fontStyle: 'italic' }}>{children}</div>
}
