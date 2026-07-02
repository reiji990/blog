import { ReactNode } from 'react'

interface Props {
  children: ReactNode
}

export default function PageTitle({ children }: Props) {
  return (
    <h1 className="font-heading text-fg-strong [font-feature-settings:'palt'] text-3xl leading-9 tracking-tight sm:leading-10 md:leading-14">
      {children}
    </h1>
  )
}
