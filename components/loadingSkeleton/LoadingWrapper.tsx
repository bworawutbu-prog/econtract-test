"use client";

import React from 'react';
import { PDFSkeleton, TableSkeleton, FormSkeleton } from './';

export type SkeletonType = 'pdf' | 'table' | 'form' | 'upload';

interface LoadingWrapperProps {
  loading: boolean;
  type: SkeletonType;
  children: React.ReactNode;
  progress?: number;
  message?: string;
}

const UploadProgress: React.FC<{ progress: number; message?: string }> = ({ progress, message }) => (
  <div className="flex flex-col items-center justify-center h-40 space-y-4">
    <div className="w-16 h-16 relative">
      <div className="w-16 h-16 rounded-full border-4 border-gray-200"></div>
      <div 
        className="w-16 h-16 rounded-full border-4 border-blue-500 border-t-transparent animate-spin absolute top-0 left-0"
        style={{ 
          transform: `rotate(${progress * 3.6}deg)`,
          transition: 'transform 0.3s ease-in-out'
        }}
      ></div>
    </div>
    <div className="text-center">
      <div className="text-lg font-semibold text-gray-700">
        {progress}%
      </div>
      <div className="text-sm text-gray-500">
        {message || 'กำลังประมวลผล...'}
      </div>
    </div>
    <div className="w-64 bg-gray-200 rounded-full h-2">
      <div 
        className="bg-blue-500 h-2 rounded-full transition-all duration-300 ease-out"
        style={{ width: `${progress}%` }}
      ></div>
    </div>
  </div>
);

const LoadingWrapper: React.FC<LoadingWrapperProps> = ({ 
  loading, 
  type, 
  children, 
  progress = 0, 
  message 
}) => {
  if (!loading) return <>{children}</>;

  switch (type) {
    case 'pdf':
      return <PDFSkeleton />;
    case 'table':
      return <TableSkeleton />;
    case 'form':
      return <FormSkeleton />;
    case 'upload':
      return <UploadProgress progress={progress} message={message} />;
    default:
      return <TableSkeleton />;
  }
};

export default LoadingWrapper; 