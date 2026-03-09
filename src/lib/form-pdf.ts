import QRCode from 'qrcode';
import { jsPDF } from 'jspdf';

export async function generateFormPDF(editUrl: string, formTitle: string, name: string) {
  const doc = new jsPDF({ unit: 'mm', format: 'a5' });
  const pageWidth = doc.internal.pageSize.getWidth();

  // Header bar
  doc.setFillColor(37, 99, 235); // primary blue
  doc.rect(0, 0, pageWidth, 28, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('GBI Baranangsiang Evening Church', pageWidth / 2, 12, { align: 'center' });
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(formTitle, pageWidth / 2, 20, { align: 'center' });

  // Name
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text(name, pageWidth / 2, 42, { align: 'center' });

  // Instruction
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 100, 100);
  doc.text('Scan QR code di bawah untuk mengedit formulir Anda:', pageWidth / 2, 52, { align: 'center' });

  // QR Code
  const qrDataUrl = await QRCode.toDataURL(editUrl, { width: 400, margin: 2 });
  const qrSize = 55;
  doc.addImage(qrDataUrl, 'PNG', (pageWidth - qrSize) / 2, 58, qrSize, qrSize);

  // Link text
  doc.setFontSize(7);
  doc.setTextColor(120, 120, 120);
  const maxLinkWidth = pageWidth - 20;
  const linkLines = doc.splitTextToSize(editUrl, maxLinkWidth);
  doc.text(linkLines, pageWidth / 2, 118, { align: 'center' });

  // Footer
  const footerY = doc.internal.pageSize.getHeight() - 10;
  doc.setFontSize(7);
  doc.setTextColor(160, 160, 160);
  doc.text('Simpan dokumen ini untuk mengakses formulir Anda kapan saja.', pageWidth / 2, footerY, { align: 'center' });

  // Download
  const safeName = name.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase();
  doc.save(`formulir-${safeName}.pdf`);
}
