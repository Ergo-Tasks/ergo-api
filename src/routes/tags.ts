import { Router } from 'express';
import { restricted } from '../middleware/auth';

import { User, userRelations } from '../typeorm/entities/User';
import { Tag } from '../typeorm/entities/Tag';

const router = Router();

/**
 * Route creates a new tag and assigns it to a user
 * 
 * @param restricted - middleware to verify a user's authenticity, route deals with sensitive data.
 * @param request - handles data sending and retrieval. Contains userId in param to find a user to assign tag to.
 * @param response - responds 201 if successful, 400 w/ a message if unsuccessful.
 */
router.post('/:userId', restricted, async (req, res) => {

  try {

    const { userId } = req.params;
    const user = await User.findOneOrFail({ where: {id: userId }, relations: userRelations });
    const body: Tag = req.body;
    const tag = new Tag();

    tag.tagName = body.tagName;
    tag.tagColor = body.tagColor;
    tag.user = user;

    await tag.save();
    res.status(201).send();

    } catch (err) {
      res.status(400).json({ message: 'Bad Request'});
  }

});

/**
 * Route retrieves all a user's tags
 * 
 * @param restricted - middleware to verify a user's authenticity, route deals with sensitive data.
 * @param request - handles data sending and retrieval. Contains userId in param to find user.
 * @param response - responds 200 with user's tags if successful, 400 w/ error msg if unsuccessful.
 */
router.get('/:userId', restricted, async (req, res) => {

  const { userId } = req.params;
  const user = await User.findOne({ where: {id: userId}, relations: userRelations });
  
  if (user) { 
    res.status(200).json(user.tags);
  } else {
    res.status(404).json({ message: 'Not Found' });
  }

});

/**
 * Route returns a tag found by Id.
 * 
 * @param restricted - middleware to verify a user's authenticity, route deals with sensitive data.
 * @param request - handles data sending and retrieval. Contains userId and tagId in param to find user, then tag.
 * @param response - responds 200 with user's tag if successful, 404 if not found.
 */
router.get('/:userId/:tagId', restricted, async (req, res) => {

  try {
    
    const { userId, tagId } = req.params;
    const user = await User.findOneOrFail({ id: userId });
    const tag = await Tag.findOneOrFail({ id: tagId, user: user })
    
    res.status(200).json({tag})
  } catch(err) {
    res.status(404).json({ message: 'Not Found' })
  }
})

/**
 * Route updates a tag by replacing the fields retrieved from the request.
 * 
 * @param restricted - middleware to verify a user's authenticity, route deals with sensitive data.
 * @param request - handles data sending and retrieval. Contains userId and tagId in param to find user, then tag.
 * @param response - responds 200 with user's updated tag if successful, 404 if not found.
 */
router.put('/:userId/:tagId', restricted, async (req, res) => {

  try {

    const { userId, tagId } = req.params;
    const user = await User.findOneOrFail({ id: userId });
    const tag = await Tag.findOneOrFail({ id: tagId, user});
    const body: Tag = req.body;
    
    Object.assign(tag, {
      ...body
    })
    
    await tag.save();
    res.status(200).json({tag});

  } catch(err) {
    res.status(404).json({message: 'Not Found' })
  }
  
});

router.delete('/:userId/:tagId', restricted, async (req, res) => {

  const { userId, tagId } = req.params;
  const user = await User.findOne({ id: userId });
  const tag = await Tag.findOne({ id: tagId, user });

  if (user && tag) {
    await tag.remove();
    res.status(201).send();
  } else {
    res.status(404).json({message: 'Not Found'})
  }
  
});

export default router;
