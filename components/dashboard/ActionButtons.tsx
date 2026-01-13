import { Phone, Mail, MessageSquare, Info, Receipt, HelpCircle } from '@/components/ui/icons';
import { Card } from '@/components/ui/card';

export function ActionButtons() {
  const actions = [
    {
      id: 'info',
      label: 'Info',
      icon: Info,
      href: '/info',
      ariaLabel: 'Informationen anzeigen',
    },
    {
      id: 'rechnung',
      label: 'Rechnung',
      icon: Receipt,
      href: '/billing',
      ariaLabel: 'Rechnung anzeigen',
    },
    {
      id: 'faq',
      label: 'FAQ',
      icon: HelpCircle,
      href: '/faq',
      ariaLabel: 'Häufig gestellte Fragen',
    },
    {
      id: 'anrufen',
      label: 'Anrufen',
      icon: Phone,
      href: 'tel:+43123456789',
      ariaLabel: 'Uns anrufen',
    },
    {
      id: 'chat',
      label: 'Chat',
      icon: MessageSquare,
      href: '/chat',
      ariaLabel: 'Chat starten',
    },
    {
      id: 'mail',
      label: 'Mail',
      icon: Mail,
      href: 'mailto:info@saele.at',
      ariaLabel: 'E-Mail senden',
    },
  ];

  return (
    <Card variant="light" rounded="lg" className="w-full">
      <div className="p-6 lg:p-8">
        <div className="flex flex-wrap items-center justify-center gap-6 lg:gap-8">
          {actions.map((action) => {
            const Icon = action.icon;
            return (
              <a
                key={action.id}
                href={action.href}
                aria-label={action.ariaLabel}
                className="flex flex-col items-center gap-2 transition-transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[--color-saele-primary] rounded-full"
              >
                {/* Circle Button */}
                <div className="w-14 h-14 lg:w-16 lg:h-16 rounded-full bg-[--color-saele-primary] flex items-center justify-center shadow-md hover:shadow-lg transition-shadow">
                  <Icon className="w-7 h-7 lg:w-8 lg:h-8 text-white" aria-hidden="true" />
                </div>
                
                {/* Label */}
                <span
                  className="text-[--color-saele-primary] font-medium text-center"
                  style={{
                    fontFamily: 'var(--font-josefin)',
                    fontSize: 'clamp(0.875rem, 1vw, 1rem)',
                    fontWeight: 500,
                  }}
                >
                  {action.label}
                </span>
              </a>
            );
          })}
          
          {/* Saele Branding */}
          <div className="hidden lg:flex ml-8 text-[--color-saele-primary] font-bold text-2xl" aria-hidden="true">
            Saele
          </div>
        </div>
      </div>
    </Card>
  );
}
