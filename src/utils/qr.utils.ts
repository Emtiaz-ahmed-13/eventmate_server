import QRCode from 'qrcode';

/**
 * Generates a QR code as a Base64 Data URL
 * @param text The string to encode in the QR code
 * @returns Base64 string of the QR code image
 */
export const generateQRCode = async (text: string): Promise<string> => {
  try {
    const qrCodeDataURL = await QRCode.toDataURL(text);
    return qrCodeDataURL;
  } catch (err) {
    console.error('Error generating QR code', err);
    throw new Error('Failed to generate QR code');
  }
};
