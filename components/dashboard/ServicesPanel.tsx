'use client';

import { useState } from 'react';
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
    if (name.toLowerCase().includes('unterhaltung')) return '🎬';
    return '📦';
  };

  // First service gets large card, rest get small cards
  const firstService = services[0];
  const otherServices = services.slice(1, 4); // Show up to 3 more services

  return (
    <div
      style={{
        background: '#94A395',
        borderRadius: '20px',
        width: '100%',
        maxWidth: '100%',
        minHeight: '380px',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Main expand button */}
      <button
        style={{
          position: 'absolute',
          top: '16px',
          right: '16px',
          width: '24px',
          height: '24px',
          background: '#4F5F3F',
          borderRadius: '5px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          border: 'none',
          cursor: 'pointer',
          zIndex: 10,
        }}
        aria-label="Services erweitern"
      >
        <Maximize2 className="w-4 h-4 text-white" />
      </button>

      <div style={{ padding: '1.5rem 1.25rem', height: '100%', display: 'flex', flexDirection: 'column' }}>
        {/* Services List */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.625rem', marginBottom: '1.25rem' }}>
          {services.length === 0 ? (
            <p style={{ color: 'rgba(255, 255, 255, 0.7)', textAlign: 'center', padding: '1rem 0' }}>
              Keine Services verfügbar
            </p>
          ) : (
            <>
              {/* First Service - Large Card */}
              {firstService && (
                <div
                  style={{
                    background: 'white',
                    borderRadius: '12px',
                    padding: '0.875rem',
                    minHeight: '120px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.5rem',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.625rem' }}>
                    <h4
                      style={{
                        fontFamily: 'var(--font-isabel)',
                        fontSize: '18px',
                        fontWeight: 900,
                        color: '#4F5F3F',
                        textAlign: 'center',
                      }}
                    >
                      {firstService.name}
                    </h4>
                  </div>
                  {firstService.description && (
                    <p
                      style={{
                        fontFamily: 'var(--font-josefin-sans)',
                        fontSize: '14px',
                        fontWeight: 300,
                        lineHeight: '1.4',
                        color: '#4F5F3F',
                        opacity: 0.8,
                        textAlign: 'center',
                      }}
                    >
                      {firstService.description}
                    </p>
                  )}
                  {firstService.status === 'available' && firstService.name.toLowerCase().includes('kühlschrank') && (
                    <button
                      onClick={() => toggleService(firstService.id)}
                      style={{
                        marginTop: 'auto',
                        padding: '0.5rem 1rem',
                        background: '#4F5F3F',
                        color: 'white',
                        borderRadius: '8px',
                        fontSize: '14px',
                        fontWeight: 500,
                        fontFamily: 'var(--font-josefin-sans)',
                        border: 'none',
                        cursor: 'pointer',
                        alignSelf: 'center',
                      }}
                    >
                      Anfordern
                    </button>
                  )}
                </div>
              )}

              {/* Other Services - Small Cards */}
              {otherServices.map((service) => {
                const hasButton = service.status === 'available' && service.name.toLowerCase().includes('kühlschrank');
                return (
                  <div
                    key={service.id}
                    style={{
                      background: 'white',
                      borderRadius: '12px',
                      padding: hasButton ? '0.625rem 0.875rem' : '0.75rem 0.875rem',
                      minHeight: hasButton ? '70px' : '50px',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.5rem',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', width: '100%' }}>
                      <h4
                        style={{
                          fontFamily: 'var(--font-isabel)',
                          fontSize: '18px',
                          fontWeight: 900,
                          color: '#4F5F3F',
                          textAlign: 'center',
                        }}
                      >
                        {service.name}
                      </h4>
                    </div>
                    {hasButton && (
                      <button
                        onClick={() => toggleService(service.id)}
                        style={{
                          width: '100%',
                          padding: '0.375rem 0.75rem',
                          background: '#4F5F3F',
                          color: 'white',
                          borderRadius: '6px',
                          fontSize: '12px',
                          fontWeight: 500,
                          fontFamily: 'var(--font-josefin-sans)',
                          border: 'none',
                          cursor: 'pointer',
                        }}
                      >
                        Anfordern
                      </button>
                    )}
                  </div>
                );
              })}
            </>
          )}
        </div>

        {/* Add Service Button */}
        <button
          style={{
            margin: '0 auto',
            width: '44px',
            height: '44px',
            borderRadius: '50%',
            background: 'rgba(255, 255, 255, 0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: 'none',
            cursor: 'pointer',
            transition: 'background 0.2s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.3)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)';
          }}
          aria-label="Service hinzufügen"
        >
          <Plus className="w-8 h-8 text-white" />
        </button>
      </div>
    </div>
  );
}
