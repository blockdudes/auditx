import { connection } from "@/database/connection";
import { UserModel } from "@/models/userModel";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

export async function GET() {
    try {
        await connection();
        const users = await UserModel.find({});
        
        // Get GitHub data for each user
        const usersWithGitHubData = await Promise.all(
            users.map(async (user) => {
                try {
                    // Fetch user's GitHub profile
                    const githubUserResponse = await fetch(`https://api.github.com/users/${user.username}`, {
                        headers: {
                            'Accept': 'application/vnd.github.v3+json',
                        }
                    });
                    const githubUser = await githubUserResponse.json();

                    // Fetch user's repositories
                    const reposResponse = await fetch(`https://api.github.com/users/${user.username}/repos`, {
                        headers: {
                            'Accept': 'application/vnd.github.v3+json',
                        }
                    });
                    const repos = await reposResponse.json();

                    // Map repositories to include only needed information
                    const processedRepos = repos.map((repo: any) => ({
                        id: repo.id,
                        name: repo.name,
                        full_name: repo.full_name,
                        description: repo.description,
                        html_url: repo.html_url,
                        stargazers_count: repo.stargazers_count,
                        forks_count: repo.forks_count,
                        language: repo.language,
                        created_at: repo.created_at,
                        updated_at: repo.updated_at,
                        topics: repo.topics,
                        visibility: repo.visibility
                    }));

                    // Return combined user data
                    return {
                        _id: user._id,
                        username: user.username,
                        email: user.email,
                        image: user.image,
                        githubProfile: {
                            login: githubUser.login,
                            name: githubUser.name,
                            bio: githubUser.bio,
                            public_repos: githubUser.public_repos,
                            followers: githubUser.followers,
                            following: githubUser.following,
                            created_at: githubUser.created_at,
                            updated_at: githubUser.updated_at,
                            location: githubUser.location,
                            company: githubUser.company,
                            blog: githubUser.blog,
                            twitter_username: githubUser.twitter_username,
                        },
                        repositories: processedRepos
                    };
                } catch (error) {
                    console.error(`Error fetching GitHub data for user ${user.username}:`, error);
                    // Return basic user data if GitHub fetch fails
                    return {
                        _id: user._id,
                        username: user.username,
                        email: user.email,
                        image: user.image,
                        error: "Failed to fetch GitHub data"
                    };
                }
            })
        );

        return NextResponse.json({
            success: true,
            users: usersWithGitHubData
        }, { status: 200 });

    } catch (error) {
        console.error("Error fetching users:", error);
        return NextResponse.json({
            success: false,
            error: "Failed to fetch users"
        }, { status: 500 });
    }
}