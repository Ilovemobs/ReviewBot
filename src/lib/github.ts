import { App } from "@octokit/app";
import { Octokit } from "@octokit/rest";

let appInstance: App<{ Octokit: typeof Octokit }> | null = null;

function getApp() {
  if (!appInstance) {
    appInstance = new App({
      appId: process.env.GITHUB_APP_ID!,
      privateKey: process.env.GITHUB_APP_PRIVATE_KEY!.replace(/\\n/g, "\n"),
      Octokit,
      webhooks: { secret: process.env.GITHUB_WEBHOOK_SECRET! },
    });
  }
  return appInstance;
}

export async function getInstallationOctokit(installationId: number) {
  const app = getApp();
  return await app.getInstallationOctokit(installationId);
}

export async function getPRDiff(
  owner: string,
  repo: string,
  prNumber: number,
  installationId: number
): Promise<string> {
  const octokit = await getInstallationOctokit(installationId);
  const { data } = await octokit.rest.pulls.get({
    owner,
    repo,
    pull_number: prNumber,
    mediaType: { format: "diff" },
  });
  return data as unknown as string;
}

export async function getPRDetails(
  owner: string,
  repo: string,
  prNumber: number,
  installationId: number
): Promise<{ title: string; url: string; headSha: string }> {
  const octokit = await getInstallationOctokit(installationId);
  const { data } = await octokit.rest.pulls.get({
    owner,
    repo,
    pull_number: prNumber,
  });
  return {
    title: data.title,
    url: data.html_url,
    headSha: data.head.sha,
  };
}

export async function postReviewComment(
  owner: string,
  repo: string,
  prNumber: number,
  installationId: number,
  body: string
) {
  const octokit = await getInstallationOctokit(installationId);
  await octokit.rest.pulls.createReview({
    owner,
    repo,
    pull_number: prNumber,
    body,
    event: "COMMENT",
  });
}

export async function postInlineComment(
  owner: string,
  repo: string,
  prNumber: number,
  installationId: number,
  commitId: string,
  body: string,
  path: string,
  line: number
) {
  const octokit = await getInstallationOctokit(installationId);
  await octokit.rest.pulls.createReviewComment({
    owner,
    repo,
    pull_number: prNumber,
    commit_id: commitId,
    body,
    path,
    line,
  });
}

export function getUserOctokit(token: string): Octokit {
  return new Octokit({ auth: token });
}

export async function verifyWebhook(payload: string, signature: string): Promise<boolean> {
  const app = getApp();
  return await app.webhooks.verify(payload, signature);
}
