
import React, { useContext } from 'react';
import { ResumeContext } from '../App';
import { ResumeData, TemplateId, Experience, Education, Skill, CustomSection } from '../types';
import { PhoneIcon, EnvelopeIcon, LinkIcon, MapPinIcon, BriefcaseIcon, AcademicCapIcon, WrenchScrewdriverIcon, DocumentTextIcon, UserCircleIcon } from '@heroicons/react/24/solid'; // Solid icons for preview

// Helper function to format dates (basic)
const formatDate = (dateString: string, isCurrent?: boolean, endDateString?: string): string => {
  if (!dateString) return 'Present';
  // Ensure dateString includes at least year and month. Append a day if only year-month.
  const fullDateString = dateString.includes('-') && dateString.split('-').length === 2 ? `${dateString}-01` : dateString;

  const date = new Date(fullDateString + 'T00:00:00'); // Ensure it's parsed as local time
  const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'short' };
  
  if (isNaN(date.getTime())) return "Invalid Date"; // Handle invalid date strings

  const formattedStartDate = date.toLocaleDateString(undefined, options);

  if (isCurrent) return `${formattedStartDate} - Present`;
  if (endDateString) {
    const fullEndDateString = endDateString.includes('-') && endDateString.split('-').length === 2 ? `${endDateString}-01` : endDateString;
    const endDate = new Date(fullEndDateString + 'T00:00:00');
    if (isNaN(endDate.getTime())) return formattedStartDate; // If end date is invalid, just show start

    const formattedEndDate = endDate.toLocaleDateString(undefined, options);
    return `${formattedStartDate} - ${formattedEndDate}`;
  }
  return formattedStartDate; // For graduation dates or single dates
};

// --- Template Components ---

// Base Section Component
interface SectionProps {
  title: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  titleClassName?: string;
  iconWrapperClassName?: string;
  style?: React.CSSProperties; // Added style prop
}

const Section: React.FC<SectionProps> = ({ title, icon, children, className, titleClassName, iconWrapperClassName, style }) => (
  <section className={`mb-4 ${className || ''}`} style={style}> {/* Apply style here */}
    <h2 className={`text-lg font-semibold border-b-2 border-current pb-1 mb-2 flex items-center ${titleClassName || 'text-primary dark:text-primary-dark'}`}>
      {icon && <span className={`h-5 w-5 mr-2 inline-flex items-center justify-center shrink-0 ${iconWrapperClassName || ''}`}>{icon}</span>}
      {title}
    </h2>
    <div className="text-sm">
      {children}
    </div>
  </section>
);


