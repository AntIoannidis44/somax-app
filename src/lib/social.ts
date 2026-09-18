import { supabase } from './supabase';
import type { CharacterConfig } from '../types';

export interface PublicProfile {
  user_id: string;
  name: string;
  level: number;
  total_xp: number;
  current_streak: number;
  character: CharacterConfig | null;
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

export interface CommunityPost {
  id: string;
  user_id: string;
  name: string;
  text: string;
  created_at: string;
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
  const { data, error } = await supabase.from('public_profiles').select('*').order('total_xp', { ascending: false });
  if (error) {
    console.error('[social] fetchLeaderboard:', error.message);
    return [];
  }
  return data as PublicProfile[];
}

export function subscribeLeaderboard(onChange: () => void): () => void {
  return subscribeTable('public_profiles', onChange);
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

export async function createPost(userId: string, name: string, text: string): Promise<void> {
  const { error } = await supabase.from('community_posts').insert({ user_id: userId, name, text });
  if (error) console.error('[social] createPost:', error.message);
}

export function subscribePosts(onChange: () => void): () => void {
  return subscribeTable('community_posts', onChange);
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

export function subscribeDMs(onChange: () => void): () => void {
  return subscribeTable('direct_messages', onChange);
}
