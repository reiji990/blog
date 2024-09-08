'use client'
import mermaid from 'mermaid'
import { useEffect } from 'react'

const Mermaid = ({ chart }) => {
  useEffect(() => {
    mermaid.initialize({ startOnLoad: true })
    mermaid.contentLoaded()
  }, [chart])

  return <div className="mermaid">{chart}</div>
}

export default Mermaid
