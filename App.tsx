
import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { ResumeData, TemplateId, PersonalInfo, Experience, Education, Skill, CustomSection, AIResponse, GroundingChunk } from './types';
import { INITIAL_RESUME_DATA, DEFAULT_ACCENT_COLOR, TEMPLATE_OPTIONS, INITIAL_PERSONAL_INFO, INITIAL_EXPERIENCE, INITIAL_EDUCATION, INITIAL_SKILL, INITIAL_CUSTOM_SECTION } from './constants';
import ResumeForm from './components/ResumeForm';
import ResumePreview from './components/ResumePreview';
import ControlsPanel from './components/ControlsPanel';
import { generatePdf, downloadHtml } from './services/exportService';
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import AIFeatureModals, { ModalType } from './components/AIFeatureModals';
import { v4 as uuidv4 } from 'uuid';


const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

type GenerateWithAISection = keyof ResumeData | 'experienceItem' | 'generic' | 'atsCheck' | 'jobMatch' | 'keywords' | 'smartSuggestions' | 'recentTrends' | 'autoTailor';


export const ResumeContext = React.createContext<{
  resumeData: ResumeData;
  setResumeData: React.Dispatch<React.SetStateAction<ResumeData>>;
  selectedTemplate: TemplateId;
  setSelectedTemplate: React.Dispatch<React.SetStateAction<TemplateId>>;
  accentColor: string;
  setAccentColor: React.Dispatch<React.SetStateAction<string>>;
  generateWithAI: (promptType: string, section: GenerateWithAISection, currentData?: any, index?: number) => Promise<void>;
  isLoadingAI: boolean;
  aiError: string | null;
  activeModal: ModalType | null;
  openModal: (modalType: ModalType) => void;
  closeModal: () => void;
  modalData: AIResponse | null;
  setModalData: React.Dispatch<React.SetStateAction<AIResponse | null>>;
  groundingChunks: GroundingChunk[] | null;
  desiredRoleForAutoTailor: string;
  setDesiredRoleForAutoTailor: React.Dispatch<React.SetStateAction<string>>;
  isDarkMode: boolean;
  toggleDarkMode: () => void;
}>({
  resumeData: INITIAL_RESUME_DATA,
  setResumeData: () => {},
  selectedTemplate: TemplateId.MODERN,
  setSelectedTemplate: () => {},
  accentColor: DEFAULT_ACCENT_COLOR,
  setAccentColor: () => {},
  generateWithAI: async () => {},
  isLoadingAI: false,
  aiError: null,
  activeModal: null,
  openModal: () => {},
  closeModal: () => {},
  modalData: null,
  setModalData: () => {},
  groundingChunks: null,
  desiredRoleForAutoTailor: '',
  setDesiredRoleForAutoTailor: () => {},
  isDarkMode: false,
  toggleDarkMode: () => {},
});

