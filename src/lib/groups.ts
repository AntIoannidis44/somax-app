import { supabase } from './supabase';
import { resizeToJpeg } from './chatImage';

export interface Group {
  id: string;
  name: string;
  created_by: string;
  created_at: string;
  photo_url: string | null;
}

export interface GroupMember {
  user_id: string;
  name: string;
  photo_url: string | null;
  role: 'admin' | 'member';
}

export interface GroupMembership extends Group {
  role: 'admin' | 'member';
}

export interface GroupMessage {
  id: string;
  group_id: string;
  sender_id: string;
  sender_name: string;
  text: string;
  created_at: string;
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

// Groups the current user belongs to, newest first. group_members has a
// foreign key to groups, so this embeds the group row in one query rather
// than fetching ids then looking each group up separately.
export async function fetchMyGroups(userId: string): Promise<GroupMembership[]> {
  const { data, error } = await supabase
    .from('group_members')
    .select('role, groups(id, name, created_by, created_at, photo_url)')
    .eq('user_id', userId)
    .order('joined_at', { ascending: false });
  if (error) {
    console.error('[groups] fetchMyGroups:', error.message);
    return [];
  }
  return (data as unknown as { role: 'admin' | 'member'; groups: Group }[])
    .filter((row) => row.groups)
    .map((row) => ({ ...row.groups, role: row.role }));
}

export function subscribeMyGroups(onChange: () => void): () => void {
  const un1 = subscribeTable('group_members', onChange);
  const un2 = subscribeTable('groups', onChange);
  return () => {
    un1();
    un2();
  };
}

// Creates the group and adds the creator as its admin, then every picked
// friend as a plain member - one group, ready to message, in one call.
export async function createGroup(userId: string, name: string, memberIds: string[]): Promise<string | null> {
  const { data: group, error } = await supabase.from('groups').insert({ name, created_by: userId }).select('id').single();
  if (error || !group) {
    console.error('[groups] createGroup:', error?.message);
    return null;
  }
  // The creator's own row must be inserted (and committed) before the
  // friend rows: group_members' RLS check is_group_admin(group_id) re-reads
  // group_members, and rows inserted earlier in the SAME statement aren't
  // visible to that check yet (Postgres cmin visibility), so a single
  // multi-row insert makes every friend row fail WITH CHECK - and since an
  // insert is all-or-nothing, that also rejects the admin's own row.
  const { error: adminError } = await supabase.from('group_members').insert({ group_id: group.id, user_id: userId, role: 'admin' as const });
  if (adminError) {
    console.error('[groups] createGroup admin row:', adminError.message);
    await supabase.from('groups').delete().eq('id', group.id);
    return null;
  }
  const friendRows = memberIds.filter((id) => id !== userId).map((id) => ({ group_id: group.id, user_id: id, role: 'member' as const }));
  if (friendRows.length) {
    const { error: memberError } = await supabase.from('group_members').insert(friendRows);
    if (memberError) console.error('[groups] createGroup members:', memberError.message);
  }
  return group.id as string;
}

// A single group's own row, fresh (not from a cached list) - used by the
// chat screen and chat-info screen so a photo change shows immediately
// without depending on how the screen was navigated to.
export async function fetchGroup(groupId: string): Promise<Group | null> {
  const { data, error } = await supabase.from('groups').select('id, name, created_by, created_at, photo_url').eq('id', groupId).maybeSingle();
  if (error) {
    console.error('[groups] fetchGroup:', error.message);
    return null;
  }
  return data as Group | null;
}

export async function fetchGroupMemberIds(groupId: string): Promise<string[]> {
  const { data, error } = await supabase.from('group_members').select('user_id').eq('group_id', groupId);
  if (error) {
    console.error('[groups] fetchGroupMemberIds:', error.message);
    return [];
  }
  return data.map((r) => r.user_id as string);
}

// Full member list for the group-info screen - name and photo, not just ids.
// group_members.user_id has no FK to public_profiles (it points at
// auth.users), so PostgREST can't embed it directly - two queries, joined
// by hand, same as every other cross-reference to public_profiles in the app.
export async function fetchGroupMembers(groupId: string): Promise<GroupMember[]> {
  const { data: rows, error } = await supabase.from('group_members').select('user_id, role').eq('group_id', groupId);
  if (error) {
    console.error('[groups] fetchGroupMembers:', error.message);
    return [];
  }
  const ids = rows.map((r) => r.user_id as string);
  if (ids.length === 0) return [];
  const { data: profiles, error: profileError } = await supabase.from('public_profiles').select('user_id, name, photo_url').in('user_id', ids);
  if (profileError) console.error('[groups] fetchGroupMembers profiles:', profileError.message);
  const byId = new Map((profiles ?? []).map((p) => [p.user_id as string, p]));
  return (rows as { user_id: string; role: 'admin' | 'member' }[]).map((row) => {
    const p = byId.get(row.user_id);
    return { user_id: row.user_id, role: row.role, name: (p?.name as string) ?? 'Member', photo_url: (p?.photo_url as string | null) ?? null };
  });
}

const GROUP_PHOTO_BUCKET = 'group-photos';

// One photo per group, fixed filename so changing it just overwrites the old
// one (storage.objects RLS scopes writes to members of that group - see the
// group_photos_member_* policies). No person-check like profile photos: a
// group's photo can be anything (the gym, a group selfie, a logo).
export async function uploadGroupPhoto(groupId: string, file: File): Promise<string | null> {
  const blob = await resizeToJpeg(file, 800);
  const path = `${groupId}/photo.jpg`;
  const { error: uploadError } = await supabase.storage.from(GROUP_PHOTO_BUCKET).upload(path, blob, { contentType: 'image/jpeg', upsert: true });
  if (uploadError) {
    console.error('[groups] uploadGroupPhoto:', uploadError.message);
    return null;
  }
  const { data } = supabase.storage.from(GROUP_PHOTO_BUCKET).getPublicUrl(path);
  const url = `${data.publicUrl}?v=${Date.now()}`;
  const { error: updateError } = await supabase.from('groups').update({ photo_url: url }).eq('id', groupId);
  if (updateError) {
    console.error('[groups] uploadGroupPhoto update:', updateError.message);
    return null;
  }
  return url;
}

export async function removeGroupPhoto(groupId: string): Promise<void> {
  await supabase.storage.from(GROUP_PHOTO_BUCKET).remove([`${groupId}/photo.jpg`]);
  const { error } = await supabase.from('groups').update({ photo_url: null }).eq('id', groupId);
  if (error) console.error('[groups] removeGroupPhoto:', error.message);
}

export async function leaveGroup(groupId: string, userId: string): Promise<void> {
  const { error } = await supabase.from('group_members').delete().eq('group_id', groupId).eq('user_id', userId);
  if (error) console.error('[groups] leaveGroup:', error.message);
}

export async function fetchGroupMessages(groupId: string): Promise<GroupMessage[]> {
  const { data, error } = await supabase
    .from('group_messages')
    .select('*')
    .eq('group_id', groupId)
    .order('created_at', { ascending: true })
    .limit(200);
  if (error) {
    console.error('[groups] fetchGroupMessages:', error.message);
    return [];
  }
  return data as GroupMessage[];
}

export async function sendGroupMessage(groupId: string, senderId: string, senderName: string, text: string): Promise<void> {
  const { error } = await supabase.from('group_messages').insert({ group_id: groupId, sender_id: senderId, sender_name: senderName, text });
  if (error) console.error('[groups] sendGroupMessage:', error.message);
}

export async function deleteGroupMessage(messageId: string): Promise<boolean> {
  const { error } = await supabase.from('group_messages').delete().eq('id', messageId);
  if (error) console.error('[groups] deleteGroupMessage:', error.message);
  return !error;
}

export function subscribeGroupMessages(onChange: () => void): () => void {
  return subscribeTable('group_messages', onChange);
}

// Last message per group, for the unified Messages inbox - same
// fetch-recent-and-reduce-client-side approach as fetchLastDMPerPartner.
export async function fetchLastGroupMessagesFor(groupIds: string[]): Promise<Record<string, GroupMessage>> {
  if (groupIds.length === 0) return {};
  const { data, error } = await supabase
    .from('group_messages')
    .select('*')
    .in('group_id', groupIds)
    .order('created_at', { ascending: false })
    .limit(500);
  if (error) {
    console.error('[groups] fetchLastGroupMessagesFor:', error.message);
    return {};
  }
  const out: Record<string, GroupMessage> = {};
  for (const row of data as GroupMessage[]) if (!out[row.group_id]) out[row.group_id] = row;
  return out;
}