// Modern Template
const ModernTemplate: React.FC<{ resumeData: ResumeData, accentColor: string }> = ({ resumeData, accentColor }) => {
  const { personalInfo, experience, education, skills, customSections } = resumeData;
  const dynamicHeaderStyle = { color: accentColor };
  const dynamicBorderStyle = { borderColor: accentColor };

  return (
    <div className="font-sans bg-white p-8 shadow-md text-gray-700">
      <header className="text-center mb-6">
        <h1 className="text-3xl font-bold" style={dynamicHeaderStyle}>{personalInfo.fullName || 'Your Name'}</h1>
        <div className="flex justify-center items-center space-x-3 text-xs mt-2 text-gray-600 flex-wrap">
          {personalInfo.email && <span className="flex items-center"><EnvelopeIcon className="h-3 w-3 mr-1" /> {personalInfo.email}</span>}
          {personalInfo.phone && <span className="flex items-center"><PhoneIcon className="h-3 w-3 mr-1" /> {personalInfo.phone}</span>}
          {personalInfo.linkedin && <a href={personalInfo.linkedin} target="_blank" rel="noopener noreferrer" className="flex items-center hover:underline" style={{color: accentColor}}><LinkIcon className="h-3 w-3 mr-1" /> LinkedIn</a>}
          {personalInfo.github && <a href={personalInfo.github} target="_blank" rel="noopener noreferrer" className="flex items-center hover:underline" style={{color: accentColor}}><LinkIcon className="h-3 w-3 mr-1" /> GitHub</a>}
          {personalInfo.portfolio && <a href={personalInfo.portfolio} target="_blank" rel="noopener noreferrer" className="flex items-center hover:underline" style={{color: accentColor}}><LinkIcon className="h-3 w-3 mr-1" /> Portfolio</a>}
        </div>
         {personalInfo.address && <p className="text-xs text-gray-500 mt-1 flex items-center justify-center"><MapPinIcon className="h-3 w-3 mr-1" />{personalInfo.address}</p>}
      </header>

      {personalInfo.professionalSummary && (
        <Section title="Summary" icon={<UserCircleIcon />} titleClassName={`text-[${accentColor}]`} iconWrapperClassName={`text-[${accentColor}]`} className="border-b" style={dynamicBorderStyle}>
          <p className="text-sm text-gray-600">{personalInfo.professionalSummary}</p>
        </Section>
      )}

      {experience.length > 0 && (
        <Section title="Experience" icon={<BriefcaseIcon />} titleClassName={`text-[${accentColor}]`} iconWrapperClassName={`text-[${accentColor}]`} className="border-b" style={dynamicBorderStyle}>
          {experience.map(exp => (
            <div key={exp.id} className="mb-3">
              <h3 className="font-semibold text-md">{exp.jobTitle || 'Job Title'} at {exp.company || 'Company'}</h3>
              <p className="text-xs text-gray-500">{exp.location || 'Location'} | {formatDate(exp.startDate, exp.isCurrent, exp.endDate)}</p>
              <ul className="list-disc list-inside ml-4 text-gray-600 mt-1 space-y-0.5">
                {exp.responsibilities.map((r, i) => r && <li key={i}>{r}</li>)}
              </ul>
            </div>
          ))}
        </Section>
      )}

      {education.length > 0 && (
        <Section title="Education" icon={<AcademicCapIcon />} titleClassName={`text-[${accentColor}]`} iconWrapperClassName={`text-[${accentColor}]`} className="border-b" style={dynamicBorderStyle}>
          {education.map(edu => (
            <div key={edu.id} className="mb-2">
              <h3 className="font-semibold text-md">{edu.degree || 'Degree'} - {edu.fieldOfStudy || 'Field of Study'}</h3>
              <p className="text-gray-600">{edu.institution || 'Institution'}</p>
              <p className="text-xs text-gray-500">{formatDate(edu.graduationDate)} {edu.gpa && `| GPA: ${edu.gpa}`}</p>
            </div>
          ))}
        </Section>
      )}

      {skills.length > 0 && (
        <Section title="Skills" icon={<WrenchScrewdriverIcon />} titleClassName={`text-[${accentColor}]`} iconWrapperClassName={`text-[${accentColor}]`} className="border-b" style={dynamicBorderStyle}>
          {Object.entries(skills.reduce((acc, skill) => {
            acc[skill.category] = [...(acc[skill.category] || []), skill.name];
            return acc;
          }, {} as Record<string, string[]>)).map(([category, skillNames]) => (
            <div key={category} className="mb-1">
              <strong className="text-gray-700">{category}: </strong>
              <span className="text-gray-600">{skillNames.join(', ')}</span>
            </div>
          ))}
        </Section>
      )}

      {customSections.map(section => section.title && section.content && (
        <Section key={section.id} title={section.title} icon={<DocumentTextIcon />} titleClassName={`text-[${accentColor}]`} iconWrapperClassName={`text-[${accentColor}]`} className="border-b" style={dynamicBorderStyle}>
          <p className="text-gray-600 whitespace-pre-wrap">{section.content}</p>
        </Section>
      ))}
    </div>
  );
};

