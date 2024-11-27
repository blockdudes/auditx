import NextAuth from "next-auth/next";
import GithubProvider from "next-auth/providers/github";
import { UserModel } from "@/models/userModel";
import { connection } from "@/database/connection";

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
    secret: process.env.NEXTAUTH_SECRET,
    callbacks: {
        async signIn({ user, account, profile }: any) {
            if (account?.provider === "github") {
                await connection();
                const userFind = await UserModel.findOne({ username: profile.login });
                
                if (!userFind) {
                    console.log("user creating", profile.login, user.email, user.image);
                    await UserModel.create({
                        username: profile.login, // Using GitHub login (username) instead of name
                        image: user.image,
                        email: user.email
                    });
                    console.log("user created");
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