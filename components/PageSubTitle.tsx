import { ReactNode } from 'react'

interface Props {
  children: ReactNode
}

export default function PageSubTitle({ children }: Props) {
  return (
    <h2 className="text-fg-strong [font-feature-settings:'palt'] text-3xl leading-9 tracking-tight sm:leading-10 md:leading-14">
      {children}
    </h2>
  )
}
