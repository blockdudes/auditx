import NextAuth from "next-auth/next";
import GithubProvider from "next-auth/providers/github";
import { UserModel } from "@/models/userModel";
import { connection } from "@/database/connection";

console.log("eofnwefonweofnwe: ", process.env.NEXT_PUBLIC_GITHUB_ID)
const handler = NextAuth({
    providers: [
        GithubProvider({
            clientId: process.env.NEXT_PUBLIC_GITHUB_ID!,
            clientSecret: process.env.NEXT_PUBLIC_GITHUB_SECRET!,
            authorization: {
                params: {
                    scope: 'read:user repo user:email'
                }
            }
        })
    ],
    callbacks: {
        async signIn({ user, account }) {
            console.log(user, account);
            if (account?.provider === "github") {
                await connection();
                const userFind = await UserModel.findOne({ username: user.name });
                if (!userFind) {
                    await UserModel.create({
                        username: user.name,
                        image: user.image,
                        email: user.email
                    });
                }

            }
            return true;
        }
    }
});

export const GET = handler;
export const POST = handler;
export const PUT = handler;
export const PATCH = handler;
export const DELETE = handler;