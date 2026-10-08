import { supabase } from './supabase';
import type { CharacterConfig, ExerciseDef } from '../types';

export interface RecentActivityEntry {
  label: string;
  xp: number;
  at: string;
}

export interface PublicProfile {
  user_id: string;
  name: string;
  level: number;
  total_xp: number;
  monthly_xp: number;
  monthly_steps: number;
  is_private: boolean;
  current_streak: number;
  character: CharacterConfig | null;
  photo_url: string | null;
  recent_activity: RecentActivityEntry[];
  updated_at: string;
}

export type FriendshipStatus = 'pending' | 'accepted' | 'declined';

export interface Friendship {
  id: string;
  requester_id: string;
  addressee_id: string;
  status: FriendshipStatus;
  created_at: string;
  updated_at: string;
}

export interface PostWorkout {
  name: string;
  duration: string;
  category: string;
  exercises: ExerciseDef[];
  // True for a real HealthKit-sourced activity (a Watch-synced run/ride/
  // swim) - a custom gym program never sets this. Drives whether the feed
  // card opens a session detail view at all - deliberately NOT inferred
  // from distanceMeters/route being present, since HealthKit can legally
  // return a workout with no distance (e.g. logged indoors, or a source
  // that never wrote it) and that activity should still be viewable.
  isActivity?: boolean;
  distanceMeters?: number;
  route?: { lat: number; lng: number; t: string }[];
}

export interface CommunityPost {
  id: string;
  user_id: string;
  name: string;
  text: string;
  created_at: string;
  // One of WORKOUT_TYPES' ids, or null for a post not tied to a workout type.
  workout_type: string | null;
  image_url: string | null;
  // A self-contained snapshot (same idea as shared_programs/DM program
  // messages) - not a live reference, so it still renders correctly even
  // if the sender later edits or deletes the original program.
  workout: PostWorkout | null;
  // Free-text label (e.g. "Hyde Park") - deliberately not geocoded/pinned,
  // same reasoning as the route-shape-not-real-map decision: no maps API,
  // no cost, no third-party key to manage.
  location: string | null;
  link: string | null;
  // 'public' shows in everyone's Community feed; 'friends' only shows to
  // accepted friends (and the poster) - enforced server-side by RLS, not
  // just hidden client-side, so this is real for a private profile.
  visibility: 'public' | 'friends';
}

export interface DirectMessage {
  id: string;
  sender_id: string;
  recipient_id: string;
  text: string;
  created_at: string;
  read: boolean;
}

function subscribeTable(table: string, onChange: () => void) {
  const channel = supabase
    .channel(`${table}_changes_${Math.random().toString(36).slice(2)}`)
    .on('postgres_changes', { event: '*', schema: 'public', table }, onChange)
    .subscribe();
  return () => {
    supabase.removeChannel(channel);
  };
}

// ---------- Leaderboard ----------

export async function fetchLeaderboard(): Promise<PublicProfile[]> {
  const { data, error } = await supabase.from('public_profiles').select('*').order('monthly_xp', { ascending: false });
  if (error) {
    console.error('[social] fetchLeaderboard:', error.message);
    return [];
  }
  return data as PublicProfile[];
}

export function subscribeLeaderboard(onChange: () => void): () => void {
  return subscribeTable('public_profiles', onChange);
}

export async function fetchProfile(userId: string): Promise<PublicProfile | null> {
  const { data, error } = await supabase.from('public_profiles').select('*').eq('user_id', userId).maybeSingle();
  if (error) {
    console.error('[social] fetchProfile:', error.message);
    return null;
  }
  return data as PublicProfile | null;
}

// ---------- Community feed ----------

export async function fetchPosts(): Promise<CommunityPost[]> {
  const { data, error } = await supabase.from('community_posts').select('*').order('created_at', { ascending: false }).limit(100);
  if (error) {
    console.error('[social] fetchPosts:', error.message);
    return [];
  }
  return data as CommunityPost[];
}

export async function createPost(
  userId: string,
  name: string,
  text: string,
  workoutType: string | null = null,
  imageUrl: string | null = null,
  workout: PostWorkout | null = null,
  location: string | null = null,
  link: string | null = null,
  visibility: 'public' | 'friends' = 'public',
): Promise<void> {
  const { error } = await supabase
    .from('community_posts')
    .insert({ user_id: userId, name, text, workout_type: workoutType, image_url: imageUrl, workout, location, link, visibility });
  if (error) console.error('[social] createPost:', error.message);
}

export function subscribePosts(onChange: () => void): () => void {
  return subscribeTable('community_posts', onChange);
}

export async function deletePost(id: string): Promise<void> {
  const { error } = await supabase.from('community_posts').delete().eq('id', id);
  if (error) console.error('[social] deletePost:', error.message);
}

export async function fetchPostsByUser(userId: string): Promise<CommunityPost[]> {
  const { data, error } = await supabase
    .from('community_posts')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(50);
  if (error) {
    console.error('[social] fetchPostsByUser:', error.message);
    return [];
  }
  return data as CommunityPost[];
}

// ---------- Feed engagement (likes + comments) ----------

export interface PostComment {
  id: string;
  post_id: string;
  user_id: string;
  name: string;
  text: string;
  created_at: string;
}

