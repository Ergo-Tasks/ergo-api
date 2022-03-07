import { Router } from 'express';
import { createQueryBuilder, getConnection, getManager, getRepository, QueryBuilder } from 'typeorm';
import { restricted } from '../middleware/auth';
import { Tag } from '../typeorm/entities/Tag';

import { Task, taskRelations } from '../typeorm/entities/Task';
import { TaskFinished } from '../typeorm/entities/TaskFinished';
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
    const user = await User.findOne({id: userId});
    const body: Task = req.body;
    const task = new Task();

    if (user) {
    
      task.taskName = body.taskName;
      task.taskDescription = body.taskDescription;
      task.isRecursive = body.isRecursive;            
      task.tags = body.tags;
      task.user = user;
      
      if (task.isRecursive && body.recTaskDate) task.recTaskDate = body.recTaskDate;
      else if (!task.isRecursive && body.taskDate) task.taskDate = body.taskDate; 
      else res.status(400).json({ message: 'Bad request, missing date field(s)' });

      await user.save();
      await task.save();

      res.status(201).send();
    } else {
      res.status(404).json({ message: 'Not found, ensure userId is correct' })
    }
  } catch(err) {
    res.status(500).json({ message: 'Unexpected error' });
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

  // try {

    const { userId } = req.params;
    const user = await User.findOne({ where: {id: userId}, relations: userRelations });
    const query = req.query;

    if (user) {
      
      const f = {
        tags: query.tagId as string[],
        status: query.taskFinishedId,
        date: query.date
      }

      // const tasks = {}
      // if query.tags -> tasks filter by tags
      // tasks = { tags }
      // if query.taskFinished -> tasks filter by taskFinished

      // only works for searching by tags, otherwise fails
      const tasks:Task[] = await getRepository(Task)
        .createQueryBuilder('Task')
        .innerJoinAndSelect('Task.tags', 'Tag', 'Tag.id = :tagId', { tagId: f.tags })
        .getMany();
        
        res.status(200).json(tasks);
    } else {
      res.status(404).json({ message: 'Not found, ensure userId is correct' });
    }
  // } catch (err) {
  //   res.status(500).json({ message: 'Unexpected error' });
  // }

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
