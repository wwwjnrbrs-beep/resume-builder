import html2pdf from 'html2pdf.js';

export async function exportToPdf(elementId, resumeData) {
  const element = document.getElementById(elementId);
  if (!element) {
    throw new Error('Resume element not found');
  }

  const cleanName = (resumeData?.personalInfo?.fullName || 'Resume')
    .replace(/\s+/g, '_')
    .replace(/[^a-zA-Z0-9_]/g, '');

  const opt = {
    margin: 0,
    filename: `${cleanName}_Resume.pdf`,
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: {
      scale: 2,
      useCORS: true,
      logging: false,
      letterRendering: true,
      scrollY: 0,
      windowWidth: element.scrollWidth,
    },
    jsPDF: {
      unit: 'mm',
      format: 'a4',
      orientation: 'portrait',
      compress: true,
    },
    pagebreak: {
      mode: ['avoid-all', 'css', 'legacy'],
    },
  };

  try {
    await html2pdf().set(opt).from(element).save();
    return true;
  } catch (error) {
    console.error('PDF export error:', error);
    // Fallback to window print
    triggerPrint(resumeData);
    return false;
  }
}

export function triggerPrint(resumeData = null) {
  const originalTitle = document.title;
  const cleanName = (resumeData?.personalInfo?.fullName || '')
    .replace(/\s+/g, '_')
    .replace(/[^a-zA-Z0-9_]/g, '');

  // Set clean title during print
  document.title = cleanName ? `${cleanName}_Resume` : ' ';
  window.print();
  setTimeout(() => {
    document.title = originalTitle;
  }, 1500);
}
