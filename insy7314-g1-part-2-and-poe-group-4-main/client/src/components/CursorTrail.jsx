import React, { useEffect, useRef } from 'react';

function CursorTrail() {
  const containerRef = useRef(null);
  const dotRef = useRef(null);
  const ringRef = useRef(null);

  useEffect(() => {
    // Only activate on devices with a fine pointer (mouse/trackpad), not touch
    if (window.matchMedia('(pointer: coarse)').matches) return;

    let isVisible = false;
    let isHovering = false;

    const onMouseMove = (e) => {
      const target = e.target;

      // Automatically hide the custom cursor completely when hovering over text inputs, textareas, or form fields
      const isTextInput = !!(
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.isContentEditable ||
          target.closest('input') ||
          target.closest('textarea') ||
          target.closest('.input-field') ||
          target.closest('.custom-dropdown-search'))
      );

      if (isTextInput) {
        if (containerRef.current && isVisible) {
          containerRef.current.style.opacity = '0';
          isVisible = false;
        }
        return;
      }

      const x = e.clientX;
      const y = e.clientY;

      if (!isVisible && containerRef.current) {
        containerRef.current.style.opacity = '1';
        isVisible = true;
      }

      // Direct zero-latency hardware-accelerated transform
      if (dotRef.current) {
        dotRef.current.style.transform = `translate3d(${x}px, ${y}px, 0)`;
      }
      if (ringRef.current) {
        ringRef.current.style.transform = `translate3d(${x}px, ${y}px, 0)`;
      }

      // Detect hover over interactive elements without triggering React state re-renders
      const interactive = !!(
        target &&
        (target.tagName === 'BUTTON' ||
          target.tagName === 'A' ||
          target.tagName === 'SELECT' ||
          target.closest('button') ||
          target.closest('a') ||
          target.classList?.contains('category-pill') ||
          target.classList?.contains('island-tab') ||
          target.closest('.spring-hover') ||
          target.closest('.glass-card') ||
          target.closest('.clickable-card') ||
          target.closest('.custom-dropdown-trigger') ||
          target.closest('.custom-dropdown-item'))
      );

      if (interactive !== isHovering) {
        isHovering = interactive;
        if (ringRef.current) {
          ringRef.current.classList.toggle('cursor-ring-hover', interactive);
        }
        if (dotRef.current) {
          dotRef.current.classList.toggle('cursor-dot-hover', interactive);
        }
      }
    };

    const onMouseLeave = () => {
      if (containerRef.current) {
        containerRef.current.style.opacity = '0';
        isVisible = false;
      }
    };

    window.addEventListener('mousemove', onMouseMove, { passive: true });
    document.addEventListener('mouseleave', onMouseLeave);

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseleave', onMouseLeave);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      style={{
        position: 'fixed',
        inset: 0,
        pointerEvents: 'none',
        zIndex: 99999,
        overflow: 'hidden',
        opacity: 0,
        transition: 'opacity 0.15s ease'
      }}
    >
      <div ref={dotRef} className="cursor-dot" />
      <div ref={ringRef} className="cursor-ring" />
    </div>
  );
}

export default CursorTrail;
