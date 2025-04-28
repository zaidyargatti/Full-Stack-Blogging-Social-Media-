import Notification from "../models/notification.model.js";


const createNotification = async(req,res)=>{
    try {
        const {user,sender,type,post} = req.body
        if(!user || !sender || !type){
            res.status(400)
            .json({
                message:"Missing required fileds"
            })
        }

        const notification = await Notification.create({
                user,
                sender,
                type,
                post
        })

        return res.status(200)
        .json({
            message:"Notification Created Successfully",
            notification
        })
    } catch (error) {
        res.status(500)
        .json({
            message:error.message
        })
    }
}

const getNotifications = async(req,res)=>{
    try {
        const notifications = await Notification.find({
            user:req.user._id
        }).populate("sender","username").populate("post","title").sort({
            createdAt: -1
        })

     return res.status(200)
     .json({
        message:"Successfullt get it",
        notifications
     })
    } catch (error) {
        res.status(500)
        .json({
            message:error.message
        })
    }
}

const MarkRead = async(req,res)=>{
    try {
       const readed=  await Notification.updateMany({
            user:req.user._id,
            isread:false
         },{
            $set:{
                isread:true
            }
         }
         )

       return  res.status(200)
         .json({
            message:"Notifications Marked As Read",
            readed
         })
    } catch (error) {
        res.status(500)
        .json({
            message:error.message
        })
    }
}

export {
    createNotification,
  getNotifications,
  MarkRead
}