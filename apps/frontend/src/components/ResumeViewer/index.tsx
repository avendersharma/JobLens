import { jsPDF } from 'jspdf';

interface Props {
  content: string;
  version?: number;
  onDownload?: () => void;
}

export default function ResumeViewer({ content, version, onDownload }: Props) {
  const handleDownloadPDF = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 20;
    const lineHeight = 7;
    const maxWidth = pageWidth - (margin * 2);

    let yPosition = margin;

    // Split content by lines
    const lines = content.split('\n');

    doc.setFontSize(10);

    lines.forEach((line) => {
      // Handle empty lines
      if (!line.trim()) {
        yPosition += lineHeight / 2;
        return;
      }

      // Check if we need a new page
      if (yPosition + lineHeight > pageHeight - margin) {
        doc.addPage();
        yPosition = margin;
      }

      // Handle headings (lines in ALL CAPS or starting with #)
      if (line === line.toUpperCase() && line.length < 50 || line.startsWith('#')) {
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(12);
        const cleanLine = line.replace(/^#+\s*/, '');
        doc.text(cleanLine, margin, yPosition);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);
        yPosition += lineHeight * 1.5;
      } else {
        // Regular text with wrapping
        const wrappedLines = doc.splitTextToSize(line, maxWidth);
        wrappedLines.forEach((wrappedLine: string) => {
          if (yPosition + lineHeight > pageHeight - margin) {
            doc.addPage();
            yPosition = margin;
          }
          doc.text(wrappedLine, margin, yPosition);
          yPosition += lineHeight;
        });
      }
    });

    doc.save(`tailored_resume_v${version || 1}.pdf`);

    if (onDownload) onDownload();
  };

  const handleDownloadTXT = () => {
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `tailored_resume_v${version || 1}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    if (onDownload) onDownload();
  };

  return (
    <div className="rounded-xl border border-gray-800 bg-gray-900 p-6 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h3 className="text-lg font-semibold text-white">Tailored Resume</h3>
          {version && (
            <span className="rounded-full bg-indigo-900/50 px-3 py-1 text-xs font-medium text-indigo-300">
              Version {version}
            </span>
          )}
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleDownloadPDF}
            className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500 transition-colors"
          >
            Download PDF
          </button>
          <button
            onClick={handleDownloadTXT}
            className="rounded-lg bg-gray-700 px-4 py-2 text-sm font-medium text-white hover:bg-gray-600 transition-colors"
          >
            Download TXT
          </button>
        </div>
      </div>

      {/* Resume Content */}
      <div className="rounded-lg bg-gray-950 border border-gray-800 p-6 max-h-[500px] overflow-y-auto">
        <pre className="whitespace-pre-wrap font-sans text-sm text-gray-300 leading-relaxed">
          {content}
        </pre>
      </div>
    </div>
  );
}
