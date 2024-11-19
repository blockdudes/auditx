import { IUser } from "@/types/types";
import mongoose, { Schema } from "mongoose";

const userSchema: Schema<IUser> = new Schema({
    username: {
        type: String,
        unique: true,
        required: true
    },
    image: {
        type: String,
        required: true
    },
    email: {
        type: String,
        unique: true,
        required: true
    },
    address: {
        type: String,
        unique: true,
    }
});

export const UserModel =
    (mongoose.models.soon_user as mongoose.Model<IUser>) ||
    mongoose.model<IUser>("soon_user", userSchema);