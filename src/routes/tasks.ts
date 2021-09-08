import { Router } from 'express';
import jwt from "jsonwebtoken";
import { jwtPayload, restricted } from '../middleware/auth';

import { Task } from '../typeorm/entities/Task';
import { User } from '../typeorm/entities/User';

const router = Router();

router.post('/:userId', restricted, async (req, res) => {
  
  try {
    const { userId } = req.params;
    const user = await User.findOneOrFail(userId);

    const body: Task = req.body;
    const task = new Task();

    task.taskName = body.taskName;
    task.taskDescription = body.taskDescription;
    task.isRecursive = body.isRecursive;            //if recursive use recTaskDate, else use normal taskDate and taskTime
    task.user = user;                               //test that this updates User entity (adds this task to correct user task array)

    await task.save();

    res.status(201).send;
  } catch(err) {
    res.status(400).json({message: 'Bad request'});
  }
});

export default router;