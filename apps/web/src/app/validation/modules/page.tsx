import {
  Breadcrumbs,
  Button,
  Badge,
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  ArrowRightIcon,
  ArrowLeftIcon,
  TableEmptyRow,
  PageHeader,
} from '@/components/ui';
import React from 'react';
import { getAllModuleUiDescriptors, type IndicationModuleUiDescriptor } from '@magniom/presentation';

// ==========================================
// Validation Module Qualification (§196)
// Module Q-level progression dashboard.
// ==========================================

const MODULE_QUAL_INFO: Record<string, { qualification_level: string; effective_permission: string; is_authorised: boolean }> = {
  MDD: { qualification_level: 'Q8', effective_permission: 'clinical', is_authorised: true },
  PAIN: { qualification_level: 'Q6', effective_permission: 'validation', is_authorised: false },
  STROKE_MOTOR: { qualification_level: 'Q5', effective_permission: 'validation', is_authorised: false },
  STROKE_APHASIA: { qualification_level: 'Q5', effective_permission: 'validation', is_authorised: false },
  OCD: { qualification_level: 'Q5', effective_permission: 'validation', is_authorised: false },
  TINNITUS: { qualification_level: 'Q0', effective_permission: 'research', is_authorised: false },
  TBI: { qualification_level: 'Q1', effective_permission: 'research', is_authorised: false },
  SUD: { qualification_level: 'Q4', effective_permission: 'validation', is_authorised: false },
};

export default function ValidationModulesPage() {
  const descriptors = getAllModuleUiDescriptors();

  return (
    <div className="container page-container-col">
      <Breadcrumbs
        items={[
          { label: 'Validation', href: '/validation' },
          { label: 'Module Qualification', current: true },
        ]}
      />

      <PageHeader
        eyebrow={
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="tier2">VALIDATION ENVIRONMENT</Badge>
            <Badge variant="neutral">Module Qualification</Badge>
          </div>
        }
        title="Module Qualification Status"
        subtitle="Q-level progression for all indication modules (Q0–Q8). Clinical authorisation requires full compatibility configuration (§196, §71)."
      />


      <Card>
        <CardHeader>
          <CardTitle as="h2" className="text-cyan">
            Module Release Qualifications
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="comparison-table-wrapper">
            <table className="comparison-table" aria-label="Module Qualification Status">
              <thead>
                <tr>
                  <th scope="col">Module</th>
                  <th scope="col">Indication</th>
                  <th scope="col">Version</th>
                  <th scope="col">Q-Level</th>
                  <th scope="col">Permission</th>
                  <th scope="col">Clinical Authority</th>
                </tr>
              </thead>
              <tbody>
                {descriptors.length === 0 ? (
                  <TableEmptyRow
                    colSpan={6}
                    message="No modules available for qualification."
                  />
                ) : (
                  descriptors.map((mod: IndicationModuleUiDescriptor) => {
                    const info = MODULE_QUAL_INFO[mod.indication_code] || {
                      qualification_level: 'Q0',
                      effective_permission: 'research',
                      is_authorised: false,
                    };
                    return (
                      <tr key={mod.indication_module_release_id}>
                        <td><strong>{mod.indication_name}</strong></td>
                        <td><code className="text-cyan text-xs">{mod.indication_code}</code></td>
                        <td>{mod.indication_module_release_id}</td>
                        <td>
                          <Badge className={`${info.qualification_level === 'Q8' ? 'badge-tier1' : info.qualification_level >= 'Q5' ? 'badge-tier2' : 'badge-tierexp'}`}>
                            {info.qualification_level}
                          </Badge>
                        </td>
                        <td>
                          <Badge className={`${info.effective_permission === 'clinical' ? 'badge-tier1' : info.effective_permission === 'validation' ? 'badge-tier2' : 'badge-tierexp'}`}>
                            {info.effective_permission}
                          </Badge>
                        </td>
                        <td className="text-sm text-secondary">
                          {info.is_authorised ? 'Authorised' : 'Not authorised for Clinical targeting'}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-3">
        <Button variant="secondary" href="/validation"><ArrowLeftIcon size={14} className="mr-1 inline" /> Validation Home</Button>
        <Button variant="secondary" href="/validation/studies">Studies <ArrowRightIcon size={14} className="ml-1 inline" /></Button>
        <Button variant="secondary" href="/validation/golden">Golden Cases <ArrowRightIcon size={14} className="ml-1 inline" /></Button>
      </div>
    </div>
  );
}
