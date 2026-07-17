'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { SearchInput } from '@/components/ui/SearchInput';
import { Pagination } from '@/components/ui/Pagination';
import { DataTable, ColumnDef } from '@/components/admin/DataTable';
import { FilterBar } from '@/components/admin/FilterBar';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { Modal } from '@/components/ui/Modal';
import type { IAuditLog } from '@/types';

export default function AuditLogPage() {
  const [logs, setLogs] = useState<IAuditLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 20;

  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState<Record<string, string>>({});
  
  const [selectedLog, setSelectedLog] = useState<IAuditLog | null>(null);

  const loadData = () => {
    Promise.resolve().then(() => setIsLoading(true));
    const query = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      search,
      ...filters
    });

    fetch(`/api/admin/audit-log?${query.toString()}`)
      .then(res => res.json())
      .then(data => {
        setLogs(data.data || []);
        if (data.pagination) setTotalPages(data.pagination.totalPages);
      })
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      loadData();
    }, 300);
    return () => clearTimeout(timer);
  }, [page, search, filters]);

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPage(1);
  };

  const columns: ColumnDef<IAuditLog>[] = [
    {
      key: 'createdAt',
      header: 'Waktu',
      render: (item) => format(new Date(item.createdAt), 'dd MMM yyyy HH:mm:ss', { locale: id }),
      width: '180px'
    },
    {
      key: 'user',
      header: 'User',
      render: (item) => item.user ? (
        <div>
          <div className="font-semibold">{item.user.name}</div>
          <div className="text-xs text-slate-500">{item.user.email}</div>
        </div>
      ) : 'Sistem'
    },
    {
      key: 'action',
      header: 'Aksi',
      render: (item) => {
        const variants: Record<string, 'success' | 'warning' | 'danger' | 'primary' | 'default'> = {
          create: 'success',
          update: 'warning',
          delete: 'danger',
          login: 'primary',
          import: 'primary',
        };
        const variant = variants[item.action] || 'default';
        return <Badge variant={variant}>{item.action.toUpperCase()}</Badge>;
      }
    },
    {
      key: 'resource',
      header: 'Resource',
      render: (item) => <span className="font-mono text-xs">{item.resource}</span>
    },
    {
      key: 'details',
      header: 'Detail',
      render: (item) => (
        <Button variant="ghost" size="sm" onClick={() => setSelectedLog(item)}>
          Lihat Detail
        </Button>
      ),
      align: 'right'
    }
  ];

  const filterDefs = [
    {
      key: 'action',
      placeholder: 'Semua Aksi',
      options: [
        { label: 'Create', value: 'create' },
        { label: 'Update', value: 'update' },
        { label: 'Delete', value: 'delete' },
        { label: 'Login', value: 'login' },
        { label: 'Import', value: 'import' },
      ]
    },
    {
      key: 'resource',
      placeholder: 'Semua Resource',
      options: [
        { label: 'Event', value: 'Event' },
        { label: 'User', value: 'User' },
        { label: 'Participant', value: 'Participant' },
        { label: 'Booth', value: 'Booth' },
        { label: 'Ticket', value: 'Ticket' },
        { label: 'TicketOrder', value: 'TicketOrder' },
        { label: 'News', value: 'News' },
        { label: 'Schedule', value: 'Schedule' },
        { label: 'Gallery', value: 'Gallery' },
      ]
    }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-900">Audit Log Viewer</h1>
        <p className="text-xs text-slate-500">Pantau seluruh aktivitas pengguna dan sistem.</p>
      </div>

      <Card className="p-4 space-y-4">
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="w-full max-w-xs">
            <SearchInput 
              placeholder="Cari metadata..." 
              onChange={(val) => { setSearch(val); setPage(1); }} 
            />
          </div>
          <FilterBar 
            filters={filterDefs} 
            values={filters} 
            onChange={handleFilterChange} 
          />
        </div>

        <DataTable
          data={logs}
          columns={columns}
          isLoading={isLoading}
          keyExtractor={(item) => item._id || ''}
        />

        <Pagination
          currentPage={page}
          totalPages={totalPages}
          onPageChange={setPage}
        />
      </Card>

      <Modal 
        isOpen={!!selectedLog} 
        onClose={() => setSelectedLog(null)} 
        title="Detail Audit Log"
      >
        {selectedLog && (
          <div className="space-y-4 p-2">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="block text-xs text-slate-500 font-semibold mb-1">Aksi</span>
                <Badge>{selectedLog.action.toUpperCase()}</Badge>
              </div>
              <div>
                <span className="block text-xs text-slate-500 font-semibold mb-1">Waktu</span>
                {format(new Date(selectedLog.createdAt), 'dd MMM yyyy HH:mm:ss')}
              </div>
              <div>
                <span className="block text-xs text-slate-500 font-semibold mb-1">Resource</span>
                <span className="font-mono">{selectedLog.resource}</span>
              </div>
              <div>
                <span className="block text-xs text-slate-500 font-semibold mb-1">Resource ID</span>
                <span className="font-mono text-xs">{selectedLog.resourceId || '-'}</span>
              </div>
              <div>
                <span className="block text-xs text-slate-500 font-semibold mb-1">User / Aktor</span>
                {selectedLog.user ? `${selectedLog.user.name} (${selectedLog.user.email})` : 'Sistem'}
              </div>
              <div>
                <span className="block text-xs text-slate-500 font-semibold mb-1">IP Address</span>
                <span className="font-mono text-xs">{selectedLog.ip || 'Unknown'}</span>
              </div>
            </div>
            
            <div>
              <span className="block text-xs text-slate-500 font-semibold mb-1">Metadata (JSON)</span>
              <pre className="bg-slate-900 text-slate-50 p-4 rounded-lg text-xs overflow-x-auto">
                {JSON.stringify(selectedLog.metadata, null, 2)}
              </pre>
            </div>
            
            <div>
              <span className="block text-xs text-slate-500 font-semibold mb-1">User Agent</span>
              <div className="text-xs bg-slate-100 p-2 rounded border">{selectedLog.userAgent || 'Unknown'}</div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
