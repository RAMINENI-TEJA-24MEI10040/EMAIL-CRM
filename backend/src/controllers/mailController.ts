import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import Mail from '../models/Mail';
import path from 'path';

// Note: Ensure Nodemailer logic is implemented in services later

export const sendMail = async (req: Request, res: Response): Promise<void> => {
  try {
    const { to, subject, body } = req.body;
    const trackingId = uuidv4();

    // 1. Save mail entry with trackingId
    const newMail = new Mail({
      to,
      subject,
      body,
      trackingId,
    });
    await newMail.save();

    // 2. Mock sending mail via Nodemailer
    // In actual implementation, we would append a tracking pixel to the body:
    // const trackingPixelUrl = `${process.env.BACKEND_URL}/api/mails/track/${trackingId}`;
    // const bodyWithTracking = `${body}<img src="${trackingPixelUrl}" width="1" height="1" style="display:none;" />`;
    // await sendEmailService(to, subject, bodyWithTracking);

    res.status(201).json({ message: 'Mail sent successfully (Mocked)', data: newMail });
  } catch (error) {
    console.error('Error sending mail:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

export const trackMail = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const mail = await Mail.findOne({ trackingId: id });

    if (mail && mail.status !== 'opened') {
      // Mark as opened
      mail.status = 'opened';
      mail.openedAt = new Date();
      mail.ip = req.headers['x-forwarded-for']?.toString() || req.socket.remoteAddress;
      mail.userAgent = req.headers['user-agent'];
      await mail.save();

      // Trigger realtime notification via Socket.IO
      const io = req.app.get('io');
      if (io) {
        io.emit('mail_opened', {
          message: `Mail to ${mail.to} was just opened!`,
          data: mail
        });
      }
    }

    // Serve a transparent 1x1 pixel gif
    const pixelPath = path.join(__dirname, '../../public/pixel.gif');
    res.sendFile(pixelPath, (err) => {
        if (err) {
            // If the pixel file doesn't exist yet, we can send a 204 No Content
            // or we could send a base64 encoded pixel directly in code to avoid needing a file.
            const buf = Buffer.from('R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7', 'base64');
            res.writeHead(200, {
              'Content-Type': 'image/gif',
              'Content-Length': buf.length
            });
            res.end(buf); 
        }
    });

  } catch (error) {
    console.error('Error tracking mail:', error);
    res.status(500).send('Error');
  }
};
