import React from 'react';
import './PodiumAnimation.css';

export default function PodiumAnimation() {
  return (
    <div className="podium-container">
      <svg
        viewBox="0 0 200 300"
        xmlns="http://www.w3.org/2000/svg"
        className="podium-svg"
      >
        {/* Background / floor shadow */}
        <ellipse cx="100" cy="280" rx="80" ry="10" fill="#e2e8f0" />

        {/* Human Body */}
        <g className="human-figure">
          {/* Back Arm (Left) */}
          <g className="arm-left" transform-origin="70 120">
            <rect x="55" y="115" width="15" height="50" rx="7" fill="#1e293b" />
            <circle cx="62" cy="160" r="8" fill="#fbcfe8" />
          </g>

          {/* Torso */}
          <path
            d="M 60 120 L 140 120 L 130 220 L 70 220 Z"
            fill="#1e293b"
          />

          {/* Head & Neck */}
          <g className="human-head">
            <rect x="90" y="90" width="20" height="20" fill="#fbcfe8" />
            <circle cx="100" cy="70" r="25" fill="#fbcfe8" />
            {/* Hair */}
            <path d="M 75 70 C 75 40 125 40 125 70 C 130 50 70 50 75 70" fill="#334155" />
            {/* Glasses/Face detail */}
            <circle cx="95" cy="70" r="4" fill="#0f172a" />
            <circle cx="110" cy="70" r="4" fill="#0f172a" />
            <rect x="99" y="69" width="7" height="2" fill="#0f172a" />
            {/* Mouth */}
            <path d="M 95 85 Q 100 90 105 85" stroke="#f43f5e" strokeWidth="2" fill="none" className="mouth-talk" />
          </g>

          {/* Front Arm (Right) */}
          <g className="arm-right" transform-origin="130 120">
            <rect x="130" y="115" width="15" height="50" rx="7" fill="#1e293b" />
            {/* Hand resting/gesturing */}
            <circle cx="137" cy="160" r="8" fill="#fbcfe8" />
          </g>
        </g>

        {/* The Podium / Lecture Stand (Foreground) */}
        <g className="podium-stand">
          {/* Base */}
          <rect x="70" y="270" width="60" height="10" fill="#475569" />
          <polygon points="85,270 115,270 125,180 75,180" fill="#64748b" />
          {/* Top Panel / Reading Desk */}
          <polygon points="65,180 135,180 145,160 55,160" fill="#475569" />
          
          {/* Microphones */}
          <g transform="translate(90, 160)">
            <path d="M 0 0 L -10 -25" stroke="#1e293b" strokeWidth="3" />
            <circle cx="-11" cy="-28" r="4" fill="#334155" />
          </g>
          <g transform="translate(110, 160)">
            <path d="M 0 0 L 10 -25" stroke="#1e293b" strokeWidth="3" />
            <circle cx="11" cy="-28" r="4" fill="#334155" />
          </g>

          {/* Small emblem on podium */}
          <circle cx="100" cy="210" r="10" fill="#94a3b8" />
        </g>
      </svg>
    </div>
  );
}
