import { Router } from 'express';
import { restricted } from '../middleware/auth';

import { Task } from '../typeorm/entities/Task';
import { TaskFinished } from '../typeorm/entities/TaskFinished';
import { User } from '../typeorm/entities/User';

const router = Router();

router.post('/:userId', restricted, async (req, res) => {
  
  try {
    const { userId } = req.params;
    const user = await User.findOneOrFail({id: userId});
    const body: Task = req.body;
    const task = new Task();
 
    task.taskName = body.taskName;
    task.taskDescription = body.taskDescription;
    task.isRecursive = body.isRecursive;            
    task.user = user;
    
    if (task.isRecursive && body.recTaskDate) {
      task.recTaskDate = body.recTaskDate;
    } else if (!(task.isRecursive) && body.taskDate) {
      task.taskDate = body.taskDate;
    } else {
      res.status(400).json({message: 'Bad Request: Missing date field(s)'});
    }

    await task.save();

    res.status(201).send();
  } catch(err) {
    res.status(400).json({message: 'Bad Request'});
  }

});

router.get('/:userId', restricted, async (req, res) => {

  try {

    const { userId } = req.params;
    const user = User.findOneOrFail({id: userId});

  } catch (err) {

  }

});

export default router;