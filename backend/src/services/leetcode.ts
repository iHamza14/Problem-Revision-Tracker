import {
  LeetCodeContestRanking,
  LeetCodeContestRankingData,
  LeetCodeGraphQlResponse,
  LeetCodeRecentAcSubmissionsData,
  LeetCodeRecentAcSubmission,
  LeetCodeUserProfile,
  LeetCodeUserProfileData,
} from "../types/leetcode";

const LEETCODE_GRAPHQL_URL = "https://leetcode.com/graphql";

async function leetcodeGraphQl<T>(
  query: string,
  variables: Record<string, unknown>,
  operationName: string
): Promise<T> {
  const res = await fetch(LEETCODE_GRAPHQL_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Referer: "https://leetcode.com",
      "User-Agent": "Mozilla/5.0",
    },
    body: JSON.stringify({ query, variables, operationName }),
  });

  if (!res.ok) {
    throw new Error("Failed to reach LeetCode API");
  }

  const body = (await res.json()) as LeetCodeGraphQlResponse<T>;

  if (body.errors?.length) {
    throw new Error(body.errors[0].message || "LeetCode API error");
  }

  if (!body.data) {
    throw new Error("Invalid LeetCode API response");
  }

  return body.data;
}

export async function getLeetCodeUserInfo(
  username: string
): Promise<LeetCodeUserProfile> {
  const query = `
    query userProfile($username: String!) {
      matchedUser(username: $username) {
        username
      }
    }
  `;

  const data = await leetcodeGraphQl<LeetCodeUserProfileData>(
    query,
    { username },
    "userProfile"
  );

  if (!data.matchedUser) {
    throw new Error("LeetCode username does not exist");
  }

  return data.matchedUser;
}

export async function getRecentAcceptedLeetCodeSubmissions(
  username: string,
  limit = 100
): Promise<LeetCodeRecentAcSubmission[]> {
  const query = `
    query recentAcSubmissions($username: String!, $limit: Int!) {
      recentAcSubmissionList(username: $username, limit: $limit) {
        id
        title
        titleSlug
        timestamp
      }
    }
  `;

  const data = await leetcodeGraphQl<LeetCodeRecentAcSubmissionsData>(
    query,
    { username, limit },
    "recentAcSubmissions"
  );

  return data.recentAcSubmissionList ?? [];
}

export async function getLeetCodeContestRanking(
  username: string
): Promise<LeetCodeContestRanking | null> {
  const query = `
    query userContestRankingInfo($username: String!) {
      userContestRanking(username: $username) {
        attendedContestsCount
        rating
        globalRanking
        totalParticipants
        topPercentage
      }
    }
  `;

  const data = await leetcodeGraphQl<LeetCodeContestRankingData>(
    query,
    { username },
    "userContestRankingInfo"
  );

  return data.userContestRanking;
}
