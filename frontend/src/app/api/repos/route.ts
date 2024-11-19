import { UserModel } from "@/models/userModel";
import { connection } from "@/database/connection";
import { getServerSession } from "next-auth";

export async function GET() {
    try {
        // const session = await getServerSession();
        // if (!session?.user?.email) {
        //     return Response.json({ error: "Not authenticated" }, { status: 401 });
        // }

        // await connection();

        // const user = await UserModel.findOne({ email: session.user.email });
        // if (!user?.accessToken) {
        //     return NextResponse.json({ error: "GitHub token not found" }, { status: 401 });
        // }
        const accessToken = "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";
        const reposResponse = await fetch('https://api.github.com/user/repos', {
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Accept': 'application/vnd.github.v3+json',
            },
        });
        const repos = await reposResponse.json();
        console.log(repos);

        const reposWithPRs = await Promise.all(
            repos.map(async (repo: any) => {
                const prsResponse = await fetch(
                    `https://api.github.com/repos/${repo.full_name}/pulls?state=all`,
                    {
                        headers: {
                            'Authorization': `Bearer ${accessToken}`,
                            'Accept': 'application/vnd.github.v3+json',
                        },
                    }
                );
                const prs = await prsResponse.json();
                return {
                    ...repo,
                    pull_requests: prs,
                };
            })
        );
        return Response.json({ repos: reposWithPRs });

    } catch (error) {
        return Response.error();
    }
}