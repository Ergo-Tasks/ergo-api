import { Router } from 'express';
import { restricted } from '../middleware/auth';
import { Tag } from '../typeorm/entities/Tag';

import { Task, taskRelations } from '../typeorm/entities/Task';
import { User, userRelations } from '../typeorm/entities/User';


const router = Router();

/**
 * Route creates a new task and stores values from req body and saves to db.
 * 
 * @param restricted - middleware to verify a user's authenticity, route deals with sensitive data.
 * @param request - retrieval and passing of data to route from client. Contains userId in params to find User.
 * @param response - responds with status code based on functionality of route.
 */
router.post('/:userId', restricted, async (req, res) => {
  
  try {

    const { userId } = req.params;
    const user = await User.findOneOrFail({id: userId});
    const body: Task = req.body;
    const task = new Task();
    
    task.taskName = body.taskName;
    task.taskDescription = body.taskDescription;
    task.isRecursive = body.isRecursive;            
    task.tags = body.tags;
    task.user = user;
    
    if (task.isRecursive && body.recTaskDate) task.recTaskDate = body.recTaskDate;
    else if (!task.isRecursive && body.taskDate) task.taskDate = body.taskDate; 
    else res.status(400).json({message: 'Bad Request: Missing date field(s)'});

    await user.save();
    await task.save();

    res.status(201).send();
  } catch(err) {
    res.status(400).json({message: 'Bad Request'});
  }

});


/**
 * Route retrieves all user's tasks if no filtration is given. Otherwise filters by tag, date, or status.
 * 
 * @param restricted - middleware to verify a user's authenticity, route deals with sensitive data.
 * @param request - retrieval and passing of data to route from client.
 * @param response - responds with status code based on functionality of route.
 */
router.get('/:userId', restricted, async (req, res) => {

  const { userId } = req.params;
  //Should we change to OrFail? That way we can just get rid of if(user) throughout routes.
  const user = await User.findOne({ where: {id: userId}, relations: userRelations });
  const query = req.query;
  
  const filter: Record<string, any> = {};

  if (query) {
    if (query.tagId) filter.tags = await Tag.findOne({ where: {id: query.tagId} });
    if (query.taskDate) filter.taskDate = query.taskDate;
    if (query.taskFinished) filter.taskFinished = query.taskFinished;
  }

  if (user) {
    const filteredTasks: Task[] = await Task.find({ where: filter, relations: taskRelations });
    res.status(200).json(filteredTasks);
  } else {
    res.status(404).json({ message: 'Not Found' });
  }

});

/**
 * Route finds a task by taskId passed in, then returns it.
 * 
 * @param restricted - middleware to verify a user's authenticity, route deals with sensitive data.
 * @param request - contains taskId retrieved from client.
 * @param response - responds with status code based on functionality of route.
 */
router.get('/:taskId', restricted, async (req, res) => {

  const { taskId } = req.params;
  const task = await Task.findOne({ id: taskId });

  if (task) {
    res.status(200).json({ task });
  } else {
    res.status(404).json({ message: 'Not Found' });
  }

});

export default router;
