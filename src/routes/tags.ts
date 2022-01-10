import { Router } from 'express';
import { restricted } from '../middleware/auth';

import { User } from '../typeorm/entities/User';
import { Task } from '../typeorm/entities/Task';
import { Tag } from '../typeorm/entities/Tag';

const router = Router();

router.post('/:userId', restricted, async (req, res) => {

  const { userId } = req.params;
  const user = await User.findOne({ id: userId });
  const body: Tag = req.body;
  const tag = new Tag();

  if (user) {

    if (body.tagName && body.tagColor) {
      tag.tagName = body.tagName;
      tag.tagColor = body.tagColor;
    } else {
      res.status(400).json({ message: 'Missing Required Field'})
    }
  
    await tag.save();
    res.status(201).send();

  } else {
    res.status(404).json({ message: 'Not Found' });
  }

});

//returns all user's tags
router.get('/:userId', restricted, async (req, res) => {

  //i don't think there is a way to do this without relating user and tag by one to many

});

//Returns a tag found by tagId in params
router.get('/:tagId', restricted, async (req, res) => {

  const { tagId } = req.params;
  const tag = await Tag.findOne({ id: tagId });
  
  if (tag) res.status(200).json({tag})
  else res.status(404).json({message: 'Not Found'})

})

router.put('/:tagId', restricted, async (req, res) => {

  try {

    const { tagId } = req.params;
    const tag = await User.findOne({ id: tagId });
    const body: Tag = req.body;
    
    if(tag) {
      Object.assign(tag, {
        ...body
      })
      
      await tag.save();
      res.status(200).json({tag});
    }

  } catch(err) {
    res.status(400).json({message: 'Bad Request', error: err})
  }
  
})

router.delete('/:tagId', restricted, async (req, res) => {

  const { tagId } = req.params;
  const tag = await User.findOne({ id: tagId });

  if (tag) {
    await tag.remove();
    res.status(201).send();
  } else {
    res.status(404).json({message: 'Not Found'})
  }
  
})

export default router;
