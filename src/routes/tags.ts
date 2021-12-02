import { Router } from 'express';
import { restricted } from '../middleware/auth';
import { User } from '../typeorm/entities/User';
import { Tag } from '../typeorm/entities/Tag';


const router = Router();

router.post('/:userId', restricted, async (req, res) => {

  try {
    const { userId } = req.params;
    const user = await User.findOneOrFail({id: userId});
    const body: Tag = req.body;
    const tag = new Tag();

    //How do we check if body.tagName exists already?
    tag.tagName = body.tagName;
    tag.tagColor = body.tagColor;

    await tag.save();

    res.status(201).send();
  } catch (err) {
    res.status(400).json({message: 'Bad Request'})
  }
  
});
