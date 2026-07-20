import React from 'react';

const Logo = ({ ...props }) => (
  <svg
    width="32"
    height="32"
    viewBox="0 0 32 32"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    {/* High-fidelity, premium HealthOS icon: a rounded medical cross in standard emerald or cyan color */}
    <rect width="100%" height="100%" rx="8" fill="#10B981" />
    <path
      d="M16 8V24M8 16H24"
      stroke="white"
      strokeWidth="4"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export default Logo;
