import { jsPDF } from 'jspdf';

interface Suggestion {
  missingKeywords: string[];
  sectionsToReorder: Array<{
    section: string;
    currentPosition: string;
    suggestedPosition: string;
    reason: string;
  }>;
  bulletsToStrengthen: Array<{
    currentBullet: string;
    issue: string;
    suggestion: string;
  }>;
  skillsToEmphasize: string[];
  contentToExpand: Array<{
    section: string;
    reason: string;
  }>;
  contentToCondense: Array<{
    section: string;
    reason: string;
  }>;
  overallRecommendation: string;
}

interface Props {
  suggestions: Suggestion;
  version?: number;
}

export default function SuggestionsReport({ suggestions, version }: Props) {
  const handleDownloadPDF = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 20;
    const lineHeight = 7;
    const maxWidth = pageWidth - (margin * 2);
    let yPosition = margin;

    const addText = (text: string, isBold = false, fontSize = 10) => {
      if (yPosition + lineHeight > pageHeight - margin) {
        doc.addPage();
        yPosition = margin;
      }
      doc.setFont('helvetica', isBold ? 'bold' : 'normal');
      doc.setFontSize(fontSize);
      const lines = doc.splitTextToSize(text, maxWidth);
      lines.forEach((line: string) => {
        if (yPosition + lineHeight > pageHeight - margin) {
          doc.addPage();
          yPosition = margin;
        }
        doc.text(line, margin, yPosition);
        yPosition += lineHeight;
      });
    };

    const addSection = (title: string) => {
      yPosition += lineHeight / 2;
      addText(title, true, 12);
      yPosition += lineHeight / 2;
    };

    // Title
    addText('RESUME IMPROVEMENT REPORT', true, 16);
    yPosition += lineHeight;

    // Overall Recommendation
    addSection('EXECUTIVE SUMMARY');
    addText(suggestions.overallRecommendation);
    yPosition += lineHeight;

    // Missing Keywords
    if (suggestions.missingKeywords.length > 0) {
      addSection('MISSING KEYWORDS');
      addText('Add these keywords from the job description:');
      suggestions.missingKeywords.forEach((keyword) => {
        addText(`• ${keyword}`);
      });
      yPosition += lineHeight;
    }

    // Skills to Emphasize
    if (suggestions.skillsToEmphasize.length > 0) {
      addSection('SKILLS TO EMPHASIZE');
      addText('Highlight these skills more prominently:');
      suggestions.skillsToEmphasize.forEach((skill) => {
        addText(`• ${skill}`);
      });
      yPosition += lineHeight;
    }

    // Sections to Reorder
    if (suggestions.sectionsToReorder.length > 0) {
      addSection('SECTIONS TO REORDER');
      suggestions.sectionsToReorder.forEach((item) => {
        addText(`Section: ${item.section}`, true);
        addText(`Current: ${item.currentPosition}`);
        addText(`Suggested: ${item.suggestedPosition}`);
        addText(`Why: ${item.reason}`);
        yPosition += lineHeight / 2;
      });
      yPosition += lineHeight;
    }

    // Bullets to Strengthen
    if (suggestions.bulletsToStrengthen.length > 0) {
      addSection('BULLETS TO STRENGTHEN');
      suggestions.bulletsToStrengthen.forEach((item, index) => {
        addText(`${index + 1}. Current Bullet:`, true);
        addText(`"${item.currentBullet}"`);
        addText(`Issue: ${item.issue}`);
        addText(`Suggestion: ${item.suggestion}`);
        yPosition += lineHeight / 2;
      });
      yPosition += lineHeight;
    }

    // Content to Expand
    if (suggestions.contentToExpand.length > 0) {
      addSection('CONTENT TO EXPAND');
      suggestions.contentToExpand.forEach((item) => {
        addText(`• ${item.section}: ${item.reason}`);
      });
      yPosition += lineHeight;
    }

    // Content to Condense
    if (suggestions.contentToCondense.length > 0) {
      addSection('CONTENT TO CONDENSE');
      suggestions.contentToCondense.forEach((item) => {
        addText(`• ${item.section}: ${item.reason}`);
      });
    }

    doc.save(`resume_suggestions_v${version || 1}.pdf`);
  };

  return (
    <div className="rounded-xl border border-gray-800 bg-gray-900 p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h3 className="text-lg font-semibold text-white">Resume Improvement Suggestions</h3>
          {version && (
            <span className="rounded-full bg-indigo-900/50 px-3 py-1 text-xs font-medium text-indigo-300">
              Version {version}
            </span>
          )}
        </div>
        <button
          onClick={handleDownloadPDF}
          className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500 transition-colors"
        >
          Download PDF Report
        </button>
      </div>

      {/* Overall Recommendation */}
      <div className="rounded-lg bg-indigo-900/20 border border-indigo-800 p-4">
        <h4 className="text-sm font-semibold text-indigo-300 mb-2">EXECUTIVE SUMMARY</h4>
        <p className="text-sm text-gray-300 leading-relaxed">{suggestions.overallRecommendation}</p>
      </div>

      {/* Missing Keywords */}
      {suggestions.missingKeywords.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-semibold text-white">MISSING KEYWORDS</h4>
          <p className="text-xs text-gray-400">Add these keywords from the job description:</p>
          <div className="flex flex-wrap gap-2">
            {suggestions.missingKeywords.map((keyword) => (
              <span
                key={keyword}
                className="rounded-full bg-yellow-900/50 border border-yellow-700 px-3 py-1 text-xs text-yellow-300"
              >
                {keyword}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Skills to Emphasize */}
      {suggestions.skillsToEmphasize.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-semibold text-white">SKILLS TO EMPHASIZE</h4>
          <p className="text-xs text-gray-400">Highlight these skills more prominently:</p>
          <div className="flex flex-wrap gap-2">
            {suggestions.skillsToEmphasize.map((skill) => (
              <span
                key={skill}
                className="rounded-full bg-green-900/50 border border-green-700 px-3 py-1 text-xs text-green-300"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Sections to Reorder */}
      {suggestions.sectionsToReorder.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-sm font-semibold text-white">SECTIONS TO REORDER</h4>
          {suggestions.sectionsToReorder.map((item, index) => (
            <div key={index} className="rounded-lg bg-gray-800 p-4 space-y-2">
              <p className="text-sm font-medium text-white">{item.section}</p>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-gray-500">Current:</span>
                  <p className="text-gray-300">{item.currentPosition}</p>
                </div>
                <div>
                  <span className="text-gray-500">Suggested:</span>
                  <p className="text-green-300">{item.suggestedPosition}</p>
                </div>
              </div>
              <p className="text-xs text-gray-400">
                <span className="font-medium">Why:</span> {item.reason}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Bullets to Strengthen */}
      {suggestions.bulletsToStrengthen.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-sm font-semibold text-white">BULLETS TO STRENGTHEN</h4>
          {suggestions.bulletsToStrengthen.map((item, index) => (
            <div key={index} className="rounded-lg bg-gray-800 p-4 space-y-2">
              <p className="text-xs font-medium text-gray-400">Current Bullet:</p>
              <p className="text-sm text-gray-300 italic">"{item.currentBullet}"</p>
              <div className="space-y-1">
                <p className="text-xs">
                  <span className="font-medium text-red-400">Issue:</span>{' '}
                  <span className="text-gray-300">{item.issue}</span>
                </p>
                <p className="text-xs">
                  <span className="font-medium text-green-400">Suggestion:</span>{' '}
                  <span className="text-gray-300">{item.suggestion}</span>
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Content to Expand/Condense */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {suggestions.contentToExpand.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-semibold text-white">CONTENT TO EXPAND</h4>
            <div className="space-y-2">
              {suggestions.contentToExpand.map((item, index) => (
                <div key={index} className="rounded-lg bg-blue-900/20 border border-blue-800 p-3">
                  <p className="text-sm font-medium text-blue-300">{item.section}</p>
                  <p className="text-xs text-gray-400 mt-1">{item.reason}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {suggestions.contentToCondense.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-semibold text-white">CONTENT TO CONDENSE</h4>
            <div className="space-y-2">
              {suggestions.contentToCondense.map((item, index) => (
                <div key={index} className="rounded-lg bg-orange-900/20 border border-orange-800 p-3">
                  <p className="text-sm font-medium text-orange-300">{item.section}</p>
                  <p className="text-xs text-gray-400 mt-1">{item.reason}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
