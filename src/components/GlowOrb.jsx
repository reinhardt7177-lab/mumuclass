export function GlowOrb({ x, y, color, size = 500, opacity = 0.12 }) {
  return (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: y,
        width: size,
        height: size,
        background: `radial-gradient(circle, ${color} 0%, transparent 70%)`,
        opacity,
        pointerEvents: 'none',
        transform: 'translate(-50%,-50%)',
      }}
    />
  )
}
