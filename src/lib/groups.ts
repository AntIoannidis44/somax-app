import { supabase } from './supabase';

export interface Group {
  id: string;
  name: string;
  created_by: string;
  created_at: string;
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
    .select('role, groups(id, name, created_by, created_at)')
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

export async function fetchGroupMemberIds(groupId: string): Promise<string[]> {
  const { data, error } = await supabase.from('group_members').select('user_id').eq('group_id', groupId);
  if (error) {
    console.error('[groups] fetchGroupMemberIds:', error.message);
    return [];
  }
  return data.map((r) => r.user_id as string);
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
