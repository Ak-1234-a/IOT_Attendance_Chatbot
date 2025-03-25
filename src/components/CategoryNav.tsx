import React from 'react';
import { Category } from '../types';
import { Users, Building2, Factory, Shield, Wrench } from 'lucide-react';

interface CategoryNavProps {
  selectedCategory: Category;
  onCategoryChange: (category: Category) => void;
}

const categories: { id: Category; label: string; icon: React.ReactNode }[] = [
  { id: 'All', label: 'All Employees', icon: <Users className="w-5 h-5" /> },
  { id: 'Management', label: 'Management', icon: <Building2 className="w-5 h-5" /> },
  { id: 'Production', label: 'Production', icon: <Factory className="w-5 h-5" /> },
  { id: 'Quality', label: 'Quality', icon: <Shield className="w-5 h-5" /> },
  { id: 'Maintenance', label: 'Maintenance', icon: <Wrench className="w-5 h-5" /> },
];

const CategoryNav: React.FC<CategoryNavProps> = ({ selectedCategory, onCategoryChange }) => {
  return (
    <div className="flex flex-wrap gap-2 mb-6">
      {categories.map(({ id, label, icon }) => (
        <button
          key={id}
          onClick={() => onCategoryChange(id)}
          className={`flex items-center px-4 py-2 rounded-lg transition-colors ${
            selectedCategory === id
              ? 'bg-blue-600 text-white'
              : 'bg-white text-gray-600 hover:bg-gray-50'
          }`}
        >
          {icon}
          <span className="ml-2">{label}</span>
        </button>
      ))}
    </div>
  );
};

export default CategoryNav;