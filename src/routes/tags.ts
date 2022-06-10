import { Router } from 'express';

import { restricted } from '../middleware/auth';
import { User, userRelations } from '../typeorm/entities/User';
import { Tag } from '../typeorm/entities/Tag';

const router = Router();

/**
 * Route creates a new tag and assigns it to a user.
 * 
 * @param restricted - middleware to verify a user's authenticity, route deals with sensitive data.
 * @param request - handles data sending and retrieval. Contains userId in param to find a user to assign tag to.
 * @param response - responds 201 if successful, 400 if missing required field(s), 404 is user not found in db, 
 *                   or 500 if unexpected issue.
 */
router.post('/:userId', restricted, async (req, res) => {
  
  try {  
    const { userId } = req.params;
    const user = await User.findOne({ where: {id: userId }, relations: userRelations });
    
    if (user) {
      const body: Tag = req.body;
      const tag = new Tag();
  
      if (body.tagName && body.tagColor) {
        tag.tagName = body.tagName;
        tag.tagColor = body.tagColor;
        tag.user = user;

        await tag.save();
        res.status(201).send();
      } else {
        res.status(400).json({ message: 'Bad request, missing required field(s)' });
      }
      
    } else {
      res.status(404).json({ message: 'Not found, ensure userId is correct' });
    }
  } catch (err) {
    res.status(500).json({ message: 'Unexpected error' });
  }

});

/**
 * Route retrieves all a user's tags.
 * 
 * @param restricted - middleware to verify a user's authenticity, route deals with sensitive data.
 * @param request - handles data sending and retrieval. Contains userId in param to find user.
 * @param response - responds 200 with user's tags if successful, 404 if user not found in db, or 500 if unexpected issue.
 */
router.get('/:userId', restricted, async (req, res) => {

  try { 
    const { userId } = req.params;
    const user = await User.findOne({ where: {id: userId}, relations: userRelations });

    if (user) {
      res.status(200).json(user.tags);
    } else {
      res.status(404).json({ message: 'Not found, ensure userId is correct' });
    }
  } catch (err) {
    res.status(500).json({ message: 'Unexpected error' });
  }
  
});

/**
 * Route returns a tag found by Id.
 * 
 * @param restricted - middleware to verify a user's authenticity, route deals with sensitive data.
 * @param request - handles data sending and retrieval. Contains userId and tagId in param to find user, then tag.
 * @param response - responds 200 with user's tag if successful, 404 if tag not found in db, or 500 if unexpected issue.
 */
router.get('/:userId/:tagId', restricted, async (req, res) => {

  try {
    const { userId, tagId } = req.params;
    const user = await User.findOne({ id: userId });
    const tag = await Tag.findOne({ id: tagId, user })

    if(tag) {
      res.status(200).json({tag})
    } else {
      res.status(404).json({ message: 'Not found, ensure user and tag Ids are correct' });
    }
  } catch(err) {
    res.status(500).json({ message: 'Unexpected error' });
  }
})

/**
 * Route updates a tag by replacing the fields retrieved from the request.
 * 
 * @param restricted - middleware to verify a user's authenticity, route deals with sensitive data.
 * @param request - handles data sending and retrieval. Contains userId and tagId in param to find user, then tag.
 * @param response - responds 200 with user's updated tag if successful, 404 if tag not found in db, or 500 if unexpected issue.
 */
router.put('/:userId/:tagId', restricted, async (req, res) => {

  try {
    const { userId, tagId } = req.params;
    const user = await User.findOne({ id: userId });
    const tag = await Tag.findOne({ id: tagId, user});
    const body: Tag = req.body;
    
    if (tag) {
      Object.assign(tag, {
        ...body
      });
      
      await tag.save();
      res.status(200).json({tag});
    } else
      res.status(404).json({message: 'Not found, ensure user and tag Ids are correct' })
  } catch(err) {
    res.status(500).json({message: 'Unexpected error' })
  }
  
});

/**
 * Route deletes tag from db.
 * 
 * @param restricted - middleware to verify a user's authenticity, route deals with sensitive data.
 * @param request - retrieval and passing of data to route from client. Contains userId and tagId in params to find User and Tag.
 * @param response - responds 200 if sucessful, 404 if tag not found, or 500 if unexpected issue.
 */
router.delete('/:userId/:tagId', restricted, async (req, res) => {

  try {
    const { userId, tagId } = req.params;
    const user = await User.findOne({ id: userId });
    const tag = await Tag.findOne({ id: tagId, user });

    if (tag) {
      await tag.remove();
      res.status(200).send();  
    } else {
      res.status(404).json({message: 'Not found, ensure user and tag Ids are correct'});
    }
  } catch (err) {
    res.status(500).json({message: 'Unexpected error'});
  }
  
});

export default router;
