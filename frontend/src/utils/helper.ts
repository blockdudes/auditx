export function getRepoId(repoURL: string): string {
    const cleanUrl = repoURL.replace(/\.git$/, '').replace(/\/$/, '');
    const parts = cleanUrl.split('/');
    const username = parts[parts.length - 2];
    const repoName = parts[parts.length - 1];
    return username + "." + repoName
}