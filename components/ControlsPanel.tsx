
import React, { useContext, useState } from 'react';
import { ResumeContext } from '../App';
import { TEMPLATE_OPTIONS, DEFAULT_ACCENT_COLOR } from '../constants';
import { TemplateId, AIResponse } from '../types';
import { Cog8ToothIcon, DocumentArrowDownIcon, CheckCircleIcon, SparklesIcon, MagnifyingGlassIcon, QuestionMarkCircleIcon, LightBulbIcon, SunIcon, MoonIcon, UserGroupIcon } from '@heroicons/react/24/outline';
import { ModalType } from './AIFeatureModals';


const AccentColorPicker: React.FC = () => {
  const { accentColor, setAccentColor, isDarkMode } = useContext(ResumeContext);
  const colors = [DEFAULT_ACCENT_COLOR, '#ef4444', '#f97316', '#10b981', '#6366f1', '#ec4899'];

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Accent Color</label>
      <div className="flex space-x-2">
        {colors.map(color => (
          <button
            key={color}
            type="button"
            onClick={() => setAccentColor(color)}
            className={`w-6 h-6 rounded-full border-2 ${accentColor === color ? `ring-2 ring-offset-2 ${isDarkMode ? 'ring-slate-400' : 'ring-gray-500'}` : `${isDarkMode ? 'border-slate-500' : 'border-gray-300'}`}`}
            style={{ backgroundColor: color }}
            title={`Set accent color to ${color}`}
          />
        ))}
      </div>
    </div>
  );
};

const DarkModeToggle: React.FC = () => {
    const { isDarkMode, toggleDarkMode } = useContext(ResumeContext);
    return (
        <button
            onClick={toggleDarkMode}
            className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-slate-700 text-gray-600 dark:text-gray-300 transition-colors"
            title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
            aria-label="Toggle dark mode"
        >
            {isDarkMode ? <SunIcon className="h-6 w-6" /> : <MoonIcon className="h-6 w-6" />}
        </button>
    );
};


interface ControlsPanelProps {
  onExport: (format: 'pdf' | 'html') => void;
  setJobDescriptionForMatching: React.Dispatch<React.SetStateAction<string>>;
}

