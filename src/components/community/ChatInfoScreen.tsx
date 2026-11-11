import { useEffect, useState } from 'react';
import { Icon } from '../Icon';
import { useAppStore } from '../../store/useAppStore';
import { useUserId } from '../../lib/useSession';
import { fetchProfile, type PublicProfile } from '../../lib/social';
import { fetchGroup, fetchGroupMembers, leaveGroup, removeGroupPhoto, uploadGroupPhoto, type Group, type GroupMember } from '../../lib/groups';
import { UserAvatar } from './UserAvatar';

export function ChatInfoScreen() {
  const info = useAppStore((s) => s.viewingChatInfo)!;
  const closeChatInfo = useAppStore((s) => s.closeChatInfo);
  const closeGroup = useAppStore((s) => s.closeGroup);
  const openSharedContent = useAppStore((s) => s.openSharedContent);
  const showToast = useAppStore((s) => s.showToast);
  const userId = useUserId();

  const [profile, setProfile] = useState<PublicProfile | null>(null);
  const [group, setGroup] = useState<Group | null>(null);
  const [members, setMembers] = useState<GroupMember[]>([]);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    if (info.kind === 'dm') {
      fetchProfile(info.id).then((p) => {
        if (!cancelled) setProfile(p);
      });
    } else {
      fetchGroup(info.id).then((g) => {
        if (!cancelled) setGroup(g);
      });
      fetchGroupMembers(info.id).then((rows) => {
        if (!cancelled) setMembers(rows);
      });
    }
    return () => {
      cancelled = true;
    };
  }, [info.kind, info.id]);

  async function handlePhoto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setUploading(true);
    const url = await uploadGroupPhoto(info.id, file);
    setUploading(false);
    if (url) setGroup((g) => (g ? { ...g, photo_url: url } : g));
    else showToast('Could not update the group photo');
  }

  async function handleRemovePhoto() {
    if (!window.confirm('Remove the group photo?')) return;
    await removeGroupPhoto(info.id);
    setGroup((g) => (g ? { ...g, photo_url: null } : g));
  }

  async function handleLeave() {
    if (!userId) return;
    if (!window.confirm(`Leave ${info.name}? You'll need a new invite to rejoin.`)) return;
    await leaveGroup(info.id, userId);
    showToast('Left the group');
    closeChatInfo();
    closeGroup();
  }

  const name = info.kind === 'dm' ? profile?.name ?? info.name : group?.name ?? info.name;
  const photoUrl = info.kind === 'dm' ? profile?.photo_url ?? null : group?.photo_url ?? null;

  return (
    <div className="composer-screen">
      <div className="composer-screen-body">
        <div className="info-hero">
          <div className="info-avatar-wrap">
            {photoUrl ? (
              <span className="info-avatar">
                <img className="fit-img" src={photoUrl} alt="" />
              </span>
            ) : info.kind === 'dm' ? (
              <UserAvatar className="info-avatar" name={name} character={profile?.character} photoUrl={null} />
            ) : (
              <span className="info-avatar group-icon" style={{ width: 96, height: 96, borderRadius: 28 }}>
                <Icon name="community" style={{ width: 34, height: 34 }} />
              </span>
            )}
            {info.kind === 'group' && (
              <label className="info-avatar-edit" aria-label="Change group photo">
                <Icon name="camera" style={{ width: 14, height: 14 }} />
                <input type="file" accept="image/*" onChange={handlePhoto} disabled={uploading} style={{ display: 'none' }} />
              </label>
            )}
          </div>
          <div className="info-name">{name}</div>
          {info.kind === 'group' && <div className="info-sub">{members.length} member{members.length === 1 ? '' : 's'}</div>}
          {info.kind === 'group' && group?.photo_url && (
            <button className="link-btn" onClick={handleRemovePhoto} style={{ marginTop: 4 }}>
              Remove photo
            </button>
          )}
        </div>

        <button className="info-row" onClick={() => openSharedContent(info.kind, info.id, name)}>
          <span className="info-row-ic">
            <Icon name="camera" style={{ width: 17, height: 17 }} />
          </span>
          <span className="info-row-main">Media, workouts &amp; meals</span>
          <Icon name="chevron" className="info-row-chevron" />
        </button>

        {info.kind === 'group' && (
          <>
            <div className="section-label">Members</div>
            <div className="card">
              {members.map((m) => (
                <div className="member-row" key={m.user_id}>
                  <UserAvatar className="member-avatar" name={m.name} photoUrl={m.photo_url} />
                  <span className="member-name">{m.name}</span>
                  {m.user_id === userId && <span className="member-you">You</span>}
                </div>
              ))}
            </div>

            <div style={{ height: 10 }} />
            <button className="btn btn-danger-ghost" onClick={handleLeave}>
              Leave group
            </button>
          </>
        )}
      </div>
    </div>
  );
}
