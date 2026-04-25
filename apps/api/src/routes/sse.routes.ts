// apps/api/src/routes/sse.routes.ts
import { Router } from 'express';
import { auth } from '../middleware/auth';
import { sseService } from '../services/sse.service';

const router = Router();

router.get('/stream', auth, (req: any, res) => {
  sseService.addClient(req.user._id.toString(), res);
  
  // Join active rooms
  if (req.user.activeRooms) {
    req.user.activeRooms.forEach((roomId: string) => {
      sseService.joinRoom(req.user._id.toString(), roomId);
    });
  }
});

router.post('/room/join', auth, (req: any, res) => {
  const { roomId } = req.body;
  sseService.joinRoom(req.user._id.toString(), roomId);
  res.json({ success: true });
});

router.post('/room/leave', auth, (req: any, res) => {
  const { roomId } = req.body;
  sseService.leaveRoom(req.user._id.toString(), roomId);
  res.json({ success: true });
});

export default router;