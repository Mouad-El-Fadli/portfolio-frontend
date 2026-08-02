import React, { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollReveal } from './ScrollAnimations';
import './Skills.css';

const API = 'https://mouad12.pythonanywhere.com';

const Skills = () => {
  const { t, i18n } = useTranslation();
  const isFr = i18n.language === 'fr';
  const [skills, setSkills] = useState([]);

  useEffect(() => {
    fetch(`${API}/api/portfolio`)
      .then(res => res.json())
      .then(data => {
        if (data && data.skills) {
          setSkills(data.skills);
        }
      })
      .catch(err => console.error("Error fetching skills:", err));
  }, []);

  // Group skills by category
  const skillCategories = useMemo(() => {
    const groups = {};
    skills.forEach(skill => {
      const cat = skill.category || 'Autre';
      if (!groups[cat]) {
        groups[cat] = [];
      }
      groups[cat].push(skill);
    });
    
    return Object.keys(groups).map(catName => ({
      category: catName,
      // For a real app, you might want a translation dictionary for categories
      // Here we just use the string from DB directly
      categoryEn: catName, 
      skills: groups[catName]
    }));
  }, [skills]);

  return (
    <section id="skills" className="skills-section">
      <div className="section-container">
        <ScrollReveal animation="fade-up">
          <div className="section-header" style={{ textAlign: 'center', width: '100%' }}>
            <h2 className="section-title">{t('skills.title')}</h2>
          </div>
        </ScrollReveal>

        {skillCategories.length === 0 ? (
          <div style={{ textAlign: 'center', color: 'var(--text)' }}>
            Aucune compétence trouvée.
          </div>
        ) : (
          <div className="skills-categories">
            {skillCategories.map((cat, catIdx) => (
              <ScrollReveal key={catIdx} animation="fade-up" delay={catIdx * 0.1}>
                <div className="skill-category">
                  <h3 className="category-title">{cat.category}</h3>
                  <div className="skills-icon-grid">
                    {cat.skills.map((skill, skillIdx) => (
                      <div
                        className="skill-icon-card"
                        key={skillIdx}
                        style={{ '--skill-color': skill.color || '#1bd3a1' }}
                      >
                        <div className="skill-icon-wrapper">
                          {skill.icon ? (
                            <img src={skill.icon} alt={skill.name} className="skill-icon" />
                          ) : (
                            <span style={{ fontSize: '24px', fontWeight: 'bold' }}>{skill.name[0]}</span>
                          )}
                        </div>
                        <span className="skill-name">{skill.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default Skills;
