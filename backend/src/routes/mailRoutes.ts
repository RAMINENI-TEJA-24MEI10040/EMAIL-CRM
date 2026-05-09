import { Router } from 'express';
import { sendMail, trackMail } from '../controllers/mailController';

const router = Router();

router.post('/send', sendMail);
router.get('/track/:id', trackMail);

export default router;
