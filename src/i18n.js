import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import enTranslation from './locales/en.json';
import frTranslation from './locales/fr.json';

i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: enTranslation },
      fr: { translation: frTranslation },
      es: {
        translation: {
          nav: {
            home: "Inicio",
            about: "Sobre Mí",
            skills: "Habilidades",
            portfolio: "Portafolio",
            contact: "Contacto",
            resume: "CV"
          },
          hero: {
            greeting: "Hola, soy",
            title: "Ingeniero de Software",
            subtitle: "Convirtiendo problemas complejos en soluciones elegantes.",
            cta_primary: "Ver Mi Trabajo",
            cta_secondary: "Contactar"
          },
          about: {
            title: "Sobre Mí",
            description_1: "Apasionado por la ingeniería de software, he desarrollado una sólida experiencia técnica a través de la creación de aplicaciones concretas (gestión de activos informáticos, reconocimiento facial, rastreador móvil).",
            description_2: "Dominando los entornos Python, Java y JavaScript, disfruto diseñando arquitecturas robustas y asumiendo desafíos técnicos complejos. Abierto al trabajo colaborativo, siempre busco innovar y mejorar mis habilidades.",
            education_title: "Educación"
          },
          skills: {
            title: "Mis Habilidades"
          }
        }
      }
    },
    lng: 'en', // default language
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false // react already safes from xss
    }
  });

export default i18n;
