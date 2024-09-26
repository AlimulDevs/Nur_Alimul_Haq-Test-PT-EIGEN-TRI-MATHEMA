import express from 'express';
import getAllMember from '../controllers/members/getAll.js';
import getMemberById from '../controllers/members/getById.js';
import createMember from '../controllers/members/create.js';
import updateMember from '../controllers/members/update.js';
import deleteMember from '../controllers/members/delete.js';
const memberRouter = express.Router();


memberRouter.get("/", getAllMember)
memberRouter.get("/:id", getMemberById)
memberRouter.post("/", createMember)
memberRouter.put("/:id", updateMember)
memberRouter.delete("/:id", deleteMember)

export default memberRouter