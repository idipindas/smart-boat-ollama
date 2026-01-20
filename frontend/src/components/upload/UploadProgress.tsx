import React from 'react';

interface UploadProgressProps {
  fileName: string;
  progress: number;
  fileSize: string;
}

const UploadProgress: React.FC<UploadProgressProps> = ({
  fileName,
  progress,
  fileSize,
}) => {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4">
      {/* File Info */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          {/* PDF Icon */}
          <div className="w-10 h-10 bg-red-100 rounded flex items-center justify-center flex-shrink-0">
            <svg
              className="w-6 h-6 text-red-600"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z"
                clipRule="evenodd"
              />
            </svg>
          </div>

          {/* File Details */}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">
              {fileName}
            </p>
            <p className="text-xs text-gray-500">{fileSize}</p>
          </div>
        </div>

        {/* Progress Percentage */}
        <span className="text-sm font-semibold text-primary-600">
          {Math.round(progress)}%
        </span>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
        <div
          className="bg-primary-500 h-2 rounded-full transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
};

export default UploadProgress;
