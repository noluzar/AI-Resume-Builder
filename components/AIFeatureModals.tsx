
import React, { useContext } from 'react';
import { ResumeContext } from '../App';
import { AIResponse, GroundingChunk } from '../types';
import { XMarkIcon, LinkIcon } from '@heroicons/react/24/solid';

export enum ModalType {
  Keywords = 'Keywords & Action Verbs',
  ATS = 'ATS Compatibility Analysis',
  JobMatch = 'Job Description Match Analysis',
  SmartSuggestions = 'Smart Content Suggestions',
  Generic = 'AI Insights'
}

const AIFeatureModals: React.FC = () => {
  const { activeModal, closeModal, modalData, isLoadingAI, aiError, groundingChunks } = useContext(ResumeContext);

  if (!activeModal || !modalData) return null;

  const renderModalContent = () => {
    if (isLoadingAI) {
      return <p className="text-gray-700 dark:text-slate-300">Loading AI insights...</p>;
    }
    if (aiError && !modalData.error) { // Prioritize modalData.error if it exists
      return <p className="text-red-600 dark:text-red-400">Error: {aiError}</p>;
    }
    if (modalData.error) {
       return <p className="text-red-600 dark:text-red-400">Error: {modalData.error}</p>;
    }

    switch (activeModal) {
      case ModalType.Keywords:
        return (
          <>
            {modalData.keywords && modalData.keywords.length > 0 && (
              <div>
                <h4 className="font-semibold text-primary dark:text-primary-dark mb-1">Suggested Keywords:</h4>
                <div className="flex flex-wrap gap-2">
                    {modalData.keywords.map((kw, i) => <span key={i} className="bg-blue-100 dark:bg-blue-800/50 text-blue-700 dark:text-blue-300 px-2 py-1 rounded-full text-sm">{kw}</span>)}
                </div>
              </div>
            )}
             {modalData.suggestions && modalData.suggestions.length > 0 && ( 
              <div className="mt-4">
                <h4 className="font-semibold text-primary dark:text-primary-dark mb-1">Suggested Action Verbs:</h4>
                 <div className="flex flex-wrap gap-2">
                    {modalData.suggestions.map((verb, i) => <span key={i} className="bg-green-100 dark:bg-green-800/50 text-green-700 dark:text-green-300 px-2 py-1 rounded-full text-sm">{verb}</span>)}
                </div>
              </div>
            )}
            {(!modalData.keywords || modalData.keywords.length === 0) && (!modalData.suggestions || modalData.suggestions.length === 0) && modalData.text && (
                 <pre className="mt-2 whitespace-pre-wrap text-sm bg-gray-50 dark:bg-slate-700 p-3 rounded text-gray-800 dark:text-slate-200">{modalData.text}</pre>
            )}
          </>
        );
      case ModalType.ATS:
      case ModalType.JobMatch:
        return (
          <>
            <h4 className="font-semibold text-primary dark:text-primary-dark mb-1">Analysis:</h4>
            <pre className="whitespace-pre-wrap text-sm bg-gray-50 dark:bg-slate-700 p-3 rounded max-h-96 overflow-y-auto text-gray-800 dark:text-slate-200">{modalData.analysis || modalData.text}</pre>
          </>
        );
      case ModalType.SmartSuggestions:
        return (
          <>
            <h4 className="font-semibold text-primary dark:text-primary-dark mb-1">Suggestions:</h4>
            {modalData.suggestions && modalData.suggestions.length > 0 ? (
              <ul className="list-disc list-inside space-y-1 text-sm bg-gray-50 dark:bg-slate-700 p-3 rounded max-h-96 overflow-y-auto text-gray-800 dark:text-slate-200">
                {modalData.suggestions.map((s, i) => <li key={i}>{s}</li>)}
              </ul>
            ) : <pre className="whitespace-pre-wrap text-sm bg-gray-50 dark:bg-slate-700 p-3 rounded text-gray-800 dark:text-slate-200">{modalData.text || "No specific suggestions provided."}</pre>}
          </>
        );
      case ModalType.Generic:
         return (
             <>
                <h4 className="font-semibold text-primary dark:text-primary-dark mb-1">AI Response:</h4>
                <pre className="whitespace-pre-wrap text-sm bg-gray-50 dark:bg-slate-700 p-3 rounded max-h-96 overflow-y-auto text-gray-800 dark:text-slate-200">{modalData.text || "No text response."}</pre>
             </>
         );
      default:
        return <p className="text-gray-700 dark:text-slate-300">No specific content for this view.</p>;
    }
  };
  
  const renderGroundingChunks = () => {
    if (!groundingChunks || groundingChunks.length === 0) return null;

    return (
      <div className="mt-4 border-t dark:border-slate-600 pt-3">
        <h5 className="font-semibold text-sm text-gray-600 dark:text-slate-400 mb-1">Sources from Google Search:</h5>
        <ul className="list-disc list-inside space-y-1 text-xs">
          {groundingChunks.map((chunk, index) => {
            const uri = chunk.web?.uri || chunk.retrievedContext?.uri;
            const title = chunk.web?.title || chunk.retrievedContext?.title || uri;
            if (!uri) return null;
            return (
              <li key={index}>
                <a href={uri} target="_blank" rel="noopener noreferrer" className="text-primary dark:text-primary-dark hover:underline flex items-center">
                  <LinkIcon className="h-3 w-3 mr-1 flex-shrink-0" />
                  {title}
                </a>
              </li>
            );
          })}
        </ul>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 dark:bg-opacity-75 flex items-center justify-center z-50 p-4 transition-opacity duration-300">
      <div className="bg-white dark:bg-dark-card p-6 rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] flex flex-col transition-colors duration-300">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold text-primary dark:text-primary-dark">{activeModal}</h3>
          <button onClick={closeModal} className="text-gray-400 dark:text-slate-400 hover:text-gray-600 dark:hover:text-slate-200">
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>
        <div className="overflow-y-auto flex-grow pr-2 -mr-2"> {/* Added padding for scrollbar visibility */}
            {renderModalContent()}
            {renderGroundingChunks()}
        </div>
         <button 
            onClick={closeModal} 
            className="mt-6 w-full px-4 py-2 bg-primary dark:bg-primary-dark text-white rounded-md hover:bg-secondary dark:hover:bg-secondary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary dark:focus:ring-primary-dark transition-colors"
        >
            Close
        </button>
      </div>
    </div>
  );
};

export default AIFeatureModals;