
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import saveAs from 'file-saver'; // Changed from "import { saveAs } from 'file-saver';"

export const generatePdf = async (element: HTMLElement, filename: string = 'resume.pdf'): Promise<void> => {
  try {
    // Temporarily increase scale for better quality, then revert
    const originalTransform = element.style.transform;
    // element.style.transform = 'scale(1.5)'; // Adjust scale as needed
    // await new Promise(resolve => setTimeout(resolve, 100)); // allow time for re-render if scaling

    const canvas = await html2canvas(element, {
      scale: 2, // Increase scale for better resolution
      useCORS: true, // If you have external images
      logging: false,
      windowWidth: element.scrollWidth,
      windowHeight: element.scrollHeight,
    });
    
    // element.style.transform = originalTransform; // Revert scale

    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'pt', // points
      format: 'a4', // A4 dimensions: 595.28 x 841.89 pt
    });

    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    
    const imgProps = pdf.getImageProperties(imgData);
    const imgWidth = imgProps.width;
    const imgHeight = imgProps.height;

    // Calculate aspect ratio to fit A4
    const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
    const displayWidth = imgWidth * ratio;
    const displayHeight = imgHeight * ratio;

    // Center the image on the PDF page
    const x = (pdfWidth - displayWidth) / 2;
    const y = (pdfHeight - displayHeight) / 2;

    pdf.addImage(imgData, 'PNG', x, y, displayWidth, displayHeight);
    pdf.save(filename);

  } catch (error) {
    console.error("Error generating PDF:", error);
    alert("Failed to generate PDF. Check console for details.");
  }
};


export const downloadHtml = (htmlContent: string, filename: string = 'resume.html'): void => {
  const blob = new Blob([`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${filename.replace('.html', '')}</title>
      <script src="https://cdn.tailwindcss.com"></script>
      <style>
        /* Minimal styles to ensure Tailwind works in the exported HTML */
        body { margin: 0; font-family: sans-serif; }
        /* Add any critical styles from index.html if Tailwind config is complex */
      </style>
    </head>
    <body>
      ${htmlContent}
    </body>
    </html>
  `], { type: 'text/html;charset=utf-8' });
  saveAs(blob, filename);
};
