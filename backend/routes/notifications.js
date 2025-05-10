import express, { json } from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import settings from "../models/settings.js";
import {
  getNotificationByUserUID,
  markAsRead,
} from "../controllers/notification.js";
const router = express.Router();

//middlewares
router.use(authMiddleware);

router.route("/get-notifications").get(async (req, res) => {
  try {
    let uid = req.user.uid;
    const response = await getNotificationByUserUID(uid);
    if (!response.success) {
      return res.status(response.status).json({ error: response.error });
    }
    return res.status(200).json({ data: response.data });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: `Internal Server Error: ${e}` });
  }
});

router.route("/mark-read/:id").patch(async (req, res) => {
  try {
    let uid = req.user.uid;
    let nid = req.params.id;
    const response = await markAsRead(uid, nid);
    if (!response.success) {
      return res.status(response.status).json({ error: response.error });
    }
    return res.status(200).json({ success: true, data: response.data });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: `Internal Server Error: ${e}` });
  }
});

export default router;