// Classic Template
const ClassicTemplate: React.FC<{ resumeData: ResumeData, accentColor: string }> = ({ resumeData, accentColor }) => {
  const { personalInfo, experience, education, skills, customSections } = resumeData;
  const dynamicHeaderStyle = { color: accentColor };
  const dynamicBorderStyle = { borderColor: accentColor };

  return (
    <div className="font-serif bg-white p-10 shadow-lg text-gray-800 leading-relaxed">
      <header className="text-center mb-8 border-b-2 pb-4" style={dynamicBorderStyle}>
        <h1 className="text-4xl font-bold" style={dynamicHeaderStyle}>{personalInfo.fullName || 'YOUR NAME'}</h1>
        <div className="mt-2 text-sm text-gray-700">
          {personalInfo.address && <span>{personalInfo.address} | </span>}
          {personalInfo.phone && <span>{personalInfo.phone} | </span>}
          {personalInfo.email && <a href={`mailto:${personalInfo.email}`} className="hover:underline" style={{color: accentColor}}>{personalInfo.email}</a>}
          <br />
          {personalInfo.linkedin && <a href={personalInfo.linkedin} target="_blank" rel="noopener noreferrer" className="hover:underline" style={{color: accentColor}}>LinkedIn</a>}
          {personalInfo.github && <span> | <a href={personalInfo.github} target="_blank" rel="noopener noreferrer" className="hover:underline" style={{color: accentColor}}>GitHub</a></span>}
          {personalInfo.portfolio && <span> | <a href={personalInfo.portfolio} target="_blank" rel="noopener noreferrer" className="hover:underline" style={{color: accentColor}}>Portfolio</a></span>}
        </div>
      </header>

      {personalInfo.professionalSummary && (
        <Section title="PROFESSIONAL SUMMARY" icon={<UserCircleIcon />} titleClassName={`font-bold text-lg tracking-wider text-[${accentColor}]`} iconWrapperClassName={`text-[${accentColor}]`} style={dynamicBorderStyle}>
          <p>{personalInfo.professionalSummary}</p>
        </Section>
      )}

      {experience.length > 0 && (
        <Section title="PROFESSIONAL EXPERIENCE" icon={<BriefcaseIcon />} titleClassName={`font-bold text-lg tracking-wider text-[${accentColor}]`} iconWrapperClassName={`text-[${accentColor}]`} style={dynamicBorderStyle}>
          {experience.map(exp => (
            <div key={exp.id} className="mb-4">
              <h3 className="text-md font-semibold">{exp.jobTitle || 'Job Title'}</h3>
              <p className="italic">{exp.company || 'Company Name'}, {exp.location || 'Location'} ({formatDate(exp.startDate, exp.isCurrent, exp.endDate)})</p>
              <ul className="list-disc list-outside ml-5 mt-1 space-y-0.5">
                {exp.responsibilities.map((r, i) => r && <li key={i}>{r}</li>)}
              </ul>
            </div>
          ))}
        </Section>
      )}

      {education.length > 0 && (
        <Section title="EDUCATION" icon={<AcademicCapIcon />} titleClassName={`font-bold text-lg tracking-wider text-[${accentColor}]`} iconWrapperClassName={`text-[${accentColor}]`} style={dynamicBorderStyle}>
          {education.map(edu => (
            <div key={edu.id} className="mb-3">
              <h3 className="text-md font-semibold">{edu.institution || 'University Name'}, {edu.degree || 'Degree Title'}</h3>
              <p className="italic">{edu.fieldOfStudy || 'Field of Study'} - Graduated: {formatDate(edu.graduationDate)} {edu.gpa && `(GPA: ${edu.gpa})`}</p>
            </div>
          ))}
        </Section>
      )}

      {skills.length > 0 && (
         <Section title="SKILLS" icon={<WrenchScrewdriverIcon />} titleClassName={`font-bold text-lg tracking-wider text-[${accentColor}]`} iconWrapperClassName={`text-[${accentColor}]`} style={dynamicBorderStyle}>
          {Object.entries(skills.reduce((acc, skill) => {
              acc[skill.category] = [...(acc[skill.category] || []), skill.name];
              return acc;
            }, {} as Record<string, string[]>)).map(([category, skillNames]) => (
              <p key={category}><strong className="font-semibold">{category}:</strong> {skillNames.join(', ')}</p>
          ))}
        </Section>
      )}

      {customSections.map(section => section.title && section.content && (
         <Section key={section.id} title={section.title.toUpperCase()} icon={<DocumentTextIcon />} titleClassName={`font-bold text-lg tracking-wider text-[${accentColor}]`} iconWrapperClassName={`text-[${accentColor}]`} style={dynamicBorderStyle}>
          <p className="whitespace-pre-wrap">{section.content}</p>
        </Section>
      ))}
    </div>
  );
};

