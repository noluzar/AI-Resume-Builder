
import React, { useContext } from 'react';
import { ResumeContext } from '../App';
import { PersonalInfo, Experience, Education, Skill, CustomSection, ResumeData } from '../types'; // Added ResumeData
import { INITIAL_EXPERIENCE, INITIAL_EDUCATION, INITIAL_SKILL, INITIAL_CUSTOM_SECTION } from '../constants'; // Fixed import path
import { PlusCircleIcon, TrashIcon, SparklesIcon } from '@heroicons/react/24/outline'; // Example icons

// Helper: Input component
const InputField: React.FC<React.InputHTMLAttributes<HTMLInputElement> & { label: string; name: string; section?: string; index?: number; fieldKey?: string; isTextArea?: false }> = ({ label, name, section, index, fieldKey, ...props }) => {
  const { resumeData, setResumeData } = useContext(ResumeContext);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setResumeData(prev => {
      const newData = { ...prev };
      if (section && typeof index === 'number' && fieldKey) { // Array item (Experience, Education, etc.)
        (newData[section as keyof typeof newData] as any[])[index][fieldKey] = type === 'checkbox' ? checked : value;
      } else if (section) { // Object item (PersonalInfo)
         (newData[section as keyof typeof newData] as any)[name] = type === 'checkbox' ? checked : value;
      } else { // Top-level resumeData field (targetRole, targetIndustry)
        (newData as any)[name] = value;
      }
      return newData;
    });
  };
  
  let currentValue: any = '';
  if (section && typeof index === 'number' && fieldKey) {
    currentValue = (resumeData[section as keyof ResumeData] as any[])[index]?.[fieldKey];
  } else if (section) {
    currentValue = (resumeData[section as keyof ResumeData] as any)?.[name];
  } else {
    currentValue = (resumeData as any)[name];
  }


  return (
    <div>
      <label htmlFor={name} className="block text-sm font-medium text-gray-700 dark:text-slate-300">{label}</label>
      <input
        id={name}
        name={name}
        value={currentValue || ''}
        onChange={handleChange}
        className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-primary dark:focus:ring-primary-dark focus:border-primary dark:focus:border-primary-dark sm:text-sm bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100 placeholder-gray-400 dark:placeholder-slate-500"
        {...props}
      />
    </div>
  );
};

