'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Maximize2 } from '@/components/ui/icons';
import { DashboardInstagram } from '@/types/dashboard';

interface NewsFeedProps {
  instagram: DashboardInstagram;
}

export function NewsFeed({ instagram }: NewsFeedProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const totalSlides = 3; // Placeholder count

  return (
    <Card variant="secondary" rounded="lg" className="relative overflow-hidden h-full">
      {/* Expand button */}
      <button
        className="absolute top-4 right-4 w-6 h-6 bg-[--color-saele-secondary-light] rounded-[5px] flex items-center justify-center hover:opacity-80 transition-opacity z-10"
        aria-label="News erweitern"
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
          News
        </h3>

        {/* Placeholder Cards */}
        <div className="flex-1 flex flex-col gap-4 mb-6">
          {/* Card 1 */}
          <div className="bg-white rounded-[15px] h-32 lg:h-40 flex items-center justify-center">
            <p className="text-[--color-saele-secondary] text-sm opacity-50">
              Instagram Post 1
            </p>
          </div>

          {/* Card 2 - Hidden on mobile */}
          <div className="hidden md:flex bg-white rounded-[15px] h-32 lg:h-40 items-center justify-center">
            <p className="text-[--color-saele-secondary] text-sm opacity-50">
              Instagram Post 2
            </p>
          </div>

          {/* Card 3 - Hidden on mobile and tablet */}
          <div className="hidden lg:flex bg-white rounded-[15px] h-32 lg:h-40 items-center justify-center">
            <p className="text-[--color-saele-secondary] text-sm opacity-50">
              Instagram Post 3
            </p>
          </div>
        </div>

        {/* Pagination Dots */}
        <div className="flex items-center justify-center gap-2" role="tablist" aria-label="News Pagination">
          {[...Array(totalSlides)].map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`w-2 h-2 rounded-full transition-all duration-200 ${
                currentSlide === index
                  ? 'bg-white w-3'
                  : 'bg-white/50 hover:bg-white/70'
              }`}
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
          className="sr-only"
        >
          Besuche unseren Instagram Account: {instagram.username}
        </a>
      </div>
    </Card>
  );
}
