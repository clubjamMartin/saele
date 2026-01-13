'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Plus, Maximize2 } from '@/components/ui/icons';
import { DashboardService } from '@/types/dashboard';

interface ServicesPanelProps {
  services: DashboardService[];
}

export function ServicesPanel({ services }: ServicesPanelProps) {
  const [expandedService, setExpandedService] = useState<string | null>(null);

  const toggleService = (serviceId: string) => {
    setExpandedService(expandedService === serviceId ? null : serviceId);
  };

  const getServiceIcon = (name: string) => {
    // Return emoji or placeholder icons based on service name
    if (name.toLowerCase().includes('kühlschrank')) return '🧊';
    if (name.toLowerCase().includes('guide')) return '🗺️';
    if (name.toLowerCase().includes('kultur')) return '🎭';
    return '📦';
  };

  return (
    <Card variant="secondary" rounded="lg" className="relative overflow-hidden h-full">
      {/* Expand button */}
      <button
        className="absolute top-4 right-4 w-6 h-6 bg-[--color-saele-secondary-light] rounded-[5px] flex items-center justify-center hover:opacity-80 transition-opacity z-10"
        aria-label="Services erweitern"
      >
        <Maximize2 className="w-4 h-4 text-[--color-saele-secondary]" />
      </button>

      <div className="p-6 lg:p-8 h-full flex flex-col">
        {/* Title */}
        <h3
          className="text-white font-bold mb-6"
          style={{
            fontFamily: 'var(--font-josefin)',
            fontSize: 'clamp(1.75rem, 3vw, 2.25rem)', // 28px - 36px
            lineHeight: '1.3',
            fontWeight: 700,
          }}
        >
          Services
        </h3>

        {/* Services List */}
        <div className="flex flex-col gap-3 mb-6">
          {services.length === 0 ? (
            <p className="text-white/70 text-center py-4">
              Keine Services verfügbar
            </p>
          ) : (
            services.map((service) => (
              <div
                key={service.id}
                className="bg-white rounded-[12px] overflow-hidden"
              >
                {/* Service Header */}
                <div className="flex items-center justify-between p-4">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl" aria-hidden="true">
                      {getServiceIcon(service.name)}
                    </span>
                    <div>
                      <h4
                        className="text-[--color-saele-secondary] font-medium"
                        style={{
                          fontFamily: 'var(--font-josefin)',
                          fontSize: 'clamp(1rem, 1.2vw, 1.125rem)',
                          fontWeight: 600,
                        }}
                      >
                        {service.name}
                      </h4>
                      {service.status === 'active' && (
                        <p className="text-[--color-saele-secondary]/70 text-xs">
                          Aktiv
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Action Button */}
                  {service.status === 'available' ? (
                    <button
                      onClick={() => toggleService(service.id)}
                      className="px-4 py-2 bg-[--color-saele-secondary] text-white rounded-[8px] text-sm font-medium hover:opacity-90 transition-opacity"
                      style={{
                        fontFamily: 'var(--font-josefin)',
                        fontSize: '0.875rem',
                        fontWeight: 500,
                      }}
                    >
                      Anfordern
                    </button>
                  ) : (
                    <span
                      className="px-4 py-2 bg-[--color-saele-secondary-light] text-[--color-saele-secondary] rounded-[8px] text-sm font-medium"
                      style={{
                        fontFamily: 'var(--font-josefin)',
                        fontSize: '0.875rem',
                        fontWeight: 500,
                      }}
                    >
                      Aktiv
                    </span>
                  )}
                </div>

                {/* Expanded Details */}
                {expandedService === service.id && service.description && (
                  <div className="px-4 pb-4 pt-0">
                    <p
                      className="text-[--color-saele-secondary]/80 text-sm"
                      style={{
                        fontFamily: 'var(--font-josefin)',
                        fontSize: '0.875rem',
                        lineHeight: '1.5',
                        fontWeight: 300,
                      }}
                    >
                      {service.description}
                    </p>
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* Add Service Button */}
        <button
          className="mx-auto w-11 h-11 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition-colors mt-auto"
          aria-label="Service hinzufügen"
        >
          <Plus className="w-8 h-8 text-white" />
        </button>
      </div>
    </Card>
  );
}
