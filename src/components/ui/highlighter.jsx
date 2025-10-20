// src/components/ui/highlighter.jsx
import { useEffect, useRef } from "react";
import { useInView } from "framer-motion";
import { annotate } from "rough-notation";

export function Highlighter({
  children,
  action = "highlight",
  color = "#ffd1dc",
  strokeWidth = 1.5,
  animationDuration = 600,
  iterations = 2,
  padding = 2,
  multiline = true,
  isView = false, // when true, wait until in-view to run
  active = true, // <-- new: toggle highlight on/off instantly
}) {
  const elementRef = useRef(null);
  const annotationRef = useRef(null);
  const resizeRef = useRef(null);

  const isInView = useInView(elementRef, { once: true, margin: "-10%" });
  const shouldRun = active && (!isView || isInView);

  useEffect(() => {
    const el = elementRef.current;

    // If we shouldn't run right now, make sure any existing annotation is gone.
    if (!shouldRun || !el) {
      if (resizeRef.current) {
        try {
          resizeRef.current.disconnect();
        } catch {}
        resizeRef.current = null;
      }
      if (annotationRef.current) {
        try {
          // kill immediately
          annotationRef.current.hide();
          annotationRef.current.remove();
        } catch {}
        annotationRef.current = null;
      }
      return;
    }

    // Create & show the annotation
    const anno = annotate(el, {
      type: action,
      color,
      strokeWidth,
      animationDuration,
      iterations,
      padding,
      multiline,
    });
    annotationRef.current = anno;
    anno.show();

    // Keep it aligned on resizes
    const ro = new ResizeObserver(() => {
      try {
        anno.hide();
        anno.show();
      } catch {}
    });
    ro.observe(el);
    ro.observe(document.body);
    resizeRef.current = ro;

    // Cleanup: remove THIS instance (no re-creation)
    return () => {
      try {
        ro.disconnect();
      } catch {}
      resizeRef.current = null;
      try {
        anno.hide();
        anno.remove();
      } catch {}
      if (annotationRef.current === anno) annotationRef.current = null;
    };
  }, [
    shouldRun,
    action,
    color,
    strokeWidth,
    animationDuration,
    iterations,
    padding,
    multiline,
  ]);

  return (
    <span ref={elementRef} className="relative inline-block bg-transparent">
      {children}
    </span>
  );
}