const App: React.FC = () => {
  const [resumeData, setResumeData] = useState<ResumeData>(INITIAL_RESUME_DATA);
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateId>(TemplateId.MODERN);
  const [accentColor, setAccentColor] = useState<string>(DEFAULT_ACCENT_COLOR);
  const [isLoadingAI, setIsLoadingAI] = useState<boolean>(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [activeModal, setActiveModal] = useState<ModalType | null>(null);
  const [modalData, setModalData] = useState<AIResponse | null>(null);
  const [jobDescriptionForMatching, setJobDescriptionForMatching] = useState<string>('');
  const [groundingChunks, setGroundingChunks] = useState<GroundingChunk[] | null>(null);
  const [desiredRoleForAutoTailor, setDesiredRoleForAutoTailor] = useState<string>('');
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const savedMode = localStorage.getItem('darkMode');
      return savedMode === 'true' || (savedMode === null && window.matchMedia('(prefers-color-scheme: dark)').matches);
    }
    return false;
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('darkMode', String(isDarkMode));
      if (isDarkMode) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
  }, [isDarkMode]);

  const toggleDarkMode = () => {
    setIsDarkMode(prev => !prev);
  };
  

  const handleExport = useCallback((format: 'pdf' | 'html') => {
    const previewElement = document.getElementById('resume-preview-content');
    if (!previewElement) {
      alert('Preview element not found.');
      return;
    }
    if (format === 'pdf') {
      generatePdf(previewElement, resumeData.personalInfo.fullName || 'resume');
    } else if (format === 'html') {
      downloadHtml(previewElement.outerHTML, resumeData.personalInfo.fullName || 'resume');
    }
  }, [resumeData.personalInfo.fullName]);

  const openModal = (modalType: ModalType) => setActiveModal(modalType);
  const closeModal = useCallback(() => {
    setActiveModal(null);
    setModalData(null);
    // Keep aiError to show it until next AI operation
  },[]);

  const generateWithAI = useCallback(async (promptType: string, sectionIdentifier: GenerateWithAISection, currentData?: any, index?: number) => {
    setIsLoadingAI(true);
    setAiError(null);
    setModalData(null);
    setGroundingChunks(null);

    let prompt = '';
    let isJsonOutput = false;
    let useSearchGrounding = false;

    switch (promptType) {
      case 'summary':
        prompt = `Generate a compelling professional summary for a ${resumeData.targetRole || 'professional'} with experience in ${resumeData.targetIndustry || 'their field'}. Current summary (if any): "${resumeData.personalInfo.professionalSummary}". Emphasize skills like [Skill1], [Skill2] if relevant. Output plain text. Max 3-4 sentences.`;
        break;
      case 'experience':
        const exp = currentData as Experience;
        prompt = `For a ${exp.jobTitle} role at ${exp.company}, generate 3-5 concise, action-oriented bullet points focusing on achievements and quantifiable results. Current responsibilities for context (if any): ${exp.responsibilities.join('; ')}. Output plain text, with each point on a new line, starting with an action verb.`;
        break;
      case 'keywords':
        isJsonOutput = true;
        prompt = `Provide a list of 10-15 relevant keywords (technical and soft skills) and 5-7 impactful action verbs for a resume targeting a '${resumeData.targetRole || 'general professional'}' role in the '${resumeData.targetIndustry || 'general industry'}'. Return as a JSON object with keys "keywords" (array of strings) and "actionVerbs" (array of strings).`;
        break;
      case 'ats':
        const fullResumeTextForATS = JSON.stringify(resumeData); 
        prompt = `Analyze the following resume content (JSON format) for ATS compatibility for the role of ${resumeData.targetRole || 'the target role'}. Provide a list of actionable suggestions to improve its parsability and keyword relevance. Consider: standard fonts, layout complexity, keyword density, section clarity, and structure. Output plain text. Resume Content: ${fullResumeTextForATS}`;
        break;
      case 'jobMatch':
        if (!jobDescriptionForMatching) {
          setAiError("Please provide a job description for matching.");
          setIsLoadingAI(false);
          return;
        }
        const fullResumeTextForJobMatch = JSON.stringify(resumeData);
        prompt = `Analyze this resume (JSON format) against the provided job description. Identify key skills/experiences from the job description present in the resume, and those missing or underrepresented. Provide a summary of the match percentage (0-100%) and actionable suggestions for tailoring. Output plain text. Resume: ${fullResumeTextForJobMatch}\n\nJob Description: ${jobDescriptionForMatching}`;
        break;
      case 'smartSuggestions':
        const forSection = currentData?.sectionName || 'a relevant section';
        prompt = `Provide 3-5 smart content suggestions for the '${forSection}' of a resume for a '${resumeData.targetRole || 'professional'}' in the '${resumeData.targetIndustry || 'their field'}'. ${currentData?.existingContent ? `Current content for context: "${currentData.existingContent}"` : ''} Return as a JSON object with a "suggestions" key (array of strings).`;
        isJsonOutput = true;
        break;
      case 'recentTrends': 
         useSearchGrounding = true;
         prompt = `What are the current hiring trends, most in-demand skills, and salary expectations (if available and appropriate) for a ${resumeData.targetRole || 'professional'} in the ${resumeData.targetIndustry || 'general technology'} industry as of today? Output plain text.`;
         break;
      case 'autoTailor':
        if (!desiredRoleForAutoTailor) {
          setAiError("Please specify the desired role for auto-tailoring.");
          setIsLoadingAI(false);
          return;
        }
        isJsonOutput = true;
        prompt = `
          Analyze the following resume data:
          ${JSON.stringify(resumeData)}

          Tailor this entire resume to best fit the desired role of: "${desiredRoleForAutoTailor}".
          Your goal is to make the candidate as strong as possible for this specific role. This includes:
          1. Rewrite 'professionalSummary' to be highly targeted and impactful (3-4 sentences).
          2. Rephrase 'experience' responsibilities (bullet points) to highlight achievements and skills relevant to "${desiredRoleForAutoTailor}". Ensure responsibilities remain an array of concise, action-oriented strings.
          3. Prioritize, add, or suggest removal of 'skills' to match "${desiredRoleForAutoTailor}". Skills should maintain their structure ({id, name, category}).
          4. Adjust 'education' or 'customSections' content if there's a clear opportunity to improve relevance for "${desiredRoleForAutoTailor}".
          5. Preserve existing IDs for items that are modified. For new items (e.g., a new skill), generate a new unique string ID (e.g., using a UUID like format). If an item is removed, it should not be in the output.
          6. The 'targetRole' field in the output should be "${desiredRoleForAutoTailor}".
          7. The 'targetIndustry' can be updated if the AI can infer a more specific industry based on the role, otherwise keep the existing one.

          Return the FULL updated resume data as a single, valid JSON object strictly matching the ResumeData structure shown below.
          The output MUST be ONLY the JSON object, without any surrounding text, comments, or markdown.
          ResumeData Structure:
          {
            "personalInfo": { "fullName": "string", "email": "string", "phone": "string", "linkedin": "string", "github": "string", "portfolio": "string", "address": "string", "professionalSummary": "string" },
            "experience": [ { "id": "string", "jobTitle": "string", "company": "string", "location": "string", "startDate": "string", "endDate": "string", "responsibilities": ["string", "string"], "isCurrent": boolean } ],
            "education": [ { "id": "string", "institution": "string", "degree": "string", "fieldOfStudy": "string", "graduationDate": "string", "gpa": "string" } ],
            "skills": [ { "id": "string", "name": "string", "category": "string" } ],
            "customSections": [ { "id": "string", "title": "string", "content": "string" } ],
            "targetRole": "string",
            "targetIndustry": "string"
          }
        `;
        break;
      default:
        setAiError('Unknown AI prompt type.');
        setIsLoadingAI(false);
        return;
    }

    try {
      const modelConfig: any = {
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {}
      };

      if(isJsonOutput && !useSearchGrounding) {
        modelConfig.config.responseMimeType = "application/json";
      }
      if(useSearchGrounding) {
        modelConfig.config.tools = [{googleSearch: {}}];
      }


      const response: GenerateContentResponse = await ai.models.generateContent(modelConfig);
      
      let textResponse = response.text;
      let parsedData: any = null;

      if (isJsonOutput && textResponse) {
        let jsonStr = textResponse.trim();
        const fenceRegex = /^```(\w*)?\s*\n?(.*?)\n?\s*```$/s;
        const match = jsonStr.match(fenceRegex);
        if (match && match[2]) {
          jsonStr = match[2].trim();
        }
        try {
          parsedData = JSON.parse(jsonStr);
        } catch (e) {
          console.error("Failed to parse JSON response:", e, "\nRaw response:", textResponse);
          setAiError(`Failed to parse AI's JSON response. Raw: ${textResponse.substring(0,100)}...`);
          parsedData = { text: `JSON Parse Error. Raw: ${textResponse}` }; 
        }
      } else if (textResponse) {
         parsedData = { text: textResponse };
      }

      if (useSearchGrounding && response.candidates?.[0]?.groundingMetadata?.groundingChunks) {
        setGroundingChunks(response.candidates[0].groundingMetadata.groundingChunks as GroundingChunk[]);
      }

      if (promptType === 'summary') {
        setResumeData(prev => ({ ...prev, personalInfo: { ...prev.personalInfo, professionalSummary: parsedData?.text || prev.personalInfo.professionalSummary } }));
      } else if (promptType === 'experience' && typeof index === 'number' && parsedData?.text) {
        const newResponsibilities = parsedData.text.split('\n').map((r: string) => r.replace(/^- /, '').trim()).filter((r: string) => r);
        setResumeData(prev => {
          const updatedExperience = [...prev.experience];
          if (updatedExperience[index]) {
            updatedExperience[index] = { ...updatedExperience[index], responsibilities: newResponsibilities.length > 0 ? newResponsibilities : updatedExperience[index].responsibilities };
          }
          return { ...prev, experience: updatedExperience };
        });
      } else if (promptType === 'keywords' && parsedData?.keywords) {
        setModalData({ keywords: parsedData.keywords || [], suggestions: parsedData.actionVerbs || [], text: `Keywords: ${(parsedData.keywords || []).join(', ')}\nAction Verbs: ${(parsedData.actionVerbs || []).join(', ')}` });
        openModal(ModalType.Keywords);
      } else if (promptType === 'ats' && parsedData?.text) {
        setModalData({ analysis: parsedData.text });
        openModal(ModalType.ATS);
      } else if (promptType === 'jobMatch' && parsedData?.text) {
        setModalData({ analysis: parsedData.text });
        openModal(ModalType.JobMatch);
      } else if (promptType === 'smartSuggestions' && parsedData?.suggestions) {
         setModalData({ suggestions: parsedData.suggestions || [], text: (parsedData.suggestions || []).join('\n') });
         openModal(ModalType.SmartSuggestions);
      } else if (promptType === 'recentTrends' && parsedData?.text) {
        setModalData({ text: parsedData.text });
        openModal(ModalType.Generic); 
      } else if (promptType === 'autoTailor' && parsedData) {
        if (parsedData.personalInfo && Array.isArray(parsedData.experience) && Array.isArray(parsedData.education) && Array.isArray(parsedData.skills) && Array.isArray(parsedData.customSections)) {
          const sanitizeIds = (items: any[], initialItems: any[] = []) => {
            const existingIds = new Set(initialItems.map(i => i.id));
            return items.map(item => {
              let id = item.id && typeof item.id === 'string' ? item.id : uuidv4();
              while (existingIds.has(id) && !initialItems.find(i => i.id === id)) { 
                id = uuidv4();
              }
              existingIds.add(id);
              return { ...item, id };
            });
          };
          
          const validatedData: ResumeData = {
            personalInfo: { ...INITIAL_PERSONAL_INFO, ...parsedData.personalInfo },
            experience: sanitizeIds(parsedData.experience || [], resumeData.experience).map(exp => ({...INITIAL_EXPERIENCE, ...exp, responsibilities: Array.isArray(exp.responsibilities) ? exp.responsibilities : [] })),
            education: sanitizeIds(parsedData.education || [], resumeData.education).map(edu => ({...INITIAL_EDUCATION, ...edu})),
            skills: sanitizeIds(parsedData.skills || [], resumeData.skills).map(skill => ({...INITIAL_SKILL, ...skill})),
            customSections: sanitizeIds(parsedData.customSections || [], resumeData.customSections).map(section => ({...INITIAL_CUSTOM_SECTION, ...section})),
            targetRole: parsedData.targetRole || desiredRoleForAutoTailor,
            targetIndustry: parsedData.targetIndustry || resumeData.targetIndustry,
          };
          setResumeData(validatedData);
          setModalData({ text: `Resume successfully auto-tailored for the role: ${desiredRoleForAutoTailor}. Please review the changes.` });
          openModal(ModalType.Generic);
        } else {
          console.error("AI response for autoTailor is not in the expected ResumeData format:", parsedData);
          const errorText = parsedData.text || "AI response for auto-tailoring was not in the expected format.";
          setAiError(errorText + " No changes applied.");
          setModalData({ error: errorText + " Please try again." });
          openModal(ModalType.Generic);
        }
      } else if (!parsedData || (!parsedData.text && !parsedData.keywords && !parsedData.suggestions && !parsedData.analysis && !parsedData.personalInfo) ) {
        const responseSummary = parsedData && Object.keys(parsedData).length > 0 ? `Received: ${JSON.stringify(parsedData).substring(0,100)}...` : "Received empty or unprocessable response from AI.";
        setAiError(responseSummary);
        setModalData({ text: responseSummary });
        openModal(ModalType.Generic);
      }

    } catch (error: any) {
      console.error("Error calling Gemini API:", error);
      const errorMessage = error.message || "An unknown error occurred with the AI service.";
      setAiError(errorMessage);
      if (error.message && error.message.includes("API key not valid")) {
         setAiError("API Key Invalid. Please ensure your API_KEY environment variable is correctly set.");
      }
      setModalData({ error: errorMessage });
      openModal(ModalType.Generic);
    } finally {
      setIsLoadingAI(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resumeData, jobDescriptionForMatching, desiredRoleForAutoTailor, openModal, closeModal]); 

  const contextValue = useMemo(() => ({
    resumeData, setResumeData,
    selectedTemplate, setSelectedTemplate,
    accentColor, setAccentColor,
    generateWithAI, isLoadingAI, aiError,
    activeModal, openModal, closeModal, modalData, setModalData, groundingChunks,
    desiredRoleForAutoTailor, setDesiredRoleForAutoTailor,
    isDarkMode, toggleDarkMode
  }), [resumeData, selectedTemplate, accentColor, generateWithAI, isLoadingAI, aiError, activeModal, modalData, groundingChunks, closeModal, openModal, desiredRoleForAutoTailor, setDesiredRoleForAutoTailor, isDarkMode, toggleDarkMode]);


  useEffect(() => {
    document.documentElement.style.setProperty('--color-primary', accentColor);
    
    const hexToRgb = (hex: string) => {
      const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
      return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
      } : null;
    };

    const rgbColor = hexToRgb(accentColor);
    if (rgbColor) {
      document.documentElement.style.setProperty('--color-primary-alpha', `rgba(${rgbColor.r}, ${rgbColor.g}, ${rgbColor.b}, 0.3)`);
      document.documentElement.style.setProperty('--color-primary-alpha-dark', `rgba(${rgbColor.r}, ${rgbColor.g}, ${rgbColor.b}, 0.4)`); // For dark mode focus

      // Slightly lighter/brighter primary for dark mode text/elements if needed
      // This is a simple example; could be more sophisticated.
      const lightenFactor = 1.2; // Increase brightness by 20%
      const rDark = Math.min(255, Math.round(rgbColor.r * lightenFactor));
      const gDark = Math.min(255, Math.round(rgbColor.g * lightenFactor));
      const bDark = Math.min(255, Math.round(rgbColor.b * lightenFactor));
      document.documentElement.style.setProperty('--color-primary-dark', `rgb(${rDark}, ${gDark}, ${bDark})`);


      const darkenFactor = 0.8; 
      const secondaryColor = `rgb(${Math.round(rgbColor.r * darkenFactor)}, ${Math.round(rgbColor.g * darkenFactor)}, ${Math.round(rgbColor.b * darkenFactor)})`;
      document.documentElement.style.setProperty('--color-secondary', secondaryColor);
      
      const secondaryDarkR = Math.min(255, Math.round(rgbColor.r * darkenFactor * lightenFactor));
      const secondaryDarkG = Math.min(255, Math.round(rgbColor.g * darkenFactor * lightenFactor));
      const secondaryDarkB = Math.min(255, Math.round(rgbColor.b * darkenFactor * lightenFactor));
      document.documentElement.style.setProperty('--color-secondary-dark', `rgb(${secondaryDarkR}, ${secondaryDarkG}, ${secondaryDarkB})`);

    } else { // Fallback if accentColor is not a valid hex (e.g. named color)
        document.documentElement.style.setProperty('--color-primary-dark', 'var(--color-primary)');
        document.documentElement.style.setProperty('--color-secondary-dark', 'var(--color-secondary)');
    }

  }, [accentColor, isDarkMode]);


  return (
    <ResumeContext.Provider value={contextValue}>
      <div className="min-h-screen bg-slate-100 dark:bg-slate-900 text-neutral-dark dark:text-dark-text flex flex-col items-center p-4 md:p-6 lg:p-8 font-sans transition-colors duration-300">
        <style>
          {`
            :root {
              --color-primary: ${accentColor};
              /* Alpha and dark variants are set in useEffect */
            }
            .text-primary { color: var(--color-primary); }
            .dark .text-primary { color: var(--color-primary-dark); }
            .bg-primary { background-color: var(--color-primary); }
            .dark .bg-primary { background-color: var(--color-primary-dark); }
            .border-primary { border-color: var(--color-primary); }
            .dark .border-primary { border-color: var(--color-primary-dark); }
            
            .ring-primary { ring-color: var(--color-primary); }
            .dark .ring-primary { ring-color: var(--color-primary-dark); }

            .hover\\:bg-secondary:hover { background-color: var(--color-secondary); } 
            .dark .hover\\:bg-secondary:hover { background-color: var(--color-secondary-dark); }
            .hover\\:text-secondary:hover { color: var(--color-secondary); }
            .dark .hover\\:text-secondary:hover { color: var(--color-secondary-dark); }
            
            .focus\\:ring-primary:focus { --tw-ring-color: var(--color-primary); }
            .dark .focus\\:ring-primary:focus { --tw-ring-color: var(--color-primary-dark); }
            .focus\\:border-primary:focus { border-color: var(--color-primary); }
            .dark .focus\\:border-primary:focus { border-color: var(--color-primary-dark); }
          `}
        </style>
        <header className="w-full max-w-7xl mb-6 md:mb-10 text-center animate-fade-in">
          <h1 className="text-4xl sm:text-5xl font-extrabold">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-purple-500 to-secondary dark:from-primary-dark dark:via-purple-400 dark:to-secondary-dark">{`AI Resume Architect`}</span>
          </h1>
          <p className="text-neutral-DEFAULT dark:text-slate-400 mt-3 text-lg">Craft your perfect, AI-powered resume with ease.</p>
        </header>
        
        <div className="w-full max-w-7xl grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8 animate-slide-up">
          <aside className="lg:col-span-4 space-y-6">
            <ControlsPanel onExport={handleExport} setJobDescriptionForMatching={setJobDescriptionForMatching} />
            <ResumeForm />
          </aside>
          <main className="lg:col-span-8">
            <ResumePreview />
          </main>
        </div>
        <AIFeatureModals />
         {isLoadingAI && (
          <div className="fixed inset-0 bg-slate-900 dark:bg-opacity-75 bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-[100]">
            <div className="bg-white dark:bg-dark-card p-6 rounded-xl shadow-2xl flex items-center space-x-4">
              <svg className="animate-spin h-10 w-10 text-primary dark:text-primary-dark" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span className="text-xl font-semibold text-neutral-dark dark:text-dark-text">AI is crafting...</span>
            </div>
          </div>
        )}
        {aiError && (
          <div className="fixed bottom-5 right-5 bg-red-100 dark:bg-red-900 border-l-4 border-red-500 dark:border-red-400 text-red-700 dark:text-red-200 p-4 rounded-md shadow-lg z-[101] animate-fade-in" role="alert">
            <div className="flex">
              <div className="py-1"><svg className="fill-current h-6 w-6 text-red-500 dark:text-red-400 mr-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M2.93 17.07A10 10 0 1 1 17.07 2.93 10 10 0 0 1 2.93 17.07zM11 5v6h-2V5h2zm0 8v2h-2v-2h2z"/></svg></div>
              <div>
                <p className="font-bold">AI Error</p>
                <p className="text-sm">{aiError}</p>
              </div>
               <button onClick={() => setAiError(null)} className="ml-auto -mx-1.5 -my-1.5 bg-red-100 dark:bg-red-900 text-red-500 dark:text-red-300 rounded-lg focus:ring-2 focus:ring-red-400 p-1.5 hover:bg-red-200 dark:hover:bg-red-800 inline-flex h-8 w-8" aria-label="Dismiss">
                <span className="sr-only">Dismiss</span>
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"></path></svg>
              </button>
            </div>
          </div>
        )}
      </div>
    </ResumeContext.Provider>
  );
};

export default App;
