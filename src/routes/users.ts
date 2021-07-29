import { Router } from "express";

const router = Router();

router.get('/', (req, res) => {
  // Should return users
  res.send("Should return user")
});

export default router