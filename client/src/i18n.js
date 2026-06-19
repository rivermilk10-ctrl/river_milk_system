import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import enTranslation from './locales/en.json';
import mrTranslation from './locales/mr.json';

i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: enTranslation },
      mr: { translation: mrTranslation }
    },
    lng: 'mr', // default language is Marathi
    fallbackLng: 'en',
    interpolation: { escapeValue: false }
  });

export default i18n;
