import { Router } from 'express';
import { restricted } from '../middleware/auth';

import { User, userRelations } from '../typeorm/entities/User';
import { Task, taskRelations } from '../typeorm/entities/Task';
import { Tag } from '../typeorm/entities/Tag';

const router = Router();

/**
 * Tag creation route that creates new Tag from TypeORM entities, stores information in new Tag,
 * if there is a taskId query parameter find it and then push this tag into task.tags array, then save into db
 */
router.post('/:userId', restricted, async (req, res) => {

  const { userId } = req.params;
  const user = await User.findOne({ where: {id: userId }, relations: userRelations });
  const body: Tag = req.body;
  const tag = new Tag();

  if (user) {

    try {

      tag.tagName = body.tagName;
      tag.tagColor = body.tagColor;

      if (req.query && req.query.taskId) { 

          const task = await Task.findOne({ where: {id: req.query.taskId}, relations: taskRelations });
          
          if (task) {
            task.tags?.push(tag);
            await task.save();
          } else {
            res.status(404).json({ message: 'Task Not Found' });
          }

      }   

      user.tags?.push(tag);
      await user.save();

      await tag.save();
      res.status(201).send();

    } catch (err) {
      res.status(400).json({ message: 'Bad Request'});
    }

  } else {
    res.status(404).json({ message: 'Not Found' });
  }

});

//returns all user's tags
router.get('/:userId', restricted, async (req, res) => {

  const { userId } = req.params;
  const user = await User.findOne({ where: {id: userId}, relations: userRelations });
  
  if (user) { 
    res.status(200).json( user.tags );
  } else {
    res.status(404).json({ message: 'Not Found' });
  }

});

//Returns a tag found by tagId in params
router.get('/:userId/:tagId', restricted, async (req, res) => {

  const { userId, tagId } = req.params;
  const user = await User.findOne({ id: userId });
  const tag = await Tag.findOne({ id: tagId });
  
  if (user && tag) res.status(200).json({tag})
  else res.status(404).json({ message: 'Not Found' })

})

router.put('/:userId/:tagId', restricted, async (req, res) => {

  const { userId, tagId } = req.params;
  const user = await User.findOne({ id: userId });
  const tag = await Tag.findOne({ id: tagId });
  const body: Tag = req.body;
  
  if(user && tag) {
    Object.assign(tag, {
      ...body
    })
    
    await tag.save();
    res.status(200).json({tag});
  } else {
    res.status(404).json({message: 'Not Found' })
  }
  
});

router.delete('/:userId/:tagId', restricted, async (req, res) => {

  const { userId, tagId } = req.params;
  const user = await User.findOne({ id: userId });
  const tag = await Tag.findOne({ id: tagId });

  if (user && tag) {
    await tag.remove();
    res.status(201).send();
  } else {
    res.status(404).json({message: 'Not Found'})
  }
  
});

export default router;
