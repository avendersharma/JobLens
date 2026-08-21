import { jsPDF } from 'jspdf';

interface Props {
  content: string;
  companyName: string;
  version?: number;
  onClose: () => void;
}

export default function CoverLetterModal({ content, companyName, version, onClose }: Props) {
  const handleDownloadPDF = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 20;
    const lineHeight = 7;
    const maxWidth = pageWidth - (margin * 2);
    let yPosition = margin;

    const addText = (text: string, isBold = false, fontSize = 11) => {
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

    // Split content by paragraphs
    const paragraphs = content.split('\n\n');

    paragraphs.forEach((paragraph) => {
      if (paragraph.trim()) {
        addText(paragraph.trim());
        yPosition += lineHeight / 2; // Space between paragraphs
      }
    });

    doc.save(`cover_letter_${companyName.replace(/\s+/g, '_')}_v${version || 1}.pdf`);
  };

  const handleCopyToClipboard = () => {
    navigator.clipboard.writeText(content);
    // Could add a toast notification here
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-xl border border-gray-800 max-w-3xl w-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-800">
          <div className="flex items-center gap-3">
            <h3 className="text-lg font-semibold text-white">Cover Letter</h3>
            <span className="text-sm text-gray-400">for {companyName}</span>
            {version && (
              <span className="rounded-full bg-indigo-900/50 px-3 py-1 text-xs font-medium text-indigo-300">
                v{version}
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="rounded-lg bg-gray-950 border border-gray-800 p-6">
            <div className="whitespace-pre-wrap font-serif text-sm text-gray-300 leading-relaxed">
              {content}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-800">
          <button
            onClick={handleCopyToClipboard}
            className="rounded-lg bg-gray-800 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700 transition-colors"
          >
            Copy to Clipboard
          </button>
          <button
            onClick={handleDownloadPDF}
            className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500 transition-colors"
          >
            Download PDF
          </button>
        </div>
      </div>
    </div>
  );
}
