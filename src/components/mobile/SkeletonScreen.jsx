import React from "react";

const SkeletonBlock = ({ className = "" }) => (
  <div className={`animate-pulse bg-gray-200 dark:bg-[#252525] rounded ${className}`} />
);

const SkeletonScreen = ({ variant = "default" }) => {
  if (variant === "trading") {
    return (
      <div className="p-4 space-y-4">
        <SkeletonBlock className="h-6 w-40" />
        <SkeletonBlock className="h-48 w-full rounded-lg" />
        <div className="space-y-2">
          <SkeletonBlock className="h-4 w-full" />
          <SkeletonBlock className="h-4 w-full" />
          <SkeletonBlock className="h-4 w-full" />
          <SkeletonBlock className="h-4 w-3/4" />
        </div>
        <SkeletonBlock className="h-12 w-full rounded-lg" />
      </div>
    );
  }

  if (variant === "list") {
    return (
      <div className="p-4 space-y-3">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="flex items-center gap-3">
            <SkeletonBlock className="h-10 w-10 rounded-full" />
            <div className="flex-1 space-y-2">
              <SkeletonBlock className="h-4 w-3/4" />
              <SkeletonBlock className="h-3 w-1/2" />
            </div>
            <SkeletonBlock className="h-4 w-16" />
          </div>
        ))}
      </div>
    );
  }

  if (variant === "portfolio") {
    return (
      <div className="p-4 space-y-4">
        <SkeletonBlock className="h-10 w-48 mx-auto" />
        <SkeletonBlock className="h-4 w-24 mx-auto" />
        <div className="flex gap-2 justify-center">
          <SkeletonBlock className="h-10 w-24 rounded-lg" />
          <SkeletonBlock className="h-10 w-24 rounded-lg" />
          <SkeletonBlock className="h-10 w-24 rounded-lg" />
        </div>
        <div className="space-y-3 mt-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="flex items-center gap-3">
              <SkeletonBlock className="h-10 w-10 rounded-full" />
              <div className="flex-1 space-y-2">
                <SkeletonBlock className="h-4 w-20" />
                <SkeletonBlock className="h-3 w-16" />
              </div>
              <SkeletonBlock className="h-4 w-20" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Default skeleton
  return (
    <div className="p-4 space-y-4">
      <SkeletonBlock className="h-6 w-48" />
      <SkeletonBlock className="h-4 w-full" />
      <SkeletonBlock className="h-4 w-5/6" />
      <SkeletonBlock className="h-32 w-full rounded-lg" />
      <SkeletonBlock className="h-4 w-3/4" />
      <SkeletonBlock className="h-4 w-full" />
      <SkeletonBlock className="h-12 w-full rounded-lg" />
    </div>
  );
};

export default SkeletonScreen;
