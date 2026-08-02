import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollReveal } from './ScrollAnimations';
import './Portfolio.css';

// Map project names to their generated images
const projectImageMap = {
  'bank-management': '/bank_management.png',
  'bank-projet-backend': '/bank_management.png',
  'frontend-bank-projet': '/bank_management.png',
  'gestion-etudiants': '/gestion_etudiants.png',
  'gestion_scolarite': '/gestion_etudiants.png',
  'projetLBPH-': '/facial_recognition.png',
  'tp-react': '/react_app.png',
  'wheater': '/weather_app.png',
  'projet_php': '/php_project.png',
  'tp8': '/react_app.png',
  'projectc': '/php_project.png',
};

const Portfolio = () => {
  const { t } = useTranslation();
  const [projects, setProjects] = useState([]);

  useEffect(() => {
    fetch('https://mouad12.pythonanywhere.com/api/portfolio')
      .then(res => res.json())
      .then(data => {
        if (data && data.projects) {
          setProjects(data.projects);
        }
      })
      .catch(err => console.error("Error fetching projects:", err));
  }, []);

  const getImageUrl = (project) => {
    // Check if user uploaded a custom image first
    if (project.image_url) {
      return project.image_url;
    }
    // Check our custom image map next
    if (projectImageMap[project.title]) {
      return projectImageMap[project.title];
    }
    // Fallback placeholder
    return `https://via.placeholder.com/600x400/2a2a35/1bd3a1?text=${encodeURIComponent(project.title)}`;
  };

  const formatTitle = (title) => {
    // Make GitHub repo names more readable
    return title
      .replace(/-/g, ' ')
      .replace(/_/g, ' ')
      .replace(/\b\w/g, l => l.toUpperCase());
  };

  return (
    <section id="portfolio" className="portfolio-section">
      <div className="section-container">
        <ScrollReveal animation="fade-up">
          <div className="section-header" style={{ textAlign: 'center', width: '100%' }}>
            <h2 className="section-title">{t('portfolio.title')}</h2>
          </div>
        </ScrollReveal>

        <div className="portfolio-grid">
          {projects.map((project, index) => (
            <ScrollReveal key={index} animation="fade-up" delay={index * 0.08} duration={0.7}>
              <div className="portfolio-card">
                <div className="card-image" style={{ backgroundImage: `url(${getImageUrl(project)})` }}>
                  <div className="card-overlay">
                    <a href={project.link || "#"} className="view-btn" target="_blank" rel="noreferrer">
                      <span className="view-btn-icon">↗</span> View Project
                    </a>
                  </div>
                </div>
                <div className="card-content">
                  <h3>{formatTitle(project.title)}</h3>
                  <p className="card-description">{project.description}</p>
                  <div className="card-tags">
                    {project.technologies && project.technologies.split(',').map((tech, i) => (
                      <span key={i} className="tech-tag">{tech.trim()}</span>
                    ))}
                    {!project.technologies?.includes(',') && project.technologies && (
                      <span className="tech-tag">{project.technologies}</span>
                    )}
                  </div>
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Portfolio;
