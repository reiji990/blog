import { ReactNode } from 'react'

interface Props {
  children: ReactNode
}

export default function Source({ children }: Props) {
  return (
    <div
      style={{
        fontSize: '0.8125rem',
        textAlign: 'right',
        fontStyle: 'normal',
        color: 'var(--muted)',
        marginTop: '0.5em',
      }}
    >
      {children}
    </div>
  )
}
