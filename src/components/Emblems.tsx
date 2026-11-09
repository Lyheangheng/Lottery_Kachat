import React from 'react';

// Official Thai Red Cross Society emblem
export function RedCrossEmblem({ className = "w-10 h-10" }: { className?: string }) {
  return (
    <div className={`relative flex items-center justify-center bg-white rounded-full p-1 shadow-sm border border-red-100 ${className}`}>
      <svg viewBox="0 0 100 100" className="w-full h-full">
        {/* Red cross symbol */}
        <rect x="38" y="15" width="24" height="70" rx="3" fill="#dc2626" />
        <rect x="15" y="38" width="70" height="24" rx="3" fill="#dc2626" />
      </svg>
    </div>
  );
}

// Sisaket Provincial Prasat Emblem
export function SisaketEmblem({ className = "w-10 h-10" }: { className?: string }) {
  return (
    <div className={`relative flex items-center justify-center bg-white rounded-full p-1 shadow-sm border border-amber-200 ${className}`}>
      <svg viewBox="0 0 100 100" className="w-full h-full">
        <circle cx="50" cy="50" r="46" fill="#fef3c7" stroke="#b45309" strokeWidth="3" />
        {/* Stylized Khmer Prasat stone temple icon */}
        <path
          d="M50 15 L56 28 L64 30 L59 40 L65 48 L56 55 L58 72 L50 68 L42 72 L44 55 L35 48 L41 40 L36 30 L44 28 Z"
          fill="#b45309"
        />
        <rect x="46" y="68" width="8" height="14" fill="#78350f" />
        <path d="M30 82 Q50 78 70 82" stroke="#b45309" strokeWidth="3" fill="none" />
      </svg>
    </div>
  );
}

