import React, { useEffect, useRef, useState } from "react";
import { cn } from "../ui";

/**
 * Shimmering placeholder block for skeleton loading screens on the public site.
 * Uses Tailwind's core `animate-pulse` (the Play CDN ships this; the animate
 * plugin classes are not available).
 */
export const Skel: React.FC<{ className?: string }> = ({ className }) => (
  <div
    className={cn("animate-pulse rounded-xl bg-slate-200/80", className)}
    aria-hidden="true"
  />
);

/**
 * Image that fades in once it has decoded, over a neutral placeholder tint.
 * Makes catalog/gallery imagery load gracefully instead of popping in.
 * Drop-in replacement for <img>; forwards all native props.
 */
export const Img: React.FC<React.ImgHTMLAttributes<HTMLImageElement>> = ({
  className,
  onLoad,
  onError,
  ...props
}) => {
  const ref = useRef<HTMLImageElement>(null);
  const [loaded, setLoaded] = useState(false);

  // Images that are already cached/complete fire their `load` event before
  // React attaches the handler, so `onLoad` never runs and the image would
  // stay invisible. Detect that on mount and reveal it immediately.
  useEffect(() => {
    if (ref.current?.complete) setLoaded(true);
  }, [props.src]);

  return (
    <img
      {...props}
      ref={ref}
      loading="lazy"
      onLoad={(e) => {
        setLoaded(true);
        onLoad?.(e);
      }}
      onError={(e) => {
        setLoaded(true);
        onError?.(e);
      }}
      className={cn(
        "transition-opacity duration-700 ease-out",
        loaded ? "opacity-100" : "opacity-0",
        className
      )}
    />
  );
};

/** Friendly centered state block (empty / error / not-found) for public pages. */
export const PublicState: React.FC<{
  icon: React.FC<{ className?: string }>;
  title: string;
  message?: string;
  action?: React.ReactNode;
  className?: string;
}> = ({ icon: Icon, title, message, action, className }) => (
  <div
    className={cn(
      "flex flex-col items-center rounded-2xl border border-dashed border-slate-200 bg-white px-6 py-14 text-center",
      className
    )}
  >
    <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-50 ring-1 ring-slate-100">
      <Icon className="h-7 w-7 text-slate-300" />
    </div>
    <h3 className="mb-1.5 text-lg font-black uppercase tracking-tight text-slate-900">
      {title}
    </h3>
    {message && (
      <p className="mx-auto mb-6 max-w-sm text-sm font-medium leading-relaxed text-slate-400">
        {message}
      </p>
    )}
    {action}
  </div>
);
