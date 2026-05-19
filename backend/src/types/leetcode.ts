export type LeetCodeGraphQlResponse<T> = {
  data?: T;
  errors?: { message: string }[];
};

export type LeetCodeUserProfile = {
  username: string;
};

export type LeetCodeContestRanking = {
  attendedContestsCount: number;
  rating: number;
  globalRanking: number;
  totalParticipants: number;
  topPercentage: number;
};

export type LeetCodeRecentAcSubmission = {
  id: string;
  title: string;
  titleSlug: string;
  timestamp: string;
};

export type LeetCodeRecentAcSubmissionsData = {
  recentAcSubmissionList: LeetCodeRecentAcSubmission[];
};

export type LeetCodeUserProfileData = {
  matchedUser: LeetCodeUserProfile | null;
};

export type LeetCodeContestRankingData = {
  userContestRanking: LeetCodeContestRanking | null;
};
