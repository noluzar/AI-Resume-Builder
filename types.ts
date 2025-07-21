
export interface PersonalInfo {
  fullName: string;
  email: string;
  phone: string;
  linkedin: string;
  github: string;
  portfolio: string;
  address: string;
  professionalSummary: string;
}

export interface Experience {
  id: string;
  jobTitle: string;
  company: string;
  location: string;
  startDate: string;
  endDate: string;
  responsibilities: string[];
  isCurrent: boolean;
}

export interface Education {
  id: string;
  institution: string;
  degree: string;
  fieldOfStudy: string;
  graduationDate: string;
  gpa?: string;
}

export interface Skill {
  id:string;
  name: string;
  category: string; // e.g., Technical, Soft, Language
}

export interface CustomSection {
  id: string;
  title: string;
  content: string;
}

export interface ResumeData {
  personalInfo: PersonalInfo;
  experience: Experience[];
  education: Education[];
  skills: Skill[];
  customSections: CustomSection[];
  targetRole?: string;
  targetIndustry?: string;
}

export enum TemplateId {
  MODERN = 'modern',
  CLASSIC = 'classic',
  CREATIVE = 'creative',
}

export interface Template {
  id: TemplateId;
  name: string;
  previewImage?: string; // URL to a preview image
  component: React.FC<{ resumeData: ResumeData, accentColor: string }>;
}

export interface AIResponse {
  text?: string;
  keywords?: string[];
  analysis?: string;
  suggestions?: string[];
  error?: string;
}

// For Gemini API (simplified)
export interface GroundingChunk {
  web?: {
    uri?: string;
    title?: string;
  };
  retrievedContext?: {
    uri?: string;
    title?: string;
  };
}
    