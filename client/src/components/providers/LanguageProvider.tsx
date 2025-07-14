import React, { createContext, useContext, useEffect, useState } from 'react';

type Language = 'en' | 'es' | 'fr' | 'de' | 'ar' | 'he' | 'zh' | 'ja';
type Direction = 'ltr' | 'rtl';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  direction: Direction;
  t: (key: string, params?: Record<string, string>) => string;
}

// Basic translations for demonstration
const translations: Record<Language, Record<string, string>> = {
  en: {
    'dashboard': 'Dashboard',
    'properties': 'Properties',
    'residents': 'Residents',
    'support': 'Support',
    'incidents': 'Incidents',
    'reports': 'Reports',
    'settings': 'Settings',
    'logout': 'Logout',
    'loading': 'Loading...',
    'error': 'Error',
    'success': 'Success',
    'cancel': 'Cancel',
    'save': 'Save',
    'edit': 'Edit',
    'delete': 'Delete',
    'add': 'Add',
    'search': 'Search',
    'filter': 'Filter',
    'welcome': 'Welcome to YUTHUB',
    'comprehensive_platform': 'Comprehensive Youth Housing Management Platform',
  },
  es: {
    'dashboard': 'Panel de Control',
    'properties': 'Propiedades',
    'residents': 'Residentes',
    'support': 'Apoyo',
    'incidents': 'Incidentes',
    'reports': 'Reportes',
    'settings': 'Configuración',
    'logout': 'Cerrar Sesión',
    'loading': 'Cargando...',
    'error': 'Error',
    'success': 'Éxito',
    'cancel': 'Cancelar',
    'save': 'Guardar',
    'edit': 'Editar',
    'delete': 'Eliminar',
    'add': 'Agregar',
    'search': 'Buscar',
    'filter': 'Filtrar',
    'welcome': 'Bienvenido a YUTHUB',
    'comprehensive_platform': 'Plataforma Integral de Gestión de Vivienda Juvenil',
  },
  fr: {
    'dashboard': 'Tableau de Bord',
    'properties': 'Propriétés',
    'residents': 'Résidents',
    'support': 'Support',
    'incidents': 'Incidents',
    'reports': 'Rapports',
    'settings': 'Paramètres',
    'logout': 'Se Déconnecter',
    'loading': 'Chargement...',
    'error': 'Erreur',
    'success': 'Succès',
    'cancel': 'Annuler',
    'save': 'Sauvegarder',
    'edit': 'Modifier',
    'delete': 'Supprimer',
    'add': 'Ajouter',
    'search': 'Rechercher',
    'filter': 'Filtrer',
    'welcome': 'Bienvenue sur YUTHUB',
    'comprehensive_platform': 'Plateforme Complète de Gestion du Logement Jeunesse',
  },
  de: {
    'dashboard': 'Dashboard',
    'properties': 'Immobilien',
    'residents': 'Bewohner',
    'support': 'Unterstützung',
    'incidents': 'Vorfälle',
    'reports': 'Berichte',
    'settings': 'Einstellungen',
    'logout': 'Abmelden',
    'loading': 'Laden...',
    'error': 'Fehler',
    'success': 'Erfolg',
    'cancel': 'Abbrechen',
    'save': 'Speichern',
    'edit': 'Bearbeiten',
    'delete': 'Löschen',
    'add': 'Hinzufügen',
    'search': 'Suchen',
    'filter': 'Filtern',
    'welcome': 'Willkommen bei YUTHUB',
    'comprehensive_platform': 'Umfassende Plattform für Jugendwohnungsmanagement',
  },
  ar: {
    'dashboard': 'لوحة التحكم',
    'properties': 'الخصائص',
    'residents': 'المقيمين',
    'support': 'الدعم',
    'incidents': 'الحوادث',
    'reports': 'التقارير',
    'settings': 'الإعدادات',
    'logout': 'تسجيل الخروج',
    'loading': 'جاري التحميل...',
    'error': 'خطأ',
    'success': 'نجح',
    'cancel': 'إلغاء',
    'save': 'حفظ',
    'edit': 'تعديل',
    'delete': 'حذف',
    'add': 'إضافة',
    'search': 'بحث',
    'filter': 'تصفية',
    'welcome': 'مرحباً بك في YUTHUB',
    'comprehensive_platform': 'منصة شاملة لإدارة الإسكان الشبابي',
  },
  he: {
    'dashboard': 'לוח מחוונים',
    'properties': 'נכסים',
    'residents': 'תושבים',
    'support': 'תמיכה',
    'incidents': 'תקריות',
    'reports': 'דוחות',
    'settings': 'הגדרות',
    'logout': 'התנתק',
    'loading': 'טוען...',
    'error': 'שגיאה',
    'success': 'הצלחה',
    'cancel': 'ביטול',
    'save': 'שמור',
    'edit': 'עריכה',
    'delete': 'מחק',
    'add': 'הוסף',
    'search': 'חיפוש',
    'filter': 'סינון',
    'welcome': 'ברוכים הבאים ל-YUTHUB',
    'comprehensive_platform': 'פלטפורמה מקיפה לניהול דיור נוער',
  },
  zh: {
    'dashboard': '仪表板',
    'properties': '物业',
    'residents': '居民',
    'support': '支持',
    'incidents': '事件',
    'reports': '报告',
    'settings': '设置',
    'logout': '退出',
    'loading': '加载中...',
    'error': '错误',
    'success': '成功',
    'cancel': '取消',
    'save': '保存',
    'edit': '编辑',
    'delete': '删除',
    'add': '添加',
    'search': '搜索',
    'filter': '过滤',
    'welcome': '欢迎使用 YUTHUB',
    'comprehensive_platform': '综合青年住房管理平台',
  },
  ja: {
    'dashboard': 'ダッシュボード',
    'properties': 'プロパティ',
    'residents': '居住者',
    'support': 'サポート',
    'incidents': '事件',
    'reports': 'レポート',
    'settings': '設定',
    'logout': 'ログアウト',
    'loading': '読み込み中...',
    'error': 'エラー',
    'success': '成功',
    'cancel': 'キャンセル',
    'save': '保存',
    'edit': '編集',
    'delete': '削除',
    'add': '追加',
    'search': '検索',
    'filter': 'フィルター',
    'welcome': 'YUTHUBへようこそ',
    'comprehensive_platform': '包括的な青少年住宅管理プラットフォーム',
  },
};

const rtlLanguages: Language[] = ['ar', 'he'];

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>(() => {
    const stored = localStorage.getItem('yuthub-language');
    const browserLang = navigator.language.split('-')[0] as Language;
    return (stored as Language) || (translations[browserLang] ? browserLang : 'en');
  });

  const direction: Direction = rtlLanguages.includes(language) ? 'rtl' : 'ltr';

  const t = (key: string, params?: Record<string, string>): string => {
    let translation = translations[language][key] || translations.en[key] || key;
    
    // Simple parameter replacement
    if (params) {
      Object.entries(params).forEach(([param, value]) => {
        translation = translation.replace(`{${param}}`, value);
      });
    }
    
    return translation;
  };

  useEffect(() => {
    // Store language preference
    localStorage.setItem('yuthub-language', language);
    
    // Update document direction and lang
    document.documentElement.dir = direction;
    document.documentElement.lang = language;
    
    // Update meta tags for accessibility
    const metaLang = document.querySelector('meta[name="language"]');
    if (metaLang) {
      metaLang.setAttribute('content', language);
    } else {
      const meta = document.createElement('meta');
      meta.name = 'language';
      meta.content = language;
      document.head.appendChild(meta);
    }
  }, [language, direction]);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, direction, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }
  return context;
};