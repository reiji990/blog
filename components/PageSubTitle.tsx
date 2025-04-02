import { ReactNode } from 'react'

interface Props {
  children: ReactNode
}

export default function PageSubTitle({ children }: Props) {
  return (
    <h2 className="text-3xl leading-9 tracking-tight text-gray-900 sm:leading-10 md:leading-14 dark:text-gray-100">
      {children}
    </h2>
  )
}
