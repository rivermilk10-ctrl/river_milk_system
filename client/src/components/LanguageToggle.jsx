import React from 'react';
import { useTranslation } from 'react-i18next';

function LanguageToggle() {
  const { i18n } = useTranslation();

  const toggleLanguage = () => {
    const newLang = i18n.language === 'en' ? 'mr' : 'en';
    i18n.changeLanguage(newLang);
  };

  return (
    <button 
      onClick={toggleLanguage} 
      style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--border)', background: 'white', fontWeight: 'bold', cursor: 'pointer', color: 'var(--text-color)' }}
    >
      {i18n.language === 'en' ? 'MR / मर॰' : 'EN / Eng'}
    </button>
  );
}

export default LanguageToggle;