const ControlsPanel: React.FC<ControlsPanelProps> = ({ onExport, setJobDescriptionForMatching }) => {
  const { 
    selectedTemplate, 
    setSelectedTemplate, 
    generateWithAI, 
    resumeData, 
    isLoadingAI,
    desiredRoleForAutoTailor, 
    setDesiredRoleForAutoTailor
  } = useContext(ResumeContext);
  const [jobDescText, setJobDescText] = useState('');

  const handleJobDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setJobDescText(e.target.value);
    setJobDescriptionForMatching(e.target.value); 
  };
  
  const handleDesiredRoleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDesiredRoleForAutoTailor(e.target.value);
  };

  const aiFeatures = [
    { name: 'Keyword Suggestions', icon: MagnifyingGlassIcon, action: () => generateWithAI('keywords', 'keywords'), modal: ModalType.Keywords },
    { name: 'ATS Compatibility Check', icon: CheckCircleIcon, action: () => generateWithAI('ats', 'atsCheck'), modal: ModalType.ATS },
    { name: 'Smart Content Suggestions', icon: LightBulbIcon, action: () => generateWithAI('smartSuggestions', 'generic', {sectionName: 'General', existingContent: resumeData.personalInfo.professionalSummary}), modal: ModalType.SmartSuggestions },
    { name: 'Recent Industry Trends', icon: QuestionMarkCircleIcon, action: () => generateWithAI('recentTrends', 'generic'), modal: ModalType.Generic }
  ];

  const jobMatchFeature = { name: 'Job Description Match', icon: UserGroupIcon, action: () => generateWithAI('jobMatch', 'jobMatch'), modal: ModalType.JobMatch, needsJobDesc: true };


  return (
    <div className="p-6 bg-white dark:bg-dark-card shadow-lg rounded-lg space-y-6">
      {/* Settings Header */}
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-slate-200 flex items-center">
          <Cog8ToothIcon className="h-5 w-5 mr-2 text-primary dark:text-primary-dark" /> Settings
        </h3>
        <DarkModeToggle />
      </div>

      {/* Template Selector & Style */}
      <div>
        <h4 className="text-md font-semibold text-gray-700 dark:text-slate-300 mb-2">Templates & Style</h4>
        <div className="grid grid-cols-3 gap-2 mb-4">
          {TEMPLATE_OPTIONS.map(opt => (
            <button
              key={opt.id}
              onClick={() => setSelectedTemplate(opt.id)}
              className={`p-2 border rounded-md text-center hover:shadow-md dark:hover:shadow-slate-600 transition-all ${selectedTemplate === opt.id ? 'border-primary dark:border-primary-dark ring-2 ring-primary dark:ring-primary-dark' : 'border-gray-300 dark:border-slate-600'}`}
              title={`Select ${opt.name} template`}
            >
              {opt.previewImage && <img src={opt.previewImage} alt={`${opt.name} preview`} className="w-full h-16 object-cover rounded mb-1 opacity-90 dark:opacity-80" />}
              <span className="text-xs font-medium text-gray-700 dark:text-slate-300">{opt.name}</span>
            </button>
          ))}
        </div>
        <AccentColorPicker />
      </div>
      
      {/* Auto-Generate Full Resume */}
      <div className="border-t dark:border-slate-700 pt-4">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-slate-200 mb-3 flex items-center">
            <SparklesIcon className="h-5 w-5 mr-2 text-primary dark:text-primary-dark" /> Auto-Generate Resume
        </h3>
        <div>
            <label htmlFor="desiredRoleForAutoTailor" className="block text-sm font-medium text-gray-700 dark:text-slate-300">Desired Role</label>
            <input
                type="text"
                id="desiredRoleForAutoTailor"
                name="desiredRoleForAutoTailor"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-primary dark:focus:ring-primary-dark focus:border-primary dark:focus:border-primary-dark sm:text-sm bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100 placeholder-gray-400 dark:placeholder-slate-500"
                value={desiredRoleForAutoTailor}
                onChange={handleDesiredRoleChange}
                placeholder="e.g., Senior Software Engineer"
            />
            <button
                onClick={() => generateWithAI('autoTailor', 'autoTailor')}
                disabled={isLoadingAI || !desiredRoleForAutoTailor}
                className="mt-2 w-full flex items-center justify-center px-4 py-2.5 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary dark:bg-primary-dark hover:bg-secondary dark:hover:bg-secondary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary dark:focus:ring-primary-dark disabled:bg-gray-400 dark:disabled:bg-slate-600 disabled:cursor-not-allowed"
            >
                <SparklesIcon className="h-5 w-5 mr-2" /> Generate Tailored Resume
            </button>
        </div>
      </div>


      {/* AI Assistants (Specific Features) */}
      <div className="border-t dark:border-slate-700 pt-4">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-slate-200 mb-3 flex items-center">
            <LightBulbIcon className="h-5 w-5 mr-2 text-primary dark:text-primary-dark" /> AI Assistants
        </h3>
        <div className="space-y-3">
             {aiFeatures.map(feature => (
                 <button
                    key={feature.name}
                    onClick={feature.action}
                    disabled={isLoadingAI}
                    className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-slate-200 bg-white dark:bg-slate-700 hover:bg-gray-50 dark:hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary dark:focus:ring-primary-dark disabled:bg-gray-300 dark:disabled:bg-slate-500 disabled:cursor-not-allowed"
                >
                    <feature.icon className="h-5 w-5 mr-2" /> {feature.name}
                </button>
             ))}
             <div className="border-t dark:border-slate-700 pt-3">
                 <label htmlFor="jobDescription" className="block text-sm font-medium text-gray-700 dark:text-slate-300">Job Description for Matching</label>
                 <textarea
                    id="jobDescription"
                    rows={4}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-primary dark:focus:ring-primary-dark focus:border-primary dark:focus:border-primary-dark sm:text-sm bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100 placeholder-gray-400 dark:placeholder-slate-500"
                    value={jobDescText}
                    onChange={handleJobDescriptionChange}
                    placeholder="Paste job description here..."
                />
                 <button
                    key={jobMatchFeature.name}
                    onClick={jobMatchFeature.action}
                    disabled={isLoadingAI || !jobDescText}
                    className="mt-2 w-full flex items-center justify-center px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-slate-200 bg-white dark:bg-slate-700 hover:bg-gray-50 dark:hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary dark:focus:ring-primary-dark disabled:bg-gray-300 dark:disabled:bg-slate-500 disabled:cursor-not-allowed"
                >
                    <jobMatchFeature.icon className="h-5 w-5 mr-2" /> {jobMatchFeature.name}
                </button>
             </div>
        </div>
      </div>

      {/* Export Options */}
      <div className="border-t dark:border-slate-700 pt-4">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-slate-200 mb-2 flex items-center">
          <DocumentArrowDownIcon className="h-5 w-5 mr-2 text-primary dark:text-primary-dark" /> Export
        </h3>
        <div className="flex space-x-3">
          <button
            onClick={() => onExport('pdf')}
            className="flex-1 btn btn-primary bg-green-600 hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600 focus:ring-green-500 dark:focus:ring-green-400"
          >
            Export PDF
          </button>
          <button
            onClick={() => onExport('html')}
            className="flex-1 btn btn-secondary"
          >
            Export HTML
          </button>
           <button
            onClick={() => alert("DOCX export coming soon! For now, try copying from the HTML output or print to PDF.")}
            className="flex-1 btn btn-secondary"
            title="DOCX export is a planned feature."
          >
            Export DOCX (Soon)
          </button>
        </div>
      </div>
    </div>
  );
};

export default ControlsPanel;