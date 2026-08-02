import React, { useState, useEffect, useRef } from 'react';
import { Menu, X, Globe, ChevronDown } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import './Navbar.css';

const Navbar = () => {
  const { t, i18n } = useTranslation();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const langRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (langRef.current && !langRef.current.contains(event.target)) {
        setLangOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const changeLanguage = (lang) => {
    i18n.changeLanguage(lang);
    setLangOpen(false);
  };

  const getLangName = (code) => {
    switch(code) {
      case 'fr': return 'Français';
      case 'en': return 'English';
      case 'es': return 'Español';
      default: return 'English';
    }
  };

  return (
    <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>
      <div className="navbar-content">
        <a href="#home" className="logo">
          <span className="logo-accent">P</span>ortfolio
        </a>
        
        <div className="menu-toggle" onClick={() => setMenuOpen(!menuOpen)}>
          {menuOpen ? <X size={24} /> : <Menu size={24} />}
        </div>

        <ul className={`nav-links ${menuOpen ? 'open' : ''}`}>
          <li><a href="#about" onClick={() => setMenuOpen(false)}>{t('nav.about')}</a></li>
          <li><a href="#skills" onClick={() => setMenuOpen(false)}>{t('nav.skills')}</a></li>
          <li><a href="#portfolio" onClick={() => setMenuOpen(false)}>{t('nav.portfolio')}</a></li>
          <li><a href="#contact" className="contact-btn" onClick={() => setMenuOpen(false)}>{t('nav.contact')}</a></li>
          
          <li className="lang-selector" ref={langRef}>
            <button className="lang-btn" onClick={() => setLangOpen(!langOpen)}>
              <Globe size={18} />
              <span>{getLangName(i18n.language)}</span>
              <ChevronDown size={16} className={`chevron ${langOpen ? 'up' : ''}`} />
            </button>
            {langOpen && (
              <ul className="lang-dropdown">
                <li onClick={() => changeLanguage('fr')}>Français</li>
                <li onClick={() => changeLanguage('en')}>English</li>
                <li onClick={() => changeLanguage('es')}>Español</li>
              </ul>
            )}
          </li>
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;
