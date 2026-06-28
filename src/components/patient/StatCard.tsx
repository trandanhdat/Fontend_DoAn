import React from 'react';
import { Card, CardContent } from '../ui/card';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  description?: string;
  bgColor?: string;
  iconColor?: string;
}

export const StatCard: React.FC<StatCardProps> = ({ 
  title, 
  value, 
  icon, 
  description, 
  bgColor = "bg-white", 
  iconColor = "text-slate-600" 
}) => {
  return (
    <Card className={`border-none shadow-sm ${bgColor}`}>
      <CardContent className="p-6 flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500 mb-1">{title}</p>
          <h3 className="text-2xl font-bold text-slate-800">{value}</h3>
          {description && <p className="text-xs text-slate-400 mt-1">{description}</p>}
        </div>
        <div className={`p-3 rounded-xl ${iconColor} bg-opacity-10 bg-current`}>
          {icon}
        </div>
      </CardContent>
    </Card>
  );
};
