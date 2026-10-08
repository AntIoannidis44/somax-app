import { useEffect, useState } from 'react';
import {
  addComment,
  deleteComment,
  fetchComments,
  fetchLikes,
  likePost,
  subscribeComments,
  subscribeLikes,
  unlikePost,
  type PostComment,
} from './social';

// Shared like/comment state + actions for a set of posts - used by both the
// main feed and a friend's profile "Feed" tab, so liking/commenting works
// identically (and reuses one fetch/subscribe path) in both places.
export function useFeedEngagement(postIds: string[], userId: string) {
  const [likesByPost, setLikesByPost] = useState<Map<string, Set<string>>>(new Map());
  const [commentsByPost, setCommentsByPost] = useState<Map<string, PostComment[]>>(new Map());
  const [expandedComments, setExpandedComments] = useState<Set<string>>(new Set());
  const [commentDrafts, setCommentDrafts] = useState<Map<string, string>>(new Map());

  const key = postIds.join(',');

  useEffect(() => {
    let cancelled = false;
    function load() {
      fetchLikes(postIds).then((rows) => {
        if (cancelled) return;
        const map = new Map<string, Set<string>>();
        for (const r of rows) {
          if (!map.has(r.post_id)) map.set(r.post_id, new Set());
          map.get(r.post_id)!.add(r.user_id);
        }
        setLikesByPost(map);
      });
      fetchComments(postIds).then((rows) => {
        if (cancelled) return;
        const map = new Map<string, PostComment[]>();
        for (const c of rows) {
          if (!map.has(c.post_id)) map.set(c.post_id, []);
          map.get(c.post_id)!.push(c);
        }
        setCommentsByPost(map);
      });
    }
    load();
    const un1 = subscribeLikes(load);
    const un2 = subscribeComments(load);
    return () => {
      cancelled = true;
      un1();
      un2();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  function isLikedByMe(postId: string): boolean {
    return likesByPost.get(postId)?.has(userId) ?? false;
  }
  function likeCountFor(postId: string): number {
    return likesByPost.get(postId)?.size ?? 0;
  }
  function commentsFor(postId: string): PostComment[] {
    return commentsByPost.get(postId) ?? [];
  }
  function commentsOpenFor(postId: string): boolean {
    return expandedComments.has(postId);
  }
  function draftFor(postId: string): string {
    return commentDrafts.get(postId) ?? '';
  }
  function toggleLike(postId: string) {
    if (isLikedByMe(postId)) unlikePost(postId, userId);
    else likePost(postId, userId);
  }
  function toggleComments(postId: string) {
    setExpandedComments((prev) => {
      const next = new Set(prev);
      if (next.has(postId)) next.delete(postId);
      else next.add(postId);
      return next;
    });
  }
  function setDraft(postId: string, text: string) {
    setCommentDrafts((prev) => new Map(prev).set(postId, text));
  }
  function submitComment(postId: string, myName: string) {
    const text = draftFor(postId).trim();
    if (!text) return;
    setDraft(postId, '');
    addComment(postId, userId, myName, text);
  }
  function removeComment(id: string) {
    deleteComment(id);
  }

  return {
    isLikedByMe,
    likeCountFor,
    commentsFor,
    commentsOpenFor,
    draftFor,
    toggleLike,
    toggleComments,
    setDraft,
    submitComment,
    removeComment,
  };
}
