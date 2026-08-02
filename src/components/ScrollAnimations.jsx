import { useEffect, useRef, useState, useCallback } from 'react';

/**
 * ═══════════════════════════════════════════════════════
 *   GTA VI CINEMATIC SCROLL ANIMATIONS
 *   Inspired by rockstargames.com/VI
 * ═══════════════════════════════════════════════════════
 */

/* ── useScrollReveal: Basic intersection reveal ─────── */
export function useScrollReveal(options = {}) {
  const ref = useRef(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('revealed');
          }
        });
      },
      {
        threshold: options.threshold || 0.15,
        rootMargin: options.rootMargin || '0px 0px -50px 0px',
      }
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [options.threshold, options.rootMargin]);

  return ref;
}

/* ── useScrollProgress: Returns 0→1 scroll progress ── */
export function useScrollProgress(ref) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const element = ref?.current;
    if (!element) return;

    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const rect = element.getBoundingClientRect();
          const windowHeight = window.innerHeight;
          const elementHeight = element.offsetHeight;
          
          // Progress: 0 when element enters viewport, 1 when it leaves
          const totalDistance = windowHeight + elementHeight;
          const currentPosition = windowHeight - rect.top;
          const p = Math.max(0, Math.min(1, currentPosition / totalDistance));
          
          setProgress(p);
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // initial
    return () => window.removeEventListener('scroll', handleScroll);
  }, [ref]);

  return progress;
}

/* ── ScrollReveal: Wrapper component ─────────────────── */
export function ScrollReveal({ 
  children, 
  animation = 'fade-up', 
  delay = 0, 
  duration = 0.8,
  className = '',
}) {
  const ref = useScrollReveal();

  const style = {
    '--reveal-delay': `${delay}s`,
    '--reveal-duration': `${duration}s`,
  };

  return (
    <div
      ref={ref}
      className={`scroll-reveal scroll-${animation} ${className}`}
      style={style}
    >
      {children}
    </div>
  );
}

/* ── CinematicText: Word-by-word text reveal on scroll ─ */
export function CinematicText({ text, className = '', tag = 'p' }) {
  const containerRef = useRef(null);
  const progress = useScrollProgress(containerRef);
  const words = text.split(' ');
  
  const Tag = tag;

  return (
    <div ref={containerRef} className={`cinematic-text-container ${className}`}>
      <Tag className="cinematic-text">
        {words.map((word, i) => {
          const wordProgress = Math.max(0, Math.min(1, 
            (progress * words.length * 1.5 - i) / 1.5
          ));
          return (
            <span 
              key={i} 
              className="cinematic-word"
              style={{
                display: 'inline-block',
                opacity: wordProgress,
                transform: `translateY(${(1 - wordProgress) * 20}px)`,
                filter: `blur(${(1 - wordProgress) * 4}px)`,
                marginRight: '0.3em'
              }}
            >
              {word}
            </span>
          );
        })}
      </Tag>
    </div>
  );
}

/* ── CountUp: Animated number counter ───────────────── */
export function CountUp({ end, duration = 2000, suffix = '', prefix = '' }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const hasAnimated = useRef(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !hasAnimated.current) {
          hasAnimated.current = true;
          const start = 0;
          const startTime = performance.now();

          const animate = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            // Ease out cubic
            const eased = 1 - Math.pow(1 - progress, 3);
            setCount(Math.floor(eased * (end - start) + start));

            if (progress < 1) {
              requestAnimationFrame(animate);
            }
          };

          requestAnimationFrame(animate);
        }
      },
      { threshold: 0.5 }
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [end, duration]);

  return (
    <span ref={ref} className="count-up">
      {prefix}{count}{suffix}
    </span>
  );
}

/* ── StickySection: GTA VI-style sticky parallax ─────── */
export function StickySection({ children, height = '200vh', className = '' }) {
  const stickyRef = useRef(null);
  const progress = useScrollProgress(stickyRef);

  return (
    <div 
      ref={stickyRef} 
      className={`sticky-section ${className}`}
      style={{ height }}
    >
      <div className="sticky-content" style={{ '--sticky-progress': progress }}>
        {typeof children === 'function' ? children(progress) : children}
      </div>
    </div>
  );
}

/* ── ParallaxImage: Background with parallax zoom ───── */
export function ParallaxImage({ src, alt = '', speed = 0.2, className = '' }) {
  const ref = useRef(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const rect = element.getBoundingClientRect();
          const windowHeight = window.innerHeight;
          const scrollProgress = (windowHeight - rect.top) / (windowHeight + rect.height);
          const offset = (scrollProgress - 0.5) * speed * 100;
          const scale = 1 + Math.abs(scrollProgress - 0.5) * speed;

          element.style.setProperty('--parallax-y', `${offset}%`);
          element.style.setProperty('--parallax-scale', scale);
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [speed]);

  return (
    <div ref={ref} className={`parallax-image-wrapper ${className}`}>
      <img 
        src={src} 
        alt={alt} 
        className="parallax-image"
        style={{
          transform: `translateY(var(--parallax-y, 0%)) scale(var(--parallax-scale, 1))`,
        }}
      />
    </div>
  );
}

/* ── Stagger Children ────────────────── */
export function StaggerReveal({ children, baseDelay = 0, staggerDelay = 0.1, animation = 'fade-up', className = '' }) {
  const ref = useScrollReveal();

  return (
    <div ref={ref} className={`scroll-reveal stagger-parent scroll-${animation} ${className}`}>
      {Array.isArray(children) ? children.map((child, index) => (
        <div
          key={index}
          className="stagger-child"
          style={{ '--stagger-delay': `${baseDelay + index * staggerDelay}s` }}
        >
          {child}
        </div>
      )) : children}
    </div>
  );
}

export default ScrollReveal;
