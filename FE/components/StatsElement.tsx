import React from "react";
import { FaArrowUp, FaArrowDown } from "react-icons/fa6";

interface StatsProps {
  title: string;
  value: string | number;
  growth: number;
  loading?: boolean;
  color?: string;
}

const StatsElement = ({ title, value, growth, loading = false, color = "bg-blue-500" }: StatsProps) => {
  if (loading) {
    return <div className={`w-80 h-32 ${color} opacity-50 animate-pulse rounded-md max-md:w-full`}></div>;
  }

  const isPositive = growth >= 0;

  return (
    <div className={`w-80 h-32 ${color} text-white flex flex-col justify-center items-center rounded-md max-md:w-full shadow-md`}>
      <h4 className="text-xl text-gray-100">{title}</h4>
      <p className="text-2xl font-bold my-1">{typeof value === 'number' ? value.toLocaleString() : value}</p>
      
      <p className={`flex gap-x-1 items-center font-medium ${isPositive ? "text-green-200" : "text-red-200"}`}>
        {isPositive ? <FaArrowUp /> : <FaArrowDown />}
        {Math.abs(growth)}% {isPositive ? "Tăng" : "Giảm"}
      </p>
    </div>
  );
};

export default StatsElement;