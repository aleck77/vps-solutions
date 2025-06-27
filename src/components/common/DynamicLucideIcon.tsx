'use client';

import { Smile, icons, type LucideProps } from 'lucide-react';

// Helper to convert string to PascalCase for Lucide icons
// e.g., 'shield-check' -> 'ShieldCheck'
function toPascalCase(str: string) {
  if (!str) return '';
  return str
    .split(/[-_\s]+/)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join('');
}

interface DynamicLucideIconProps extends LucideProps {
  name: string;
}

const DynamicLucideIcon = ({ name, ...props }: DynamicLucideIconProps) => {
  const iconNameInPascalCase = toPascalCase(name);
  // It's important to use PascalCase for component lookups
  const IconComponent = icons[iconNameInPascalCase as keyof typeof icons];

  if (!IconComponent) {
    console.warn(`[DynamicLucideIcon] Icon not found for name: "${name}". Rendering fallback 'Smile' icon.`);
    return <Smile {...props} />;
  }

  return <IconComponent {...props} />;
};

export default DynamicLucideIcon;
