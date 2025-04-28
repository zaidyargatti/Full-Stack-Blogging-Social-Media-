import { Router } from "express"
import protect from "../middleware/auth.middleware.js"
import { createNotification, getNotifications, MarkRead } from "../controllers/notification.controller.js"

const notify = Router()


notify.post("/",protect,createNotification)
notify.get("/",protect,getNotifications)
notify.put("/read",protect,MarkRead)

export default notify