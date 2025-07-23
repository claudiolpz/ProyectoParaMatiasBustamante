import { Router } from 'express';

const router = Router();

router.get('/', (req, res) => {
  res.send('Hello from the router!')
})

router.get('/nosotros', (req, res) => {
  res.send('Hello from the Nosotros!')
})

export default router;