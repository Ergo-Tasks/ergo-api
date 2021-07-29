import { Router } from "express";
import { useContainer } from "typeorm";

const router = Router();

router.get('/', (req, res) => {
  // Should return users
  res.send("Should return user");
});

//creating post endpoint to create user
router.post('/api/users', (req, res) => {
  /**
   * //creating new user
   * const user = new User();
   * 
   * //filling data for user from typeORM (will use res when ready)
   * user.id = '';
   * user.firstName = '';
   * user.lastName = '';
   * user.dateJoined = '';
   */
});

export default router;