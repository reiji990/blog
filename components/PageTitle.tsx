import { ReactNode } from 'react'

interface Props {
  children: ReactNode
}

export default function PageTitle({ children }: Props) {
  return (
    <h1 className="text-3xl leading-9 tracking-tight text-gray-900 dark:text-gray-100 sm:leading-10 md:leading-14">
      {children}
    </h1>
  )
}
