'use client';

import {
  FlaskConicalIcon,
  Breadcrumbs,
  Button,
  Badge,
  Card,
  CardContent,
  ArrowRightIcon,
  RefreshCwIcon,
  TableEmptyRow,
  PageHeader,
  FilterBar,
  FilterBarRow,
  FilterBarGroup,
  FilterBarSearch,
  FilterBarSelect,
} from '@/components/ui';

import React, { useState } from 'react';
import { caseStore } from '../../lib/case-store';

export default function CasesRegistryPage() {
  const [modeFilter, setModeFilter] = useState<'all' | 'CLINICAL' | 'VALIDATION' | 'RESEARCH'>(
    'all',
  );
  const [indicationFilter, setIndicationFilter] = useState<string>('all');
  const [stateFilter, setStateFilter] = useState<'all' | 'awaiting_review' | 'stale' | 'signed'>(
    'all',
  );
  const [search, setSearch] = useState('');
  const allCases = caseStore.getAllCases();

  // Extract unique indications
  const uniqueIndications = Array.from(new Set(allCases.map(c => c.indication))).sort();

  const filteredCases = allCases.filter(c => {
    // Mode filter (§38)
    if (modeFilter !== 'all' && c.mode.toUpperCase() !== modeFilter) return false;

    // Indication filter (§39)
    if (indicationFilter !== 'all' && c.indication !== indicationFilter) return false;

    // State filter
    if (
      stateFilter === 'awaiting_review' &&
      !(c.state === 'target_slate_ready' || c.state === 'phenotype_ready')
    )
      return false;
    if (stateFilter === 'stale' && !c.isStale) return false;
    if (stateFilter === 'signed' && c.state !== 'decision_signed') return false;

    // Search query filter
    if (search.trim()) {
      const q = search.toLowerCase();
      const matchesSearch =
        c.code.toLowerCase().includes(q) ||
        c.title.toLowerCase().includes(q) ||
        c.indication.toLowerCase().includes(q);
      if (!matchesSearch) return false;
    }

    return true;
  });

  return (
    <div className="container page-container-col">
      <Breadcrumbs
        items={[
          { label: 'Home', href: '/' },
          { label: 'Cases', current: true },
        ]}
      />

      {/* Registry Page Header (§28, §152) */}
      <PageHeader
        title="Clinical Case Registry"
        subtitle="Authoritative clinical registry of active TMS target planning cases, indications, and workflow states."
        actions={
          <>
            <Button variant="primary" href="/cases/new">
              + Create New Case
            </Button>
            <Button
              variant="secondary"
              href="/validation"
              title="Open Validation and Golden Cases harness"
            >
              <FlaskConicalIcon size={14} className="mr-1 inline text-cyan" /> Golden Cases Suite
            </Button>
            <Button
              variant="secondary"
              onClick={() => {
                caseStore.resetToGoldenCases();
                window.location.reload();
              }}
              title="Reset active in-memory case store to default state"
            >
              Reset Store <RefreshCwIcon size={14} className="ml-1 inline" />
            </Button>
          </>
        }
      />

      {/* Filter and Search Bar (§38–39) */}
      <FilterBar stacked>
        <FilterBarRow justify="between">
          {/* Mode Filter (§38) */}
          <FilterBarGroup label="MODE:">
            {(['all', 'CLINICAL', 'VALIDATION', 'RESEARCH'] as const).map(m => (
              <Button
                variant={modeFilter === m ? 'primary' : 'secondary'}
                key={m}
                size="sm"
                className="text-xs py-1 px-2.5"
                onClick={() => setModeFilter(m)}
              >
                {m === 'all' ? 'All Modes' : m}
              </Button>
            ))}
          </FilterBarGroup>

          {/* Search Box */}
          <FilterBarSearch
            value={search}
            onChange={e => setSearch(e.target.value)}
            onClear={() => setSearch('')}
            placeholder="Filter cases by code, title..."
            className="global-search-input"
          />
        </FilterBarRow>

        <FilterBarRow justify="between" divider>
          {/* Indication Filter (§39) */}
          <FilterBarGroup label="INDICATION:">
            <Button
              variant={indicationFilter === 'all' ? 'primary' : 'secondary'}
              size="sm"
              className="text-xs py-1 px-2"
              onClick={() => setIndicationFilter('all')}
            >
              All
            </Button>
            {uniqueIndications.map(ind => (
              <Button
                variant={indicationFilter === ind ? 'primary' : 'secondary'}
                key={ind}
                size="sm"
                className="text-xs py-1 px-2"
                onClick={() => setIndicationFilter(ind)}
              >
                {ind}
              </Button>
            ))}
          </FilterBarGroup>

          {/* Quick status filters */}
          <FilterBarGroup label="STATUS:">
            <FilterBarSelect
              value={stateFilter}
              onChange={e => setStateFilter(e.target.value as any)}
            >
              <option value="all">All Statuses ({allCases.length})</option>
              <option value="awaiting_review">Awaiting Review</option>
              <option value="stale">Stale Slates ({allCases.filter(c => c.isStale).length})</option>
              <option value="signed">Signed</option>
            </FilterBarSelect>
          </FilterBarGroup>
        </FilterBarRow>
      </FilterBar>

      {/* Cases Registry Table */}
      <Card>
        <CardContent className="p-0">
          <div className="comparison-table-wrapper">
            <table className="comparison-table" aria-label="Clinical Cases Registry Table">
              <thead>
                <tr>
                  <th scope="col">Case Code</th>
                  <th scope="col">Case Title / Clinical Hypothesis</th>
                  <th scope="col">Mode</th>
                  <th scope="col">Indication</th>
                  <th scope="col">Lifecycle State</th>
                  <th scope="col">Slate Status</th>
                  <th scope="col">Clinical Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredCases.length === 0 && (
                  <TableEmptyRow
                    colSpan={7}
                    message="No clinical cases match the selected filter criteria."
                    subMessage="Try adjusting your search query, mode filter, or status filter."
                  />
                )}
                {filteredCases.map(c => (
                  <tr key={c.id}>
                    <td>
                      <strong className="font-mono text-cyan">{c.code}</strong>
                    </td>
                    <td>
                      <div>
                        <strong>{c.title}</strong>
                      </div>
                      <div className="text-xs text-secondary mt-0.5">Case ID: {c.id}</div>
                    </td>
                    <td>
                      <Badge
                        className={`${c.mode.toUpperCase() === 'CLINICAL' ? 'badge-clinical' : c.mode.toUpperCase() === 'RESEARCH' ? 'badge-research' : 'badge-validation'} text-xs`}
                      >
                        {c.mode.toUpperCase()}
                      </Badge>
                    </td>
                    <td>
                      <Badge variant="neutral">{c.indication}</Badge>
                    </td>
                    <td>
                      <Badge variant="tier1">{c.state}</Badge>
                    </td>
                    <td>
                      {c.isStale ? (
                        <Badge variant="tier3">STALE SLATE</Badge>
                      ) : (
                        <Badge variant="tier1">CURRENT</Badge>
                      )}
                    </td>
                    <td>
                      <div className="flex gap-2">
                        <Button variant="secondary" href={`/cases/${c.id}`} className="p-1 text-xs">
                          Overview
                        </Button>
                        <Button
                          variant="primary"
                          href={`/cases/${c.id}/targets`}
                          className="p-1 text-xs"
                        >
                          Target Slate <ArrowRightIcon size={14} className="ml-1 inline" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
