import React, { useEffect, useRef } from 'react';
import { Mail } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { CountUp } from './ScrollAnimations';
import './Hero.css';

const Hero = () => {
  const { t } = useTranslation();
  const sectionRef = useRef(null);

  // GTA VI style: hero zooms in and fades as you scroll
  useEffect(() => {
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          if (sectionRef.current) {
            const scrollY = window.scrollY;
            const vh = window.innerHeight;
            const progress = Math.min(scrollY / vh, 1);
            
            // Scale from 1 to 1.15, opacity from 1 to 0
            const scale = 1 + progress * 0.15;
            const opacity = 1 - progress * 1.2;
            const blur = progress * 8;
            const translateY = progress * 100;

            sectionRef.current.style.setProperty('--hero-scale', scale);
            sectionRef.current.style.setProperty('--hero-opacity', Math.max(0, opacity));
            sectionRef.current.style.setProperty('--hero-blur', `${blur}px`);
            sectionRef.current.style.setProperty('--hero-translate', `${translateY}px`);
          }
          ticking = false;
        });
        ticking = true;
      }
    };
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <section id="home" className="hero-section" ref={sectionRef}>
      <div className="hero-bg-grid"></div>
      <div className="hero-particles">
        {[...Array(20)].map((_, i) => (
          <div key={i} className="particle" style={{
            '--x': `${Math.random() * 100}%`,
            '--y': `${Math.random() * 100}%`,
            '--duration': `${3 + Math.random() * 4}s`,
            '--delay': `${Math.random() * 3}s`,
            '--size': `${2 + Math.random() * 4}px`,
          }}></div>
        ))}
      </div>
      
      <div className="hero-inner">
        <div className="hero-left">
          <p className="hero-greeting">{t('hero.greeting')}</p>
          <h1 className="hero-title">{t('hero.title')}</h1>
          <p className="hero-subtitle">{t('hero.subtitle')}</p>
          
          {/* Stats counters */}
          <div className="hero-stats">
            <div className="stat-item">
              <CountUp end={12} suffix="+" />
              <span className="stat-label">Projets</span>
            </div>
            <div className="stat-item">
              <CountUp end={8} suffix="+" />
              <span className="stat-label">Technologies</span>
            </div>
          </div>
          
          <div className="hero-actions">
            <a href="#portfolio" className="btn-primary">{t('hero.btn_portfolio')}</a>
            <a href="#contact" className="btn-outline">{t('hero.btn_contact')}</a>
          </div>
          
          <div className="hero-socials">
            <a href="https://github.com/Mouad-El-Fadli" target="_blank" rel="noreferrer" className="social-icon" aria-label="GitHub">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
            </a>
            <a href="https://www.linkedin.com/in/mouad-el-fadli-70b729197/" target="_blank" rel="noreferrer" className="social-icon" aria-label="LinkedIn">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>
            </a>
            <a href="mailto:elfadlimoad@gmail.com" className="social-icon" aria-label="Email">
              <Mail size={20} />
            </a>
          </div>
        </div>
        <div className="hero-right">
          <div className="hero-image-wrapper">
            <img src="/profile.png" alt="Mouad El fadli" className="hero-photo" />
            <div className="hero-image-border"></div>
          </div>
        </div>
      </div>

      <div className="scroll-indicator">
        <div className="scroll-line"></div>
        <span>SCROLL</span>
      </div>
    </section>
  );
};

export default Hero;
