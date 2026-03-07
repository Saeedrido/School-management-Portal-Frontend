import React from 'react';
import { Box } from '@mui/material';

/**
 * PageLayout Component
 *
 * Provides consistent dark gradient background with decorative orbs
 * across all pages, matching the login/register design.
 *
 * @param {ReactNode} children - The page content to render
 * @param {Object} options - Optional configuration
 * @param {boolean} options.showDecorations - Show decorative gradient orbs (default: true)
 * @param {string} options.maxWidth - Maximum width of content container (default: 'md')
 * @param {boolean} options.centered - Center the content (default: true)
 */
const PageLayout = ({ children, showDecorations = true, maxWidth = 'md', centered = true }) => {
  const maxWidthValue = typeof maxWidth === 'number' ? maxWidth :
    maxWidth === 'xs' ? 444 :
    maxWidth === 'sm' ? 600 :
    maxWidth === 'md' ? 900 :
    maxWidth === 'lg' ? 1200 :
    maxWidth === 'xl' ? 1536 :
    900; // default to md

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(180deg, #0a192f 0%, #0d1b2a 40%, #000000 100%)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Decorative Gradient Orbs */}
      {showDecorations && (
        <>
          {/* Top Left - Blue */}
          <Box
            sx={{
              position: 'absolute',
              top: '-10%',
              left: '-10%',
              width: '500px',
              height: '500px',
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(33, 150, 243, 0.15) 0%, transparent 70%)',
              pointerEvents: 'none',
              zIndex: 0,
            }}
          />
          {/* Top Right - Light Blue */}
          <Box
            sx={{
              position: 'absolute',
              top: '-5%',
              right: '-5%',
              width: '400px',
              height: '400px',
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(76, 175, 190, 0.1) 0%, transparent 70%)',
              pointerEvents: 'none',
              zIndex: 0,
            }}
          />
          {/* Bottom Right - Dark Blue */}
          <Box
            sx={{
              position: 'absolute',
              bottom: '-10%',
              right: '-10%',
              width: '600px',
              height: '600px',
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(63, 81, 181, 0.08) 0%, transparent 70%)',
              pointerEvents: 'none',
              zIndex: 0,
            }}
          />
        </>
      )}

      {/* Content Container */}
      <Box
        sx={{
          position: 'relative',
          zIndex: 1,
          minHeight: '100vh',
          ...(centered && {
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            p: 2,
          }),
        }}
      >
        <Box
          sx={{
            width: '100%',
            maxWidth: maxWidthValue,
            ...(centered && {
              mx: 'auto',
            }),
          }}
        >
          {children}
        </Box>
      </Box>
    </Box>
  );
};

export default PageLayout;
