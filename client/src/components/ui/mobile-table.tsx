import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  Home,
  Mail,
  Phone,
  Search,
  Users,
} from 'lucide-react';
import { ReactNode, useMemo, useState } from 'react';

// Enhanced type definitions
interface Column<T = any> {
  key: keyof T | string;
  label: string;
  render?: (value: any, row: T) => ReactNode;
  hideOnMobile?: boolean;
  sortable?: boolean;
  searchable?: boolean;
  width?: string;
}

interface MobileTableProps<T = any> {
  title: string;
  data: T[];
  columns: Column<T>[];
  actions?: ReactNode;
  searchable?: boolean;
  sortable?: boolean;
  emptyMessage?: string;
  isLoading?: boolean;
  mobileCardView?: boolean;
  onRowClick?: (row: T) => void;
}

type SortDirection = 'asc' | 'desc' | null;

interface SortState {
  column: string | null;
  direction: SortDirection;
}

// Enhanced Mobile Table Component
export function MobileTable<T extends Record<string, any>>({
  title,
  data,
  columns,
  actions,
  searchable = false,
  sortable = false,
  emptyMessage = 'No data available',
  isLoading = false,
  mobileCardView = true,
  onRowClick,
}: MobileTableProps<T>) {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortState, setSortState] = useState<SortState>({
    column: null,
    direction: null,
  });

  // Filter data based on search term
  const filteredData = useMemo(() => {
    if (!searchTerm) return data;

    const searchableColumns = columns.filter(col => col.searchable !== false);

    return data.filter(row =>
      searchableColumns.some(column =>
        String(row[column.key]).toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
  }, [data, searchTerm, columns]);

  // Sort data
  const sortedData = useMemo(() => {
    if (!sortState.column || !sortState.direction) return filteredData;

    return [...filteredData].sort((a, b) => {
      const aValue = a[sortState.column!];
      const bValue = b[sortState.column!];

      if (aValue === bValue) return 0;

      const isAscending = sortState.direction === 'asc';

      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return isAscending ? aValue - bValue : bValue - aValue;
      }

      const aString = String(aValue).toLowerCase();
      const bString = String(bValue).toLowerCase();

      if (aString < bString) return isAscending ? -1 : 1;
      if (aString > bString) return isAscending ? 1 : -1;
      return 0;
    });
  }, [filteredData, sortState]);

  const handleSort = (columnKey: string) => {
    if (!sortable) return;

    setSortState(prev => {
      if (prev.column !== columnKey) {
        return { column: columnKey, direction: 'asc' };
      }

      if (prev.direction === 'asc') {
        return { column: columnKey, direction: 'desc' };
      }

      return { column: null, direction: null };
    });
  };

  const getSortIcon = (columnKey: string) => {
    if (sortState.column !== columnKey) {
      return <ArrowUpDown className='w-4 h-4 text-gray-400' />;
    }

    return sortState.direction === 'asc' ? (
      <ArrowUp className='w-4 h-4 text-blue-600' />
    ) : (
      <ArrowDown className='w-4 h-4 text-blue-600' />
    );
  };

  // Mobile card view component
  const MobileCard = ({ row, index }: { row: T; index: number }) => (
    <div
      key={index}
      className={`p-4 border border-gray-200 rounded-lg space-y-3 ${
        onRowClick ? 'cursor-pointer hover:bg-gray-50 transition-colors' : ''
      }`}
      onClick={() => onRowClick?.(row)}
    >
      {columns.map(column => {
        if (column.hideOnMobile) return null;

        const value = row[column.key];
        const displayValue = column.render ? column.render(value, row) : value;

        return (
          <div
            key={String(column.key)}
            className='flex justify-between items-center'
          >
            <span className='text-sm font-medium text-gray-500'>
              {column.label}:
            </span>
            <span className='text-sm text-gray-900'>{displayValue}</span>
          </div>
        );
      })}
    </div>
  );

  return (
    <Card className='w-full'>
      <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-4'>
        <CardTitle className='text-xl font-semibold'>{title}</CardTitle>
        <div className='flex items-center space-x-2'>{actions}</div>
      </CardHeader>
      <CardContent className='space-y-4'>
        {/* Search bar */}
        {searchable && (
          <div className='relative'>
            <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4' />
            <Input
              placeholder='Search...'
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className='pl-10'
            />
          </div>
        )}

        {/* Loading state */}
        {isLoading ? (
          <div className='flex items-center justify-center py-8'>
            <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600'></div>
          </div>
        ) : (
          <>
            {/* Desktop table view */}
            <div
              className={`overflow-x-auto ${mobileCardView ? 'hidden sm:block' : ''}`}
            >
              <Table>
                <TableHeader>
                  <TableRow>
                    {columns.map(column => (
                      <TableHead
                        key={String(column.key)}
                        className={`${column.hideOnMobile ? 'hidden md:table-cell' : ''} ${
                          sortable && column.sortable !== false
                            ? 'cursor-pointer select-none'
                            : ''
                        }`}
                        style={{ width: column.width }}
                        onClick={() =>
                          sortable &&
                          column.sortable !== false &&
                          handleSort(String(column.key))
                        }
                      >
                        <div className='flex items-center space-x-1'>
                          <span>{column.label}</span>
                          {sortable &&
                            column.sortable !== false &&
                            getSortIcon(String(column.key))}
                        </div>
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedData.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={columns.length}
                        className='text-center py-8 text-gray-500'
                      >
                        {emptyMessage}
                      </TableCell>
                    </TableRow>
                  ) : (
                    sortedData.map((row, index) => (
                      <TableRow
                        key={index}
                        className={
                          onRowClick ? 'cursor-pointer hover:bg-gray-50' : ''
                        }
                        onClick={() => onRowClick?.(row)}
                      >
                        {columns.map(column => (
                          <TableCell
                            key={String(column.key)}
                            className={
                              column.hideOnMobile ? 'hidden md:table-cell' : ''
                            }
                          >
                            {column.render
                              ? column.render(row[column.key], row)
                              : row[column.key]}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Mobile card view */}
            {mobileCardView && (
              <div className='sm:hidden space-y-3'>
                {sortedData.length === 0 ? (
                  <div className='text-center py-8 text-gray-500'>
                    {emptyMessage}
                  </div>
                ) : (
                  sortedData.map((row, index) => (
                    <MobileCard key={index} row={row} index={index} />
                  ))
                )}
              </div>
            )}
          </>
        )}

        {/* Results summary */}
        {!isLoading && (
          <div className='text-sm text-gray-500 pt-2 border-t'>
            Showing {sortedData.length} of {data.length} results
            {searchTerm && ` for "${searchTerm}"`}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Example usage with YUTHUB housing data
export function YouthHousingTable() {
  const housingData = [
    {
      id: 1,
      clientName: 'Westminster City Council',
      region: 'London',
      population: 261000,
      socialHousingUnits: 12500,
      partnershipStatus: 'Active Client',
      contactName: 'Sarah Mitchell',
      contactEmail: 'sarah.mitchell@westminster.gov.uk',
      contactPhone: '+44 20 7641 6000',
      defaultRate: 485.0,
    },
    {
      id: 2,
      clientName: 'Camden Council',
      region: 'London',
      population: 270000,
      socialHousingUnits: 15200,
      partnershipStatus: 'Active Client',
      contactName: 'Michael Chen',
      contactEmail: 'michael.chen@camden.gov.uk',
      contactPhone: '+44 20 7974 4444',
      defaultRate: 465.0,
    },
    {
      id: 3,
      clientName: 'Hackney Council',
      region: 'London',
      population: 279000,
      socialHousingUnits: 18900,
      partnershipStatus: 'Trial Period',
      contactName: 'Rebecca Johnson',
      contactEmail: 'rebecca.johnson@hackney.gov.uk',
      contactPhone: '+44 20 8356 5000',
      defaultRate: 475.0,
    },
  ];

  const columns = [
    {
      key: 'clientName',
      label: 'Council',
      render: (value: string, row: any) => (
        <div className='flex items-center space-x-2'>
          <Home className='w-4 h-4 text-blue-600' />
          <div>
            <div className='font-medium'>{value}</div>
            <div className='text-sm text-gray-500'>{row.region}</div>
          </div>
        </div>
      ),
      width: '250px',
    },
    {
      key: 'population',
      label: 'Population',
      render: (value: number) => (
        <div className='flex items-center space-x-1'>
          <Users className='w-4 h-4 text-gray-400' />
          <span>{value.toLocaleString()}</span>
        </div>
      ),
      sortable: true,
      hideOnMobile: true,
    },
    {
      key: 'socialHousingUnits',
      label: 'Housing Units',
      render: (value: number) => (
        <span className='font-medium'>{value.toLocaleString()}</span>
      ),
      sortable: true,
    },
    {
      key: 'partnershipStatus',
      label: 'Status',
      render: (value: string) => {
        const variant =
          value === 'Active Client'
            ? 'default'
            : value === 'Trial Period'
              ? 'secondary'
              : 'outline';
        return <Badge variant={variant}>{value}</Badge>;
      },
      sortable: true,
    },
    {
      key: 'contactName',
      label: 'Contact',
      render: (value: string, row: any) => (
        <div className='space-y-1'>
          <div className='font-medium'>{value}</div>
          <div className='flex items-center space-x-1 text-sm text-gray-500'>
            <Mail className='w-3 h-3' />
            <span>{row.contactEmail}</span>
          </div>
          <div className='flex items-center space-x-1 text-sm text-gray-500'>
            <Phone className='w-3 h-3' />
            <span>{row.contactPhone}</span>
          </div>
        </div>
      ),
      hideOnMobile: true,
      width: '250px',
    },
    {
      key: 'defaultRate',
      label: 'Rate',
      render: (value: number) => (
        <span className='font-mono'>£{value.toFixed(2)}</span>
      ),
      sortable: true,
      hideOnMobile: true,
    },
  ];

  const handleRowClick = (row: any) => {
    alert(`Clicked on ${row.clientName}`);
  };

  return (
    <div className='p-6 space-y-6'>
      <MobileTable
        title='Youth Housing Partners'
        data={housingData}
        columns={columns}
        searchable
        sortable
        mobileCardView
        onRowClick={handleRowClick}
        actions={
          <Button size='sm' className='bg-blue-600 hover:bg-blue-700'>
            Add Partner
          </Button>
        }
        emptyMessage='No housing partners found'
      />
    </div>
  );
}
