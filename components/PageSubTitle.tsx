import { ReactNode } from 'react'

interface Props {
  children: ReactNode
}

export default function PageSubTitle({ children }: Props) {
  return (
    <h2 className="text-fg-strong text-3xl leading-9 tracking-[0.02em] sm:leading-10 md:leading-14">
      {children}
    </h2>
  )
}
