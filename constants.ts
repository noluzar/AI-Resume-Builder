
import { TemplateId, PersonalInfo, Experience, Education, Skill, CustomSection, ResumeData } from './types';

export const DEFAULT_ACCENT_COLOR = '#2563eb'; // Tailwind's blue-600

export const TEMPLATE_OPTIONS = [
  { id: TemplateId.MODERN, name: 'Modern', previewImage: 'https://picsum.photos/seed/modern/300/200' },
  { id: TemplateId.CLASSIC, name: 'Classic', previewImage: 'https://picsum.photos/seed/classic/300/200' },
  { id: TemplateId.CREATIVE, name: 'Creative', previewImage: 'https://picsum.photos/seed/creative/300/200' },
];

export const INITIAL_PERSONAL_INFO: PersonalInfo = {
  fullName: '',
  email: '',
  phone: '',
  linkedin: '',
  github: '',
  portfolio: '',
  address: '',
  professionalSummary: '',
};

export const INITIAL_EXPERIENCE: Omit<Experience, 'id'> = {
  jobTitle: '',
  company: '',
  location: '',
  startDate: '',
  endDate: '',
  responsibilities: [''],
  isCurrent: false,
};

export const INITIAL_EDUCATION: Omit<Education, 'id'> = {
  institution: '',
  degree: '',
  fieldOfStudy: '',
  graduationDate: '',
  gpa: '',
};

export const INITIAL_SKILL: Omit<Skill, 'id'> = {
  name: '',
  category: 'Technical',
};

export const INITIAL_CUSTOM_SECTION: Omit<CustomSection, 'id'> = {
  title: '',
  content: '',
};


export const INITIAL_RESUME_DATA: ResumeData = {
  personalInfo: { ...INITIAL_PERSONAL_INFO },
  experience: [],
  education: [],
  skills: [],
  customSections: [],
  targetRole: '',
  targetIndustry: '',
};