// Helper: Textarea component
const TextareaField: React.FC<React.TextareaHTMLAttributes<HTMLTextAreaElement> & { label: string; name: string; section?: string; index?: number; fieldKey?: string; aiAction?: () => void; containerClassName?: string; }> = ({ label, name, section, index, fieldKey, aiAction, containerClassName, ...props }) => {
  const { resumeData, setResumeData } = useContext(ResumeContext);
  
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const { name, value } = e.target;
     setResumeData(prev => {
      const newData = { ...prev };
      if (section && typeof index === 'number' && fieldKey) {
        (newData[section as keyof typeof newData] as any[])[index][fieldKey] = value;
      } else if (section) {
         (newData[section as keyof typeof newData] as any)[name] = value;
      } else {
        (newData as any)[name] = value;
      }
      return newData;
    });
  };

  let currentValue: any = '';
  if (section && typeof index === 'number' && fieldKey) {
    currentValue = (resumeData[section as keyof ResumeData] as any[])[index]?.[fieldKey];
  } else if (section) {
    currentValue = (resumeData[section as keyof ResumeData] as any)?.[name];
  } else {
    currentValue = (resumeData as any)[name];
  }
  
  return (
    <div className={containerClassName}>
      <label htmlFor={name} className="block text-sm font-medium text-gray-700 dark:text-slate-300">{label}</label>
      <div className="relative">
        <textarea
          id={name}
          name={name}
          value={currentValue || ''}
          onChange={handleChange}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-primary dark:focus:ring-primary-dark focus:border-primary dark:focus:border-primary-dark sm:text-sm bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100 placeholder-gray-400 dark:placeholder-slate-500"
          rows={props.rows || 3}
          {...props}
        />
        {aiAction && (
          <button
            type="button"
            onClick={aiAction}
            className="absolute top-2 right-2 p-1 bg-primary dark:bg-primary-dark text-white rounded-full hover:bg-secondary dark:hover:bg-secondary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary dark:focus:ring-primary-dark"
            title="Generate with AI"
          >
            <SparklesIcon className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  );
};


// Main ResumeForm Component
const ResumeForm: React.FC = () => {
  const { resumeData, setResumeData, generateWithAI } = useContext(ResumeContext);

  const handlePersonalInfoChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setResumeData(prev => ({
      ...prev,
      personalInfo: { ...prev.personalInfo, [name]: value }
    }));
  };
  
  const handleGenericChange = (e: React.ChangeEvent<HTMLInputElement>) => {
     const { name, value } = e.target;
     setResumeData(prev => ({
      ...prev,
      [name]: value
    }));
  }

  const addItem = <T extends Experience | Education | Skill | CustomSection, >(section: keyof ResumeData, initialItem: Omit<T, 'id'>) => {
    setResumeData(prev => ({
      ...prev,
      [section]: [...(prev[section] as T[]), { ...initialItem, id: Date.now().toString() }] // Consider uuid for better ID uniqueness
    }));
  };

  const removeItem = (section: keyof ResumeData, id: string) => {
    setResumeData(prev => ({
      ...prev,
      [section]: (prev[section] as any[]).filter(item => item.id !== id)
    }));
  };

  const handleListItemChange = <T,>(section: keyof ResumeData, index: number, field: keyof T, value: string | string[] | boolean) => {
    setResumeData(prev => {
      const list = [...(prev[section] as T[])] as any[];
      list[index] = { ...list[index], [field]: value };
      return { ...prev, [section]: list };
    });
  };
  
  const handleResponsibilityChange = (expIndex: number, respIndex: number, value: string) => {
     setResumeData(prev => {
      const newExperience = [...prev.experience];
      const newResponsibilities = [...newExperience[expIndex].responsibilities];
      newResponsibilities[respIndex] = value;
      newExperience[expIndex] = { ...newExperience[expIndex], responsibilities: newResponsibilities };
      return { ...prev, experience: newExperience };
    });
  };

  const addResponsibility = (expIndex: number) => {
    setResumeData(prev => {
      const newExperience = [...prev.experience];
      newExperience[expIndex] = { ...newExperience[expIndex], responsibilities: [...newExperience[expIndex].responsibilities, ''] };
      return { ...prev, experience: newExperience };
    });
  };

  const removeResponsibility = (expIndex: number, respIndex: number) => {
    setResumeData(prev => {
      const newExperience = [...prev.experience];
      const newResponsibilities = newExperience[expIndex].responsibilities.filter((_, i) => i !== respIndex);
      newExperience[expIndex] = { ...newExperience[expIndex], responsibilities: newResponsibilities };
      return { ...prev, experience: newExperience };
    });
  };


  return (
    <div className="space-y-8 p-6 bg-white dark:bg-dark-card shadow-lg rounded-lg">
      {/* Target Role/Industry */}
      <div className="space-y-4 border-b dark:border-slate-700 pb-6">
        <h2 className="text-xl font-semibold text-primary dark:text-primary-dark">Target Job</h2>
         <InputField label="Target Role" name="targetRole" value={resumeData.targetRole || ''} onChange={handleGenericChange} />
         <InputField label="Target Industry" name="targetIndustry" value={resumeData.targetIndustry || ''} onChange={handleGenericChange} />
      </div>

      {/* Personal Info */}
      <div className="space-y-4 border-b dark:border-slate-700 pb-6">
        <h2 className="text-xl font-semibold text-primary dark:text-primary-dark">Personal Information</h2>
        <InputField label="Full Name" name="fullName" value={resumeData.personalInfo.fullName} onChange={handlePersonalInfoChange} />
        <InputField label="Email" name="email" type="email" value={resumeData.personalInfo.email} onChange={handlePersonalInfoChange} />
        <InputField label="Phone" name="phone" type="tel" value={resumeData.personalInfo.phone} onChange={handlePersonalInfoChange} />
        <InputField label="LinkedIn Profile URL" name="linkedin" value={resumeData.personalInfo.linkedin} onChange={handlePersonalInfoChange} />
        <InputField label="GitHub Profile URL" name="github" value={resumeData.personalInfo.github} onChange={handlePersonalInfoChange} />
        <InputField label="Portfolio URL" name="portfolio" value={resumeData.personalInfo.portfolio} onChange={handlePersonalInfoChange} />
        <InputField label="Address" name="address" value={resumeData.personalInfo.address} onChange={handlePersonalInfoChange} />
        <TextareaField 
            label="Professional Summary" 
            name="professionalSummary" 
            value={resumeData.personalInfo.professionalSummary} 
            onChange={handlePersonalInfoChange}
            aiAction={() => generateWithAI('summary', 'personalInfo')}
            rows={5} 
        />
      </div>

      {/* Experience */}
      <div className="space-y-4 border-b dark:border-slate-700 pb-6">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold text-primary dark:text-primary-dark">Work Experience</h2>
          <button
            type="button"
            onClick={() => addItem('experience', INITIAL_EXPERIENCE)}
            className="p-2 text-primary dark:text-primary-dark hover:text-secondary dark:hover:text-secondary-dark rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary dark:focus:ring-primary-dark"
          >
            <PlusCircleIcon className="h-7 w-7" />
          </button>
        </div>
        {resumeData.experience.map((exp, index) => (
          <div key={exp.id} className="p-4 border dark:border-slate-700 rounded-md space-y-3 relative bg-gray-50 dark:bg-slate-700/30">
            <button
              type="button"
              onClick={() => removeItem('experience', exp.id)}
              className="absolute top-2 right-2 p-1 text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-500 rounded-full"
              title="Remove Experience"
            >
              <TrashIcon className="h-5 w-5" />
            </button>
            <InputField label="Job Title" name={`exp-title-${index}`} section="experience" index={index} fieldKey="jobTitle" value={exp.jobTitle} />
            <InputField label="Company" name={`exp-company-${index}`} section="experience" index={index} fieldKey="company" value={exp.company} />
            <InputField label="Location" name={`exp-location-${index}`} section="experience" index={index} fieldKey="location" value={exp.location} />
            <div className="grid grid-cols-2 gap-4">
              <InputField label="Start Date" name={`exp-startDate-${index}`} section="experience" index={index} fieldKey="startDate" type="month" value={exp.startDate} />
              <InputField label="End Date" name={`exp-endDate-${index}`} section="experience" index={index} fieldKey="endDate" type="month" value={exp.endDate} disabled={exp.isCurrent} />
            </div>
             <div className="flex items-center">
                <input type="checkbox" id={`exp-current-${index}`} name={`exp-current-${index}`} checked={exp.isCurrent} onChange={(e) => handleListItemChange('experience', index, 'isCurrent', e.target.checked)} className="h-4 w-4 text-primary dark:text-primary-dark border-gray-300 dark:border-slate-600 rounded focus:ring-primary dark:focus:ring-primary-dark" />
                <label htmlFor={`exp-current-${index}`} className="ml-2 block text-sm text-gray-900 dark:text-slate-200">I currently work here</label>
            </div>
            <div>
                <div className="flex justify-between items-center mb-1">
                    <label className="block text-sm font-medium text-gray-700 dark:text-slate-300">Responsibilities/Achievements</label>
                    <button
                        type="button"
                        onClick={() => generateWithAI('experience', 'experienceItem', exp, index)}
                        className="p-1 bg-primary dark:bg-primary-dark text-white rounded-full hover:bg-secondary dark:hover:bg-secondary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary dark:focus:ring-primary-dark"
                        title="Generate with AI"
                        >
                        <SparklesIcon className="h-4 w-4" />
                    </button>
                </div>
                 {exp.responsibilities.map((resp, rIndex) => (
                    <div key={rIndex} className="flex items-center space-x-2 mb-2">
                        <TextareaField
                            containerClassName="flex-grow" 
                            label={`Point ${rIndex + 1}`}
                            name={`exp-resp-${index}-${rIndex}`} 
                            value={resp} 
                            onChange={(e) => handleResponsibilityChange(index, rIndex, e.target.value)}
                            rows={2}
                        />
                        <button type="button" onClick={() => removeResponsibility(index, rIndex)} className="p-1 text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-500"><TrashIcon className="h-4 w-4" /></button>
                    </div>
                ))}
                <button type="button" onClick={() => addResponsibility(index)} className="text-sm text-primary dark:text-primary-dark hover:text-secondary dark:hover:text-secondary-dark">+ Add Responsibility</button>
            </div>
          </div>
        ))}
      </div>

      {/* Education */}
       <div className="space-y-4 border-b dark:border-slate-700 pb-6">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold text-primary dark:text-primary-dark">Education</h2>
          <button type="button" onClick={() => addItem('education', INITIAL_EDUCATION)} className="p-2 text-primary dark:text-primary-dark hover:text-secondary dark:hover:text-secondary-dark rounded-full"><PlusCircleIcon className="h-7 w-7" /></button>
        </div>
        {resumeData.education.map((edu, index) => (
          <div key={edu.id} className="p-4 border dark:border-slate-700 rounded-md space-y-3 relative bg-gray-50 dark:bg-slate-700/30">
            <button type="button" onClick={() => removeItem('education', edu.id)} className="absolute top-2 right-2 p-1 text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-500 rounded-full" title="Remove Education"><TrashIcon className="h-5 w-5" /></button>
            <InputField label="Institution" name={`edu-institution-${index}`} section="education" index={index} fieldKey="institution" value={edu.institution} />
            <InputField label="Degree" name={`edu-degree-${index}`} section="education" index={index} fieldKey="degree" value={edu.degree} />
            <InputField label="Field of Study" name={`edu-field-${index}`} section="education" index={index} fieldKey="fieldOfStudy" value={edu.fieldOfStudy} />
            <InputField label="Graduation Date" name={`edu-gradDate-${index}`} section="education" index={index} fieldKey="graduationDate" type="month" value={edu.graduationDate} />
            <InputField label="GPA (Optional)" name={`edu-gpa-${index}`} section="education" index={index} fieldKey="gpa" value={edu.gpa || ''} />
          </div>
        ))}
      </div>

      {/* Skills */}
      <div className="space-y-4 border-b dark:border-slate-700 pb-6">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold text-primary dark:text-primary-dark">Skills</h2>
          <button type="button" onClick={() => addItem('skills', INITIAL_SKILL)} className="p-2 text-primary dark:text-primary-dark hover:text-secondary dark:hover:text-secondary-dark rounded-full"><PlusCircleIcon className="h-7 w-7" /></button>
        </div>
        {resumeData.skills.map((skill, index) => (
          <div key={skill.id} className="p-4 border dark:border-slate-700 rounded-md space-y-3 relative bg-gray-50 dark:bg-slate-700/30 flex items-end space-x-2">
            <div className="flex-grow"><InputField label="Skill Name" name={`skill-name-${index}`} section="skills" index={index} fieldKey="name" value={skill.name} /></div>
            <div className="w-1/3">
                <label htmlFor={`skill-category-${index}`} className="block text-sm font-medium text-gray-700 dark:text-slate-300">Category</label>
                <select 
                    id={`skill-category-${index}`} 
                    name={`skill-category-${index}`}
                    value={skill.category} 
                    onChange={(e) => handleListItemChange('skills', index, 'category', e.target.value)}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-primary dark:focus:ring-primary-dark focus:border-primary dark:focus:border-primary-dark sm:text-sm bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100"
                >
                    <option>Technical</option>
                    <option>Soft</option>
                    <option>Language</option>
                    <option>Other</option>
                </select>
            </div>
            <button type="button" onClick={() => removeItem('skills', skill.id)} className="p-1 text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-500 rounded-full" title="Remove Skill"><TrashIcon className="h-5 w-5 mb-1" /></button>
          </div>
        ))}
      </div>
      
      {/* Custom Sections */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold text-primary dark:text-primary-dark">Custom Sections</h2>
          <button type="button" onClick={() => addItem('customSections', INITIAL_CUSTOM_SECTION)} className="p-2 text-primary dark:text-primary-dark hover:text-secondary dark:hover:text-secondary-dark rounded-full"><PlusCircleIcon className="h-7 w-7" /></button>
        </div>
        {resumeData.customSections.map((sectionItem, index) => (
          <div key={sectionItem.id} className="p-4 border dark:border-slate-700 rounded-md space-y-3 relative bg-gray-50 dark:bg-slate-700/30">
            <button type="button" onClick={() => removeItem('customSections', sectionItem.id)} className="absolute top-2 right-2 p-1 text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-500 rounded-full" title="Remove Section"><TrashIcon className="h-5 w-5" /></button>
            <InputField label="Section Title" name={`custom-title-${index}`} section="customSections" index={index} fieldKey="title" value={sectionItem.title} />
            <TextareaField 
                label="Content" 
                name={`custom-content-${index}`}
                section="customSections" index={index} fieldKey="content" value={sectionItem.content}
                aiAction={() => generateWithAI('smartSuggestions', 'generic', {sectionName: sectionItem.title, existingContent: sectionItem.content}, index)}
                rows={4} 
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default ResumeForm;