// Creative Template (Example: Two-column layout)
const CreativeTemplate: React.FC<{ resumeData: ResumeData, accentColor: string }> = ({ resumeData, accentColor }) => {
  const { personalInfo, experience, education, skills, customSections } = resumeData;
  const sidebarStyle = { backgroundColor: accentColor };

  return (
    <div className="font-sans bg-white shadow-xl flex min-h-[297mm]"> {/* A4-ish height */}
      {/* Sidebar */}
      <aside className="w-1/3 p-6 text-white" style={sidebarStyle}>
        <div className="text-center mb-6">
            <UserCircleIcon className="h-24 w-24 mx-auto mb-2 text-white opacity-75" />
            <h1 className="text-2xl font-bold">{personalInfo.fullName || 'Your Name'}</h1>
            {resumeData.targetRole && <p className="text-sm opacity-90">{resumeData.targetRole}</p>}
        </div>
        
        <div className="space-y-3 text-xs">
            {personalInfo.email && <p className="flex items-center"><EnvelopeIcon className="h-4 w-4 mr-2 flex-shrink-0" /> {personalInfo.email}</p>}
            {personalInfo.phone && <p className="flex items-center"><PhoneIcon className="h-4 w-4 mr-2 flex-shrink-0" /> {personalInfo.phone}</p>}
            {personalInfo.address && <p className="flex items-center"><MapPinIcon className="h-4 w-4 mr-2 flex-shrink-0" /> {personalInfo.address}</p>}
            {personalInfo.linkedin && <p><a href={personalInfo.linkedin} target="_blank" rel="noopener noreferrer" className="flex items-center hover:underline"><LinkIcon className="h-4 w-4 mr-2 flex-shrink-0" /> LinkedIn</a></p>}
            {personalInfo.github && <p><a href={personalInfo.github} target="_blank" rel="noopener noreferrer" className="flex items-center hover:underline"><LinkIcon className="h-4 w-4 mr-2 flex-shrink-0" /> GitHub</a></p>}
            {personalInfo.portfolio && <p><a href={personalInfo.portfolio} target="_blank" rel="noopener noreferrer" className="flex items-center hover:underline"><LinkIcon className="h-4 w-4 mr-2 flex-shrink-0" /> Portfolio</a></p>}
        </div>

        {skills.length > 0 && (
            <div className="mt-6">
                <h2 className="text-lg font-semibold border-b border-white border-opacity-50 pb-1 mb-2">SKILLS</h2>
                {Object.entries(skills.reduce((acc, skill) => {
                acc[skill.category] = [...(acc[skill.category] || []), skill.name];
                return acc;
                }, {} as Record<string, string[]>)).map(([category, skillNames]) => (
                <div key={category} className="mb-2">
                    <strong className="text-sm block opacity-90">{category}</strong>
                    <p className="text-xs opacity-80">{skillNames.join(', ')}</p>
                </div>
                ))}
            </div>
        )}
         {education.length > 0 && (
            <div className="mt-6">
                <h2 className="text-lg font-semibold border-b border-white border-opacity-50 pb-1 mb-2">EDUCATION</h2>
                {education.map(edu => (
                    <div key={edu.id} className="mb-2 text-xs">
                    <h3 className="font-semibold">{edu.degree || 'Degree'}</h3>
                    <p className="opacity-90">{edu.institution || 'Institution'}</p>
                    <p className="opacity-80">{edu.fieldOfStudy || 'Field of Study'}</p>
                    <p className="opacity-80">{formatDate(edu.graduationDate)} {edu.gpa && `| GPA: ${edu.gpa}`}</p>
                    </div>
                ))}
            </div>
        )}
      </aside>

      {/* Main Content */}
      <main className="w-2/3 p-8 text-gray-700">
        {personalInfo.professionalSummary && (
          <Section title="SUMMARY" icon={<UserCircleIcon />} titleClassName={`text-xl font-bold text-[${accentColor}] border-b-0`} iconWrapperClassName={`text-[${accentColor}]`}>
            <p className="text-sm text-gray-600">{personalInfo.professionalSummary}</p>
          </Section>
        )}

        {experience.length > 0 && (
          <Section title="EXPERIENCE" icon={<BriefcaseIcon />} titleClassName={`text-xl font-bold text-[${accentColor}] border-b-0`} iconWrapperClassName={`text-[${accentColor}]`}>
            {experience.map(exp => (
              <div key={exp.id} className="mb-4">
                <h3 className="text-md font-semibold">{exp.jobTitle || 'Job Title'}</h3>
                <p className="text-sm font-medium text-gray-600">{exp.company || 'Company'} | {exp.location || 'Location'}</p>
                <p className="text-xs text-gray-500 mb-1">{formatDate(exp.startDate, exp.isCurrent, exp.endDate)}</p>
                <ul className="list-disc list-inside ml-4 text-sm text-gray-600 space-y-0.5">
                  {exp.responsibilities.map((r, i) => r && <li key={i}>{r}</li>)}
                </ul>
              </div>
            ))}
          </Section>
        )}

        {customSections.map(section => section.title && section.content && (
          <Section key={section.id} title={section.title.toUpperCase()} icon={<DocumentTextIcon />} titleClassName={`text-xl font-bold text-[${accentColor}] border-b-0`} iconWrapperClassName={`text-[${accentColor}]`}>
            <p className="text-sm text-gray-600 whitespace-pre-wrap">{section.content}</p>
          </Section>
        ))}
      </main>
    </div>
  );
};

// --- Template Map ---
const templates: Record<TemplateId, React.FC<{ resumeData: ResumeData, accentColor: string }>> = {
  [TemplateId.MODERN]: ModernTemplate,
  [TemplateId.CLASSIC]: ClassicTemplate,
  [TemplateId.CREATIVE]: CreativeTemplate,
};


// Main Preview Component
const ResumePreview: React.FC = () => {
  const { resumeData, selectedTemplate, accentColor } = useContext(ResumeContext);
  const SelectedTemplateComponent = templates[selectedTemplate];

  return (
    <div className="bg-gray-200 dark:bg-slate-800 p-4 rounded-lg shadow-inner dark:shadow-slate-900/50 transition-colors duration-300">
      <div id="resume-preview-content" className="max-w-4xl mx-auto bg-white overflow-y-auto aspect-[210/297] print:shadow-none"> {/* A4 Aspect Ratio. bg-white is important for export accuracy */}
        {SelectedTemplateComponent ? (
          <SelectedTemplateComponent resumeData={resumeData} accentColor={accentColor} />
        ) : (
          <p className="p-4 text-red-600 dark:text-red-400">Error: Template not found.</p>
        )}
      </div>
    </div>
  );
};

export default ResumePreview;
