import { connect } from "http2";
import mongoose from "mongoose";
let cached= global.mongoose||{connection: null, promise: null};
export default async function dbConnect() {
    if(cached.connection)
        return cached.connection;
        if(!cached.promised){
            cached.promise = mongoose.connect(process.env.MONGDB_URI).then((mongoose) =>mongoose);
        }
        try{
            cached.connection = await cached.promise;
        }
        catch(e){
            console.error("Failed to connect to MongoDB", e);
        }
        return cached.connection;
        }
    