import React, { useState, useEffect } from 'react';
import './Experience.css';
import { ScrollReveal } from './ScrollAnimations';

const API = 'https://mouad12.pythonanywhere.com';

const Experience = () => {
  const [experiences, setExperiences] = useState([]);
  const [cvUrl, setCvUrl] = useState(null);

  useEffect(() => {
    fetch(`${API}/api/experiences`)
      .then(r => r.json())
      .then(data => setExperiences(data))
      .catch(() => {});

    fetch(`${API}/api/cv`)
      .then(r => r.json())
      .then(data => { if (data.exists) setCvUrl(data.url); })
      .catch(() => {});
  }, []);

  if (experiences.length === 0 && !cvUrl) return null;

  return (
    <section className="experience-section" id="experience">
      <div className="section-container">
        <ScrollReveal animation="fade-up">
          <div className="section-header" style={{ textAlign: 'center', width: '100%' }}>
            <h2 className="section-title">
              <span className="title-accent">💼</span> Expérience
            </h2>
          </div>
        </ScrollReveal>

        {experiences.length > 0 && (
          <div className="experience-timeline">
            {experiences.map((exp, index) => (
              <ScrollReveal key={exp.id} animation="fade-up" delay={index * 0.1}>
                <div className="experience-card">
                  <div className="exp-dot" />
                  <div className="exp-content">
                    <div className="exp-header">
                      <div>
                        <h3 className="exp-title">{exp.title}</h3>
                        <p className="exp-company">🏢 {exp.company}</p>
                      </div>
                      <div className="exp-meta">
                        <span className="exp-period">📅 {exp.period}</span>
                        {exp.location && (
                          <span className="exp-location">📍 {exp.location}</span>
                        )}
                      </div>
                    </div>
                    {exp.description && (
                      <p className="exp-description">{exp.description}</p>
                    )}
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        )}

        {cvUrl && (
          <ScrollReveal animation="fade-up" delay={0.2}>
            <div className="cv-download-wrapper">
            <a
              href={cvUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="cv-btn"
              download="CV_Mouad_El_Fadli.pdf"
            >
              📄 Télécharger mon CV
            </a>
          </div>
          </ScrollReveal>
        )}
      </div>
    </section>
  );
};

export default Experience;
