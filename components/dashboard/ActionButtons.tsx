'use client';

import { Phone, Mail, MessageSquare, Info, HelpCircle } from '@/components/ui/icons';

// Euro icon component
function EuroIcon({ style }: { style?: React.CSSProperties }) {
  return (
    <svg
      style={style}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M20 7h-7a4 4 0 1 0 0 8h7" />
      <path d="M6 11h10" />
      <path d="M6 15h10" />
    </svg>
  );
}

interface ActionButtonsProps {
  position?: 'left' | 'right';
}

export function ActionButtons({ position = 'left' }: ActionButtonsProps) {
  const leftButtons = [
    { id: 'info', label: 'Info', icon: Info, color: '#DD8A90' },
    { id: 'rechnung', label: 'Rechnung', icon: EuroIcon, color: '#DD8A90' },
    { id: 'faq', label: 'FAQ', icon: HelpCircle, color: '#94A395' },
  ];

  const rightButtons = [
    { id: 'anruf', label: 'Anruf', icon: Phone, color: '#861309' },
    { id: 'chat', label: 'Chat', icon: MessageSquare, color: '#861309' },
    { id: 'mail', label: 'Mail', icon: Mail, color: '#861309' },
  ];

  const buttons = position === 'left' ? leftButtons : rightButtons;

  return (
    <>
      {buttons.map((button) => {
        const Icon = button.icon;
        return (
          <div
            key={button.id}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            {/* Circle Button */}
            <button
              style={{
                width: '80px',
                height: '80px',
                borderRadius: '50%',
                background: button.color,
                border: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                flexShrink: 0,
              }}
              aria-label={button.label}
            >
              <Icon
                style={{
                  width: '28px',
                  height: '28px',
                  color: 'white',
                }}
              />
            </button>
            
            {/* Label below circle */}
            <span
              style={{
                fontSize: '13px',
                color: 'white',
                fontWeight: 500,
                fontFamily: 'var(--font-josefin-sans)',
                textAlign: 'center',
              }}
            >
              {button.label}
            </span>
          </div>
        );
      })}
    </>
  );
}
