import React from 'react';
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Paper,
  Typography,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  Checkbox,
  useTheme,
} from '@mui/material';
import { MoreVert, Search } from '@mui/icons-material';
import { useState } from 'react';

const ModernTable = ({
  columns,
  data,
  page = 0,
  rowsPerPage = 10,
  totalRows = 0,
  onPageChange,
  onRowsPerPageChange,
  onRowClick,
  selectable = false,
  selected = [],
  onSelectAll,
  onSelectRow,
  loading = false,
  emptyMessage = 'No data available',
  actions = true,
}) => {
  const theme = useTheme();
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedRow, setSelectedRow] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const handleMenuOpen = (event, row) => {
    setAnchorEl(event.currentTarget);
    setSelectedRow(row);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedRow(null);
  };

  // Filter data based on search
  const filteredData = searchTerm
    ? data.filter(row => 
        columns.some(col => {
          const value = col.render ? col.render(row) : row[col.field];
          return value && String(value).toLowerCase().includes(searchTerm.toLowerCase());
        })
      )
    : data;

  return (
    <Paper
      sx={{
        borderRadius: 3,
        boxShadow: '0 2px 12px rgba(0, 0, 0, 0.06)',
        overflow: 'hidden',
        border: '1px solid rgba(111, 175, 143, 0.1)',
      }}
    >
      {/* Search Bar */}
      <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            backgroundColor: 'background.default',
            borderRadius: 2,
            px: 2,
            py: 0.5,
            maxWidth: 300,
          }}
        >
          <Search sx={{ color: 'text.secondary', mr: 1 }} />
          <input
            type="text"
            placeholder="Search..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              border: 'none',
              outline: 'none',
              background: 'transparent',
              width: '100%',
              padding: '8px 0',
              fontSize: '0.875rem',
            }}
          />
        </Box>
      </Box>

      <TableContainer>
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: 'rgba(111, 175, 143, 0.05)' }}>
              {selectable && (
                <TableCell padding="checkbox">
                  <Checkbox
                    checked={selected.length === data.length && data.length > 0}
                    indeterminate={selected.length > 0 && selected.length < data.length}
                    onChange={(e) => onSelectAll && onSelectAll(e.target.checked)}
                    sx={{ color: 'primary.main' }}
                  />
                </TableCell>
              )}
              {columns.map((column) => (
                <TableCell
                  key={column.field}
                  sx={{
                    fontWeight: 600,
                    color: 'text.secondary',
                    fontSize: '0.75rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                    py: 2,
                    borderBottom: '2px solid rgba(111, 175, 143, 0.2)',
                  }}
                >
                  {column.headerName}
                </TableCell>
              ))}
              {actions && (
                <TableCell 
                  align="right"
                  sx={{
                    fontWeight: 600,
                    color: 'text.secondary',
                    fontSize: '0.75rem',
                    textTransform: 'uppercase',
                    py: 2,
                    borderBottom: '2px solid rgba(111, 175, 143, 0.2)',
                  }}
                >
                  Actions
                </TableCell>
              )}
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={columns.length + (selectable ? 1 : 0) + (actions ? 1 : 0)} align="center" sx={{ py: 8 }}>
                  <Typography color="text.secondary">Loading...</Typography>
                </TableCell>
              </TableRow>
            ) : filteredData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length + (selectable ? 1 : 0) + (actions ? 1 : 0)} align="center" sx={{ py: 8 }}>
                  <Typography color="text.secondary">{emptyMessage}</Typography>
                </TableCell>
              </TableRow>
            ) : (
              filteredData.map((row, index) => (
                <TableRow
                  key={row.id || index}
                  onClick={() => onRowClick && onRowClick(row)}
                  sx={{
                    '&:hover': {
                      backgroundColor: 'rgba(111, 175, 143, 0.03)',
                    },
                    cursor: onRowClick ? 'pointer' : 'default',
                    borderBottom: '1px solid',
                    borderColor: 'divider',
                  }}
                >
                  {selectable && (
                    <TableCell padding="checkbox">
                      <Checkbox
                        checked={selected.includes(row.id)}
                        onChange={() => onSelectRow && onSelectRow(row.id)}
                        onClick={(e) => e.stopPropagation()}
                        sx={{ color: 'primary.main' }}
                      />
                    </TableCell>
                  )}
                  {columns.map((column) => (
                    <TableCell key={column.field} sx={{ py: 2 }}>
                      {column.render ? column.render(row) : row[column.field]}
                    </TableCell>
                  ))}
                  {actions && (
                    <TableCell align="right" sx={{ py: 1 }}>
                      <IconButton
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleMenuOpen(e, row);
                        }}
                        sx={{ 
                          color: 'text.secondary',
                          '&:hover': { backgroundColor: 'rgba(111, 175, 143, 0.1)' },
                        }}
                      >
                        <MoreVert fontSize="small" />
                      </IconButton>
                    </TableCell>
                  )}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Pagination */}
      <TablePagination
        component="div"
        count={totalRows}
        page={page}
        onPageChange={onPageChange}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={onRowsPerPageChange}
        rowsPerPageOptions={[5, 10, 25, 50]}
        sx={{
          borderTop: '1px solid',
          borderColor: 'divider',
          '.MuiTablePagination-selectLabel, .MuiTablePagination-displayedRows': {
            fontSize: '0.875rem',
          },
        }}
      />

      {/* Actions Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        PaperProps={{
          sx: {
            borderRadius: 2,
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
            mt: 1,
          },
        }}
      >
        {selectedRow?.menuItems?.map((item, index) => (
          <MenuItem
            key={index}
            onClick={() => {
              item.onClick(selectedRow);
              handleMenuClose();
            }}
            sx={{
              fontSize: '0.875rem',
              py: 1.5,
              px: 3,
              '&:hover': { backgroundColor: 'rgba(111, 175, 143, 0.1)' },
            }}
          >
            {item.label}
          </MenuItem>
        ))}
      </Menu>
    </Paper>
  );
};

export default ModernTable;
