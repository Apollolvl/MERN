import { Router } from 'express';
import path from 'path';
import apiRoutes from './api';

const router = Router();

router.use('/api', apiRoutes);

// serve up react front-end in production
router.use((req, res) => {
  res.sendFile(path.join(__dirname, '../../client/build/index.html'));
});

export default router;
