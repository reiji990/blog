import { ReactNode } from 'react'

interface Props {
  children: ReactNode
}

export default function PageSubTitle({ children }: Props) {
  return (
    <h2 className="text-3xl leading-9 tracking-tight text-gray-900 dark:text-gray-100 sm:text-4xl sm:leading-10 md:text-3xl md:leading-14">
      {children}
    </h2>
  )
}
