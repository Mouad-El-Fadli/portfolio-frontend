import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollReveal, CinematicText } from './ScrollAnimations';
import './About.css';

const API = 'https://mouad12.pythonanywhere.com';

const About = () => {
  const { t, i18n } = useTranslation();
  const isFr = i18n.language === 'fr';
  
  const [education, setEducation] = useState([]);
  const [bio, setBio] = useState({
    text1_fr: '', text1_en: '',
    text2_fr: '', text2_en: ''
  });

  const [profileImageTimestamp, setProfileImageTimestamp] = useState(Date.now());

  useEffect(() => {
    fetch(`${API}/api/portfolio`)
      .then(res => res.json())
      .then(data => {
        if (data && data.education) {
          setEducation(data.education);
        }
        if (data && data.bio) {
          setBio(data.bio);
        }
      })
      .catch(err => console.error("Error fetching portfolio data:", err));

    const handleImageUpdate = (e) => {
      if (e.detail) setProfileImageTimestamp(e.detail);
      else setProfileImageTimestamp(Date.now());
    };
    window.addEventListener('profileImageUpdated', handleImageUpdate);
    return () => window.removeEventListener('profileImageUpdated', handleImageUpdate);
  }, []);

  // Determine which text to show based on language
  const bioText1 = i18n.language === 'fr' ? bio.text1_fr : (i18n.language === 'es' ? bio.text1_es : bio.text1_en);
  const bioText2 = i18n.language === 'fr' ? bio.text2_fr : (i18n.language === 'es' ? bio.text2_es : bio.text2_en);

  // Fallbacks if backend doesn't have data yet
  const display1 = bioText1 || t('about.description_1');
  const display2 = bioText2 || t('about.description_2');

  return (
    <section id="about" className="about-section">
      {/* ── Cinematic intro text ─────────── */}
      <div className="about-cinematic">
        <CinematicText 
          text={display1}
          className="about-cinematic-text"
          tag="p"
        />
      </div>

      {/* ── Profile card ─────────────────── */}
      <div className="section-container">
        <ScrollReveal animation="fade-up">
          <div className="section-header">
            <h2 className="section-title">{t('about.title')}</h2>
          </div>
        </ScrollReveal>
        
        <div className="about-layout">
          <ScrollReveal animation="slide-left" delay={0.1}>
            <div className="about-image">
              <img src={`/profile.png?v=${profileImageTimestamp}`} alt="Profile" />
            </div>
          </ScrollReveal>
          <ScrollReveal animation="slide-right" delay={0.2}>
            <div className="about-content">
              <p>{display2}</p>
            </div>
          </ScrollReveal>
        </div>
      </div>

      {/* ── Education Timeline ───────────── */}
      <div className="section-container education-section">
        <ScrollReveal animation="fade-up">
          <div className="section-header" style={{ textAlign: 'center', width: '100%' }}>
            <h2 className="section-title">{t('about.education_title')}</h2>
          </div>
        </ScrollReveal>

        <div className="timeline">
          <div className="timeline-line"></div>
          {education.map((edu, index) => (
            <ScrollReveal 
              key={edu.id || index} 
              animation={index % 2 === 0 ? 'slide-left' : 'slide-right'} 
              delay={index * 0.15}
            >
              <div className={`timeline-item ${index % 2 === 0 ? 'left' : 'right'}`}>
                <div className="timeline-dot">
                  <div className="timeline-dot-inner"></div>
                </div>
                <div className="timeline-card">
                  <div className="timeline-year">{edu.year}</div>
                  <h3 className="timeline-degree">{edu.degree}</h3>
                  <p className="timeline-school">{edu.school}</p>
                  <div className="timeline-meta">
                    <span className="timeline-city">📍 {edu.city}</span>
                    {edu.mention && <span className="timeline-mention">🏆 {edu.mention}</span>}
                  </div>
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>

      <div className="separator"></div>
    </section>
  );
};

export default About;
