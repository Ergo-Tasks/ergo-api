import { Router } from 'express';
import { restricted } from '../middleware/auth';
import { Tag } from '../typeorm/entities/Tag';

import { Task, taskRelations } from '../typeorm/entities/Task';
import { User, userRelations } from '../typeorm/entities/User';

const router = Router();

//Route creates a task, saves fields from request body and adds it to User's task by userId. 
router.post('/:userId', restricted, async (req, res) => {
  
  try {
    const { userId } = req.params;
    const user = await User.findOneOrFail({id: userId});
    const body: Task = req.body;
    const task = new Task();
    
    task.user = user;
    task.isRecursive = body.isRecursive;            
    task.taskDescription = body.taskDescription;
    task.taskName = body.taskName;
    task.tags = body.tags;
    
    if (task.isRecursive && body.recTaskDate) task.recTaskDate = body.recTaskDate;
    else if (!(task.isRecursive) && body.taskDate) task.taskDate = body.taskDate; 
    else res.status(400).json({message: 'Bad Request: Missing date field(s)'});

    await user.save();
    await task.save();

    res.status(201).send();
  } catch(err) {
    res.status(400).json({message: 'Bad Request'});
  }

});

//Route retrieves all user's tasks filtered by tags, taskDate, and/or taskFinished
router.get('/:userId', restricted, async (req, res) => {

  const { userId } = req.params;
  const user = await User.findOne({ where: {id: userId}, relations: userRelations });
  
  const filter: Record<string, any> = {};

  if (req.query && req.query.tagId) {
    filter.tags = await Tag.findOne({ where: {id: req.query.tagId} });
  }
  if (req.query && req.query.taskDate) filter.taskDate = req.query.taskDate;
  if (req.query && req.query.taskFinished) filter.taskFinished = req.query.taskFinished;

  if (user) {
    const filteredTasks:Task[] = await Task.find({ where: {...filter}, relations: taskRelations });
    res.status(200).json(filteredTasks);
  } else {
    res.status(404).json({ message: 'Not Found' });
  }

});

// router.get('/:userId', restricted, async (req, res) => {
//   // { recursiveTasks: [{ ... }], nonRecursiveTasks: [{...}] }
//   // /userId?tags=value+value+value&taskDate=value&taskFinished=value

//   //Trying to store query keys and values in an object only if they exist in the query.
//   //That way we can ...Object into the Task.find below.
  
//   interface LooseObject {
//     [key: string]: any
//   }

//   const filter: LooseObject = {};
  
//   if(req.query.tags) filter.tags = req.query.tags;   
//   if(req.query.taskDate) filter.taskDate = req.query.taskDate;
//   if(req.query.taskFinished) filter.taskFinished = req.query.taskFinished;

//   const { userId } = req.params;
//   const user = await User.findOne({
//     id: userId
//   });

//   if (user) {
//     const filteredTasks = await Task.find({ where: {...filter}, relations: taskRelations });
//     res.status(200).json(filteredTasks);
//   } else if (!(user)) {
//     res.status(404).json({message: 'User Not Found'}); 
//   } else {
//     res.status(400).json({message: 'Bad Request'});
//   }
  
  
  // console.log(tags);

  // if (user && (tags || taskDate || taskFinished))  {
  //   const filteredTasks = await Task.find({ relations: ['tags', 'taskDate', 'taskFinished'] });
  //   res.status(200).json({ filteredTasks });
  // } else if (user) {
  //   const allTasks = await Task.find({ relations: [] })
  //   res.status(200).json(allTasks)
  // } else if (!(user)) {
  //   res.status(404).json({message: 'User Not Found'});
  // } else {
  //   res.status(400).json({message: 'Bad Request'});
  // }

// });

//Route retrieves task by userId and taskId
router.get('/:userId/:taskId', restricted, async (req, res) => {

  const { userId, taskId } = req.params;
  const user = await User.findOne({ where: {id: userId }, relations: userRelations });
  const task = await Task.findOne({ id: taskId });

  if (user && task) {
    res.status(200).json({ task });
  } else {
    res.status(404).json({ message: 'Not Found' });
  }

});

export default router;