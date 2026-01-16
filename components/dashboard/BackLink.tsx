import Link from 'next/link';

export function BackLink() {
  return (
    <Link
      href="/"
      style={{
        fontFamily: 'var(--font-josefin-sans)',
        fontSize: '16px',
        fontWeight: 500,
        color: 'white',
        textDecoration: 'underline',
        textShadow: '0 0 5px rgba(0,0,0,0.5)',
      }}
    >
      zurück
    </Link>
  );
}
