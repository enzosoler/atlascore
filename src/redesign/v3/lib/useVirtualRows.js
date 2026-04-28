import { useEffect, useMemo, useRef, useState } from 'react';

export function useVirtualRows({ count, estimateSize = 64, overscan = 6 }) {
  const parentRef = useRef(null);
  const [viewport, setViewport] = useState({ scrollTop: 0, height: 0 });

  useEffect(() => {
    const node = parentRef.current;
    if (!node) return undefined;

    const update = () => {
      setViewport({
        scrollTop: node.scrollTop,
        height: node.clientHeight,
      });
    };

    update();
    node.addEventListener('scroll', update, { passive: true });

    let resizeObserver;
    if (typeof ResizeObserver !== 'undefined') {
      resizeObserver = new ResizeObserver(update);
      resizeObserver.observe(node);
    }

    return () => {
      node.removeEventListener('scroll', update);
      resizeObserver?.disconnect();
    };
  }, []);

  return useMemo(() => {
    const totalSize = count * estimateSize;
    const start = Math.max(0, Math.floor(viewport.scrollTop / estimateSize) - overscan);
    const visibleCount = Math.ceil((viewport.height || estimateSize) / estimateSize) + overscan * 2;
    const end = Math.min(count, start + visibleCount);
    const virtualRows = [];

    for (let index = start; index < end; index += 1) {
      virtualRows.push({
        index,
        start: index * estimateSize,
        size: estimateSize,
      });
    }

    return { parentRef, virtualRows, totalSize };
  }, [count, estimateSize, overscan, viewport.height, viewport.scrollTop]);
}
