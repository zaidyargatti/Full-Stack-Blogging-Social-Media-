import mongoose, { mongo } from "mongoose"
import dotenv from "dotenv"
dotenv.config()
const connect_DB = async ()=>{
    try {
       const Instance_Connection= await mongoose.connect(`${process.env.DB_URL}`)
        console.log(`MONGO DB CONNECTED || ${Instance_Connection.connection.host}`)
        
    } catch (error) {
        console.log("DB CONNECTION ERROR!!",error)
        process.exit(1)
    }
}
export default connect_DB