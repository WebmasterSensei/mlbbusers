'use client';

import { useEffect, useRef, type FC, type ReactNode } from 'react';
import { gsap } from 'gsap';

interface GridMotionProps {
  items?: (string | ReactNode)[];
  gradientColor?: string;
  /**
   * Extra classes for the root. Upstream hard-coded `h-screen` plus a
   * 150vw/150vh grid, which only works when GridMotion is the whole page;
   * here it is a backdrop inside a bounded panel, so height is caller-controlled.
   */
  className?: string;
  /** Rows of parallax drift. Upstream fixed this at 4. */
  rows?: number;
  columns?: number;
}

const GridMotion: FC<GridMotionProps> = ({
  items = [],
  gradientColor = 'black',
  className = '',
  rows: rowCount = 4,
  columns: columnCount = 7,
}) => {
  const gridRef = useRef<HTMLDivElement>(null);
  const rowRefs = useRef<(HTMLDivElement | null)[]>([]);
  // Upstream seeded this with `window.innerWidth` at render time, which throws
  // during the server render of a client component. Seeded to 0 and set in the
  // effect instead.
  const mouseXRef = useRef<number>(0);

  const totalItems = rowCount * columnCount;
  const defaultItems = Array.from({ length: totalItems }, (_, index) => `Item ${index + 1}`);
  const combinedItems = items.length > 0 ? items.slice(0, totalItems) : defaultItems;

  useEffect(() => {
    gsap.ticker.lagSmoothing(0);

    mouseXRef.current = window.innerWidth / 2;
    const handleMouseMove = (e: MouseEvent): void => {
      mouseXRef.current = e.clientX;
    };

    const updateMotion = (): void => {
      const maxMoveAmount = 300;
      const baseDuration = 0.8;
      const inertiaFactors = [0.6, 0.4, 0.3, 0.2];

      rowRefs.current.forEach((row, index) => {
        if (row) {
          const direction = index % 2 === 0 ? 1 : -1;
          const moveAmount = ((mouseXRef.current / window.innerWidth) * maxMoveAmount - maxMoveAmount / 2) * direction;

          gsap.to(row, {
            x: moveAmount,
            duration: baseDuration + inertiaFactors[index % inertiaFactors.length],
            ease: 'power3.out',
            overwrite: 'auto'
          });
        }
      });
    };

    const removeAnimationLoop = gsap.ticker.add(updateMotion);
    window.addEventListener('mousemove', handleMouseMove);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      removeAnimationLoop();
    };
  }, []);

  return (
    <div ref={gridRef} className={`h-full w-full overflow-hidden ${className}`}>
      <section
        className="relative flex h-full w-full items-center justify-center overflow-hidden"
        style={{
          background: `radial-gradient(circle, ${gradientColor} 0%, transparent 100%)`
        }}
      >
        <div className="absolute inset-0 pointer-events-none z-[4] bg-[length:250px]"></div>
        <div
          className="absolute left-1/2 top-1/2 flex-none origin-center -translate-x-1/2 -translate-y-1/2 rotate-[-15deg] grid w-[160%] gap-4"
          style={{ height: `${rowCount * 118}px` }}
        >
          {Array.from({ length: rowCount }, (_, rowIndex) => (
            <div
              key={rowIndex}
              className="grid gap-4"
              style={{
                gridTemplateColumns: `repeat(${columnCount}, minmax(0, 1fr))`,
                willChange: 'transform, filter'
              }}
              ref={el => {
                if (el) rowRefs.current[rowIndex] = el;
              }}
            >
              {Array.from({ length: columnCount }, (_, itemIndex) => {
                const content = combinedItems[rowIndex * columnCount + itemIndex];
                return (
                  <div key={itemIndex} className="relative">
                    <div className="relative flex h-full w-full items-center justify-center overflow-hidden rounded-[10px] bg-[#111] text-white text-[1.5rem]">
                      {typeof content === 'string' && content.startsWith('http') ? (
                        <div
                          className="absolute left-0 top-0 h-full w-full bg-cover bg-center"
                          style={{ backgroundImage: `url(${content})` }}
                        ></div>
                      ) : (
                        <div className="p-4 text-center z-[1]">{content}</div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
        <div className="relative h-full w-full top-0 left-0 pointer-events-none"></div>
      </section>
    </div>
  );
};

export default GridMotion;
