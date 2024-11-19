import mongoose from "mongoose";

type CONNECTION_OBJECT = {
    is_connected?: number;
};
const connectionObj: CONNECTION_OBJECT = {};
export const connection = async (): Promise<void> => {
    try {
        if (connectionObj.is_connected) {
            console.log("DATABASE CONNECTED!");
            return;
        } else {
            const database = await mongoose.connect(
                process.env.NEXT_PUBLIC_MONGO_DB_CONNECTION_URL || "",
                {}
            );
            connectionObj.is_connected = database.connections[0].readyState;
            console.log("DATABASE CONNECTED 2!");
        }
    } catch (error) {
        console.log(error);
        process.exit(1);
    }
};