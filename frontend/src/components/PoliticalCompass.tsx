import React from 'react'
import './PoliticalCompass.css'

interface Props {
  economic: number  // -10 (left) to +10 (right)
  social: number    // -10 (libertarian) to +10 (authoritarian)
  color: string
  partyName: string
}

export default function PoliticalCompass({ economic, social, color, partyName }: Props) {
  const width = 300
  const height = 260
  const paddingLeft = 38
  const paddingRight = 42
  const paddingTop = 30
  const paddingBottom = 30
  const innerW = width - paddingLeft - paddingRight
  const innerH = height - paddingTop - paddingBottom

  // Convert coords (-10 to 10) to SVG pixel positions
  const dotX = paddingLeft + ((economic + 10) / 20) * innerW
  const dotY = paddingTop + ((10 - social) / 20) * innerH

  const midX = paddingLeft + innerW / 2
  const midY = paddingTop + innerH / 2

  return (
    <div className="compass-wrapper">
      <svg
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        className="compass-svg"
      >
        {/* Quadrant fills */}
        {/* Top-left: Authoritarian Left (red) */}
        <rect x={paddingLeft} y={paddingTop} width={innerW / 2} height={innerH / 2} fill="#f28b82" opacity="0.5" />
        {/* Top-right: Authoritarian Right (blue) */}
        <rect x={midX} y={paddingTop} width={innerW / 2} height={innerH / 2} fill="#74b9ff" opacity="0.5" />
        {/* Bottom-left: Libertarian Left (green) */}
        <rect x={paddingLeft} y={midY} width={innerW / 2} height={innerH / 2} fill="#90ee90" opacity="0.5" />
        {/* Bottom-right: Libertarian Right (purple) */}
        <rect x={midX} y={midY} width={innerW / 2} height={innerH / 2} fill="#d7a8f0" opacity="0.5" />

        {/* Grid lines */}
        {[-8,-6,-4,-2,2,4,6,8].map(v => {
          const px = paddingLeft + ((v + 10) / 20) * innerW
          const py = paddingTop + ((10 - v) / 20) * innerH
          return (
            <g key={v}>
              <line x1={px} y1={paddingTop} x2={px} y2={paddingTop + innerH} stroke="rgba(0,0,0,0.1)" strokeWidth="0.5" />
              <line x1={paddingLeft} y1={py} x2={paddingLeft + innerW} y2={py} stroke="rgba(0,0,0,0.1)" strokeWidth="0.5" />
            </g>
          )
        })}

        {/* Axes */}
        <line x1={midX} y1={paddingTop} x2={midX} y2={paddingTop + innerH} stroke="#1a1a1a" strokeWidth="2" />
        <line x1={paddingLeft} y1={midY} x2={paddingLeft + innerW} y2={midY} stroke="#1a1a1a" strokeWidth="2" />

        {/* Outer border */}
        <rect x={paddingLeft} y={paddingTop} width={innerW} height={innerH} fill="none" stroke="#1a1a1a" strokeWidth="2" />

        {/* Axis labels */}
        <text x={midX} y={paddingTop - 8} textAnchor="middle" fontSize="11" fontWeight="700" fill="#444" fontFamily="sans-serif">Authoritarian</text>
        <text x={midX} y={paddingTop + innerH + 18} textAnchor="middle" fontSize="11" fontWeight="700" fill="#444" fontFamily="sans-serif">Libertarian</text>
        <text x={paddingLeft - 6} y={midY + 4} textAnchor="end" fontSize="11" fontWeight="700" fill="#444" fontFamily="sans-serif">Left</text>
        <text x={paddingLeft + innerW + 6} y={midY + 4} textAnchor="start" fontSize="11" fontWeight="700" fill="#444" fontFamily="sans-serif">Right</text>

        {/* Party dot */}
        <circle cx={dotX} cy={dotY} r={10} fill={color} stroke="#1a1a1a" strokeWidth="2.5" />
        <circle cx={dotX} cy={dotY} r={4} fill="white" />
      </svg>
    </div>
  )
}
