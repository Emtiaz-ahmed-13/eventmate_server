import PDFDocument from 'pdfkit';
import { generateQRCode } from './qr.utils';

export const generateTicketPDF = async (
  eventName: string,
  userName: string,
  dateTime: string,
  location: string,
  ticketId: string
): Promise<Buffer> => {
  return new Promise(async (resolve, reject) => {
    try {
      const doc = new PDFDocument({ size: 'A6', margin: 30 });
      const buffers: Buffer[] = [];
      doc.on('data', (chunk) => buffers.push(chunk));
      doc.on('end', () => {
        const pdfData = Buffer.concat(buffers);
        resolve(pdfData);
      });

      // Header
      doc.fillColor('#2563eb').fontSize(20).text('EventMate', { align: 'center' });
      doc.fillColor('#4b5563').fontSize(10).text('Discover and host unforgettable events', { align: 'center' });
      doc.moveDown();
      doc.strokeColor('#e5e7eb').lineWidth(1).moveTo(30, doc.y).lineTo(doc.page.width - 30, doc.y).stroke();
      doc.moveDown();

      // Event Info
      doc.fillColor('#1f2937').fontSize(14).font('Helvetica-Bold').text(eventName);
      doc.font('Helvetica'); // Reset to normal font
      doc.moveDown(0.5);
      doc.fillColor('#4b5563').fontSize(10).text(`Participant: ${userName}`);
      doc.text(`Date: ${new Date(dateTime).toLocaleString()}`);
      doc.text(`Location: ${location}`);
      doc.moveDown();

      // QR Code
      const qrDataURL = await generateQRCode(ticketId);
      doc.image(qrDataURL, {
        fit: [120, 120],
        align: 'center',
      });

      doc.moveDown();
      doc.fontSize(8).fillColor('#9ca3af').text(`Ticket ID: ${ticketId}`, { align: 'center' });

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
};
