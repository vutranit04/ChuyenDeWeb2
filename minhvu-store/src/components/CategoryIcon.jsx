import React from 'react';
import { FiSmartphone, FiMonitor, FiHeadphones, FiCpu, FiGrid } from 'react-icons/fi';

export default function CategoryIcon({ name }) {
  if (!name) return <FiGrid />;
  const lowerName = name.toLowerCase();
  
  if (lowerName.includes('điện thoại') || lowerName.includes('phone') || lowerName.includes('mobile')) {
    return <FiSmartphone />;
  }
  if (lowerName.includes('laptop') || lowerName.includes('máy tính') || lowerName.includes('computer')) {
    return <FiMonitor />;
  }
  if (lowerName.includes('tai nghe') || lowerName.includes('headphones') || lowerName.includes('audio')) {
    return <FiHeadphones />;
  }
  if (lowerName.includes('phụ kiện') || lowerName.includes('accessory') || lowerName.includes('accessories')) {
    return <FiCpu />;
  }
  
  return <FiGrid />;
}
