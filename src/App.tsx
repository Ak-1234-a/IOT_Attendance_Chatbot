import React, { useState, useEffect } from 'react';
import { Employee, Category } from './types';
import LeaderboardTable from './components/LeaderboardTable';
import CategoryNav from './components/CategoryNav';
import { Trophy } from 'lucide-react';

function App() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<Category>('All');

  useEffect(() => {
    // In a real application, you would fetch this data from an API
    fetch('/src/data/employees.csv')
      .then(response => response.text())
      .then(csv => {
        const [headers, ...rows] = csv.split('\n');
        const parsedEmployees = rows
          .filter(row => row.trim())
          .map(row => {
            const [employee_id, name, role, attendance_percentage, department] = row.split(',');
            return {
              employee_id,
              name,
              role,
              attendance_percentage: parseFloat(attendance_percentage),
              department,
            };
          })
          .sort((a, b) => b.attendance_percentage - a.attendance_percentage);
        setEmployees(parsedEmployees);
      });
  }, []);

  const filteredEmployees = employees.filter(
    employee => selectedCategory === 'All' || employee.department === selectedCategory
  );

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center">
            <Trophy className="w-8 h-8 text-blue-600 mr-3" />
            <h1 className="text-2xl font-bold text-gray-900">TCE Mills Employee Leaderboard</h1>
          </div>
        </div>

        <CategoryNav
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
        />

        {filteredEmployees.length > 0 ? (
          <LeaderboardTable employees={filteredEmployees} />
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500">No employees found in this category.</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;