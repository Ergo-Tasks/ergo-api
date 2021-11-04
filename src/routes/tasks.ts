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
  // { recursiveTasks: [{ ... }], nonRecursiveTasks: [{...}] }
  //tags=value+value+value&taskDate=value&taskFinished=value

  const { tags, taskDate, taskFinished } = req.query;
  const { userId } = req.params;
  const user = await User.findOne({
    id: userId
  });

  console.log(tags);
  
  if (user && (tags || taskDate || taskFinished))  {
    const filteredTasks = await Task.find({ relations: ['tags', 'taskDate', 'taskFinished'] });
    res.status(200).json({ filteredTasks });
  } else if (user) {
    const allTasks = await Task.find({ relations: [] })
    res.status(200).json(allTasks)
  } else {
    res.status(400).json({message: 'Bad Request'});
  }

});

router.get('/:userId/:taskId', restricted, async (req, res) => {

  const { userId, taskId } = req.params;
  const user = await User.findOne({ id: userId });
  const task = await Task.findOne({ id: taskId });

  if (user && task) {
    res.status(200).json({ task });
  } else {
    res.status(404).json({ message: 'Not Found' });
  }

});

export default router;