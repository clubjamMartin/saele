interface SectionTitleProps {
  children: React.ReactNode;
  color?: 'white' | '#861309' | '#4F5F3F';
  size?: 'default' | 'small';
}

export function SectionTitle({ 
  children, 
  color = 'white',
  size = 'default'
}: SectionTitleProps) {
  const fontSize = size === 'small' ? '28px' : '36px';
  const lineHeight = size === 'small' ? '34px' : '44px';

  return (
    <h2
      style={{
        fontFamily: 'var(--font-isabel)',
        fontWeight: 700,
        fontSize,
        lineHeight,
        color,
        textAlign: 'center',
        margin: 0,
      }}
    >
      {children}
    </h2>
  );
}
