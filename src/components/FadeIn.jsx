import { useInView } from '../hooks/useInView'

export function FadeIn({ children, delay = 0, className = '', style = {} }) {
  const [ref, vis] = useInView(0.1)
  return (
    <div
      ref={ref}
      className={className}
      style={{
        ...style,
        opacity: vis ? 1 : 0,
        transform: vis ? 'translateY(0)' : 'translateY(28px)',
        transition: `opacity 0.7s cubic-bezier(.16,1,.3,1) ${delay}s, transform 0.7s cubic-bezier(.16,1,.3,1) ${delay}s`,
      }}
    >
      {children}
    </div>
  )
}
