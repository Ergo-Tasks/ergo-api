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

    tag.tagName = body.tagName;
    tag.tagColor = body.tagColor;
  
    await tag.save();
    res.status(201).send();

  } else {
    res.status(404).json({ message: 'Not Found' });
  }

});

export default router;