// One query for every visible post's likes/comments rather than N+1 - fine
// at this scale (a beta's worth of posts), same approach as fetchLeaderboard
// fetching everything and working it out client-side.
export async function fetchLikes(postIds: string[]): Promise<{ post_id: string; user_id: string }[]> {
  if (postIds.length === 0) return [];
  const { data, error } = await supabase.from('post_likes').select('post_id, user_id').in('post_id', postIds);
  if (error) {
    console.error('[social] fetchLikes:', error.message);
    return [];
  }
  return data;
}

export async function fetchComments(postIds: string[]): Promise<PostComment[]> {
  if (postIds.length === 0) return [];
  const { data, error } = await supabase
    .from('post_comments')
    .select('*')
    .in('post_id', postIds)
    .order('created_at', { ascending: true });
  if (error) {
    console.error('[social] fetchComments:', error.message);
    return [];
  }
  return data as PostComment[];
}

export async function likePost(postId: string, userId: string): Promise<void> {
  const { error } = await supabase.from('post_likes').insert({ post_id: postId, user_id: userId });
  if (error) console.error('[social] likePost:', error.message);
}

export async function unlikePost(postId: string, userId: string): Promise<void> {
  const { error } = await supabase.from('post_likes').delete().eq('post_id', postId).eq('user_id', userId);
  if (error) console.error('[social] unlikePost:', error.message);
}

export async function addComment(postId: string, userId: string, name: string, text: string): Promise<void> {
  const { error } = await supabase.from('post_comments').insert({ post_id: postId, user_id: userId, name, text });
  if (error) console.error('[social] addComment:', error.message);
}

export async function deleteComment(id: string): Promise<void> {
  const { error } = await supabase.from('post_comments').delete().eq('id', id);
  if (error) console.error('[social] deleteComment:', error.message);
}

export function subscribeLikes(onChange: () => void): () => void {
  return subscribeTable('post_likes', onChange);
}

export function subscribeComments(onChange: () => void): () => void {
  return subscribeTable('post_comments', onChange);
}

// ---------- Friendships ----------

export async function fetchFriendships(userId: string): Promise<Friendship[]> {
  const { data, error } = await supabase
    .from('friendships')
    .select('*')
    .or(`requester_id.eq.${userId},addressee_id.eq.${userId}`);
  if (error) {
    console.error('[social] fetchFriendships:', error.message);
    return [];
  }
  return data as Friendship[];
}

export async function sendFriendRequest(requesterId: string, addresseeId: string): Promise<void> {
  const { error } = await supabase
    .from('friendships')
    .insert({ requester_id: requesterId, addressee_id: addresseeId, status: 'pending' });
  if (error) console.error('[social] sendFriendRequest:', error.message);
}

export async function respondToFriendRequest(id: string, accept: boolean): Promise<void> {
  const { error } = await supabase
    .from('friendships')
    .update({ status: accept ? 'accepted' : 'declined', updated_at: new Date().toISOString() })
    .eq('id', id);
  if (error) console.error('[social] respondToFriendRequest:', error.message);
}

export function subscribeFriendships(onChange: () => void): () => void {
  return subscribeTable('friendships', onChange);
}

// Accepted friends only, with their public profile (name/level) - used
// by the session-share picker, same resolution CommunityScreen's Friends
// tab does (leaderboard rows + accepted friendship rows joined by id).
export async function fetchFriends(userId: string): Promise<PublicProfile[]> {
  const [profiles, friendships] = await Promise.all([fetchLeaderboard(), fetchFriendships(userId)]);
  const friendIds = new Set(
    friendships.filter((f) => f.status === 'accepted').map((f) => (f.requester_id === userId ? f.addressee_id : f.requester_id)),
  );
  return profiles.filter((p) => friendIds.has(p.user_id));
}

// ---------- Direct messages ----------

export async function fetchConversation(userId: string, otherId: string): Promise<DirectMessage[]> {
  const { data, error } = await supabase
    .from('direct_messages')
    .select('*')
    .or(`and(sender_id.eq.${userId},recipient_id.eq.${otherId}),and(sender_id.eq.${otherId},recipient_id.eq.${userId})`)
    .order('created_at', { ascending: true });
  if (error) {
    console.error('[social] fetchConversation:', error.message);
    return [];
  }
  return data as DirectMessage[];
}

export async function sendDM(senderId: string, recipientId: string, text: string): Promise<void> {
  const { error } = await supabase.from('direct_messages').insert({ sender_id: senderId, recipient_id: recipientId, text });
  if (error) console.error('[social] sendDM:', error.message);
}

// Removes a message for both people in the chat (the delete rule lets either
// side remove any message in their own conversation).
export async function deleteDM(messageId: string): Promise<boolean> {
  const { error } = await supabase.from('direct_messages').delete().eq('id', messageId);
  if (error) console.error('[social] deleteDM:', error.message);
  return !error;
}

// Clears the whole conversation for both people.
export async function clearConversation(userId: string, otherId: string): Promise<boolean> {
  const { error } = await supabase
    .from('direct_messages')
    .delete()
    .or(`and(sender_id.eq.${userId},recipient_id.eq.${otherId}),and(sender_id.eq.${otherId},recipient_id.eq.${userId})`);
  if (error) console.error('[social] clearConversation:', error.message);
  return !error;
}

export function subscribeDMs(onChange: () => void): () => void {
  return subscribeTable('direct_messages', onChange);
}
