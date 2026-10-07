import type { Review } from "@/entities/reviews";
import { http } from "./client";

export interface CreateReviewInput {
  title: string;
  titleId: string;
  score: number;
  comment?: string;
}

export const listReviews = (params: { titleId?: string; userId?: string; skip?: number; limit?: number } = {}) =>
  http.get<Review[]>("/reviews/list", { params }).then((r) => r.data);

export const getRanking = (titleId: string) =>
  http.get<{ titleId: string; ranking: number }>(`/reviews/ranking/${titleId}`).then((r) => r.data.ranking);

export const createReview = (input: CreateReviewInput) =>
  http.post<Review>("/reviews/create", input).then((r) => r.data);

export const likeReview = (id: string) =>
  http.put<{ id: string; likesCount: number; dislikesCount: number }>(`/reviews/like/${id}`).then((r) => r.data);

export const dislikeReview = (id: string) =>
  http.put<{ id: string; likesCount: number; dislikesCount: number }>(`/reviews/dislike/${id}`).then((r) => r.data);

export const deleteReview = (id: string) => http.delete(`/reviews/${id}`).then(() => undefined);
