import { useLayoutEffect, useRef, type ReactNode } from 'react';

/** Keep the complete heading on one line, using the largest size its container allows. */
export default function FittedHeading({ children, className }: { children: ReactNode; className: string }) {
  const ref = useRef<HTMLHeadingElement>(null);
  useLayoutEffect(() => {
    const heading = ref.current!;
    let active = true;
    const fit = () => {
      if (!active) return;
      heading.style.removeProperty('font-size');
      const maximum = parseFloat(getComputedStyle(heading).fontSize) * Math.min(1, Math.sqrt(22 / Math.max(1, heading.textContent?.length ?? 1)));
      heading.style.fontSize = `${maximum}px`;
      const content = heading.firstElementChild as HTMLElement | null;
      if (!content || !heading.clientWidth) return;
      let low = 0;
      let high = maximum;
      if (content.getBoundingClientRect().width <= heading.clientWidth) return;
      for (let step = 0; step < 12; step++) {
        const size = (low + high) / 2;
        heading.style.fontSize = `${size}px`;
        if (content.getBoundingClientRect().width <= heading.clientWidth) low = size;
        else high = size;
      }
      heading.style.fontSize = `${low}px`;
    };
    let frame = 0;
    const observer = new ResizeObserver(() => { cancelAnimationFrame(frame); frame = requestAnimationFrame(fit); });
    observer.observe(heading.parentElement!);
    fit();
    document.fonts.ready.then(fit);
    document.fonts.addEventListener('loadingdone', fit);
    return () => { active = false; cancelAnimationFrame(frame); observer.disconnect(); document.fonts.removeEventListener('loadingdone', fit); };
  }, [children]);
  return <h2 ref={ref} className={className}>{children}</h2>;
}
