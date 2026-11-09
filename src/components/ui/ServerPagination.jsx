import React from 'react';
import { Box, Button, Typography } from '@mui/material';
import { ChevronLeft, ChevronRight } from '@mui/icons-material';

/**
 * Shared server-side pagination footer.
 *
 * @param {number} page - current page (1-based)
 * @param {number} pageSize - rows per page
 * @param {number} totalCount - total rows reported by the API
 * @param {function} onPageChange - called with the next page number
 * @param {string} itemLabel - label used in the range summary
 * @param {boolean} loading - disables the controls while a request is in flight
 */
const ServerPagination = ({
  page = 1,
  pageSize = 10,
  totalCount = 0,
  onPageChange,
  itemLabel = 'records',
  loading = false,
}) => {
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));

  if (!totalCount || totalPages <= 1) {
    return null;
  }

  const start = (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, totalCount);

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 2,
        mt: 2,
      }}
    >
      <Typography variant="body2" sx={{ color: '#64748B' }}>
        Showing {start}-{end} of {totalCount} {itemLabel}
      </Typography>

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <Button
          variant="outlined"
          size="small"
          disabled={loading || page <= 1}
          onClick={() => onPageChange?.(page - 1)}
          startIcon={<ChevronLeft />}
          sx={{
            borderColor: '#6FAF8F',
            color: '#6FAF8F',
            '&:hover': { borderColor: '#5A9A7A', bgcolor: 'rgba(111,175,143,0.05)' },
          }}
        >
          Previous
        </Button>
        <Typography variant="body2" sx={{ color: '#64748B', whiteSpace: 'nowrap' }}>
          Page {page} of {totalPages}
        </Typography>
        <Button
          variant="outlined"
          size="small"
          disabled={loading || page >= totalPages}
          onClick={() => onPageChange?.(page + 1)}
          endIcon={<ChevronRight />}
          sx={{
            borderColor: '#6FAF8F',
            color: '#6FAF8F',
            '&:hover': { borderColor: '#5A9A7A', bgcolor: 'rgba(111,175,143,0.05)' },
          }}
        >
          Next
        </Button>
      </Box>
    </Box>
  );
};

export default ServerPagination;
