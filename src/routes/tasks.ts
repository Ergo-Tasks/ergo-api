import { Router } from 'express';
import { Connection, createQueryBuilder, getConnection, getManager, getRepository, QueryBuilder } from 'typeorm';
import { restricted } from '../middleware/auth';
import { Tag } from '../typeorm/entities/Tag';

import { Task, taskRelations } from '../typeorm/entities/Task';
import { TaskRecords } from '../typeorm/entities/TaskRecords';
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
      task.taskRecords = [];
      
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
      
      // const tasks:Task[] = await getRepository(Task)
      // .createQueryBuilder('Task')
      // .innerJoinAndSelect('Task.tags', 'Tag', 'Tag.id =:tagId', { tagId: query.tagId })
      // .getMany();

      //Properly joining and selecting relations, but doesn't recognize tagId from query.
      const tasks = await Task.find({
        join: {
          alias: 'task',
          leftJoinAndSelect: {
            TaskRecords: 'task.taskFinished',
            Tag: 'task.tags'
        }
        },
        where: {query}
      })
  
      res.status(200).json(tasks);
  
      //temporary fix just to get tests to stop being mald

      // const tasks:Task[] = user.tasks;
      // res.status(200).json(tasks);
        

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
