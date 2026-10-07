export interface Review {
  id: string;
  title: string;
  comment: string | null;
  score: number;
  likesCount: number;
  dislikesCount: number;
  createdAt: string;
  titleId: string;
  userId: string;
  user: { id: string; name: string; avatarUrl: string | null };
  titleRef: { id: string; title: string };
}
