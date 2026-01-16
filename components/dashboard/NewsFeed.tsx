'use client';

import { useState } from 'react';
import { Maximize2 } from '@/components/ui/icons';
import { DashboardInstagram } from '@/types/dashboard';

interface NewsFeedProps {
  instagram: DashboardInstagram;
}

export function NewsFeed({ instagram }: NewsFeedProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const totalSlides = 5; // Per Figma design

  return (
    <div
      style={{
        background: '#94A395',
        borderRadius: '20px',
        width: '100%',
        maxWidth: '100%',
        minHeight: '520px',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Main expand button - bottom right */}
      <button
        style={{
          position: 'absolute',
          bottom: '16px',
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
        aria-label="News erweitern"
      >
        <Maximize2 className="w-4 h-4 text-white" />
      </button>

      <div style={{ padding: '1.5rem', height: '100%', display: 'flex', flexDirection: 'column' }}>
        {/* Instagram Post Placeholders */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.875rem', marginBottom: '1.5rem' }}>
          {/* Post 1 */}
          <div
            style={{
              background: '#D9D9D9',
              borderRadius: '12px',
              height: '130px',
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {/* Individual expand button */}
            <button
              style={{
                position: 'absolute',
                top: '8px',
                right: '8px',
                width: '20px',
                height: '20px',
                background: 'rgba(79, 95, 63, 0.5)',
                borderRadius: '4px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: 'none',
                cursor: 'pointer',
              }}
              aria-label="Post erweitern"
            >
              <Maximize2 className="w-3 h-3 text-white" />
            </button>
            <span style={{ color: '#888', fontSize: '13px' }}>Instagram Post</span>
          </div>

          {/* Post 2 */}
          <div
            style={{
              background: '#D9D9D9',
              borderRadius: '12px',
              height: '130px',
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {/* Individual expand button */}
            <button
              style={{
                position: 'absolute',
                top: '8px',
                right: '8px',
                width: '20px',
                height: '20px',
                background: 'rgba(79, 95, 63, 0.5)',
                borderRadius: '4px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: 'none',
                cursor: 'pointer',
              }}
              aria-label="Post erweitern"
            >
              <Maximize2 className="w-3 h-3 text-white" />
            </button>
            <span style={{ color: '#888', fontSize: '13px' }}>Instagram Post</span>
          </div>

          {/* Post 3 */}
          <div
            style={{
              background: '#D9D9D9',
              borderRadius: '12px',
              height: '130px',
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {/* Individual expand button */}
            <button
              style={{
                position: 'absolute',
                top: '8px',
                right: '8px',
                width: '20px',
                height: '20px',
                background: 'rgba(79, 95, 63, 0.5)',
                borderRadius: '4px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: 'none',
                cursor: 'pointer',
              }}
              aria-label="Post erweitern"
            >
              <Maximize2 className="w-3 h-3 text-white" />
            </button>
            <span style={{ color: '#888', fontSize: '13px' }}>Instagram Post</span>
          </div>
        </div>

        {/* Pagination Dots */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            marginBottom: '1rem',
          }}
          role="tablist"
          aria-label="News Pagination"
        >
          {[...Array(totalSlides)].map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              style={{
                width: currentSlide === index ? '12px' : '8px',
                height: currentSlide === index ? '12px' : '8px',
                borderRadius: '50%',
                background: currentSlide === index ? 'white' : 'rgba(255, 255, 255, 0.5)',
                border: 'none',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
              aria-label={`Slide ${index + 1}`}
              role="tab"
              aria-selected={currentSlide === index}
            />
          ))}
        </div>

        {/* Instagram Link (hidden but accessible) */}
        <a
          href={instagram.profileUrl}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            position: 'absolute',
            width: '1px',
            height: '1px',
            padding: 0,
            margin: '-1px',
            overflow: 'hidden',
            clip: 'rect(0, 0, 0, 0)',
            whiteSpace: 'nowrap',
            border: 0,
          }}
        >
          Besuche unseren Instagram Account: {instagram.username}
        </a>
      </div>
    </div>
  );
}
