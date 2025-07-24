import { Router } from 'express';

const router = Router();

/** AUTENTICACION */
router.post('/auth/register', (req, res) => {
  console.log(req.body);
});

export default router;