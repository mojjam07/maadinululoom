import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'

export type Lang = 'ar' | 'en'

export const resources = {
  ar: {
    translation: {
      nav: {
        about: 'حولنا',
        subjects: 'المواد',
        pricing: 'الأسعار',
        teachers: 'المدرسون',
        contact: 'تواصل معنا',
        enrollNow: 'سجل الآن',
      },
      hero: {
        badge: 'علم الانسان مالـم يعلم',
        arTitlePrefix: 'تعلم',
        arTitleHighlight: 'العربية',
        arTitleSuffix: 'والعلوم الإسلامية\nمن أي مكان في العالم',
        enSubtitle: 'Learn Arabic & Islamic Studies Online — Anytime, Anywhere in the World',
        joinNow: 'انضم الآن',
        viewCourses: 'عرض الدورات',
        statsActiveStudents: 'طالب نشط',
        statsSubjects: 'مادة دراسية',
        statsGlobal: 'عالمي',
      },
      common: {
        contactUs: 'تواصل معنا',
        sendMessage: 'إرسال',
      },
      faq: {
        title: 'الأسئلة الشائعة',
      },
      footer: {
        quickLinks: 'روابط سريعة',
        contact: 'تواصل معنا',
      },
    },
  },
  en: {
    translation: {
      nav: {
        about: 'About',
        subjects: 'Subjects',
        pricing: 'Pricing',
        teachers: 'Teachers',
        contact: 'Contact',
        enrollNow: 'Enroll Now',
      },
      hero: {
        badge: 'Learn what you didn’t know',
        arTitlePrefix: 'Learn',
        arTitleHighlight: 'Arabic',
        arTitleSuffix: 'and Islamic Studies\nfrom anywhere in the world',
        enSubtitle: 'Learn Arabic & Islamic Studies Online — Anytime, Anywhere in the World',
        joinNow: 'Join Now',
        viewCourses: 'View Courses',
        statsActiveStudents: 'Active students',
        statsSubjects: 'Subjects',
        statsGlobal: 'Global',
      },
      common: {
        contactUs: 'Contact Us',
        sendMessage: 'Send Message',
      },
      faq: {
        title: 'Frequently Asked Questions',
      },
      footer: {
        quickLinks: 'Quick Links',
        contact: 'Contact',
      },
    },
  },
} as const

export function initI18n() {
  if (i18n.isInitialized) return i18n

  return i18n
    .use(initReactI18next)
    .init({
      resources,
      fallbackLng: 'ar',
      lng: 'ar',
      interpolation: { escapeValue: false },
      react: { useSuspense: false },
    })
}

export function getDir(lang: Lang): 'rtl' | 'ltr' {
  return lang === 'ar' ? 'rtl' : 'ltr'
}

