import { ReactNode } from 'react'

const Dots = ({ children }: { children: ReactNode }) => (
  <span style={{ textEmphasis: 'filled sesame', WebkitTextEmphasis: 'filled sesame' }}>
    {children}
  </span>
)

export default Dots
