import { User } from '@/components/ui/icons';

interface UserAvatarProps {
  userName: string | null;
}

export function UserAvatar({ userName }: UserAvatarProps) {
  const firstName = userName?.split(' ')[0] || 'Gast';

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '15px',
      }}
    >
      <div
        style={{
          width: '90px',
          height: '90px',
          borderRadius: '50%',
          background: 'white',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <User className="w-12 h-12 text-[--color-saele-primary]" />
      </div>
      <span
        style={{
          fontFamily: 'var(--font-josefin-sans)',
          fontSize: '20px',
          fontWeight: 700,
          color: 'white',
        }}
      >
        {firstName}
      </span>
    </div>
  );
}
