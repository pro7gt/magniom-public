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
  Alert,
} from '@/components/ui';
import React from 'react';
import {
  getAllModuleUiDescriptors,
  type IndicationModuleUiDescriptor,
} from '@magniom/presentation';

// ==========================================
// Research Modules Catalogue (§195, §216)
// Experimental module listing with Q-level and Research-only status.
// ==========================================

const MODULE_QUAL_INFO: Record<
  string,
  { qualification_level: string; effective_permission: string }
> = {
  MDD: { qualification_level: 'Q8', effective_permission: 'clinical' },
  PAIN: { qualification_level: 'Q6', effective_permission: 'validation' },
  STROKE_MOTOR: { qualification_level: 'Q5', effective_permission: 'validation' },
  STROKE_APHASIA: { qualification_level: 'Q5', effective_permission: 'validation' },
  OCD: { qualification_level: 'Q5', effective_permission: 'validation' },
  TINNITUS: { qualification_level: 'Q0', effective_permission: 'research' },
  TBI: { qualification_level: 'Q1', effective_permission: 'research' },
  SUD: { qualification_level: 'Q4', effective_permission: 'validation' },
};

export default function ResearchModulesPage() {
  const allModules = getAllModuleUiDescriptors();
  const researchModules = allModules.filter(
    m =>
      MODULE_QUAL_INFO[m.indication_code]?.effective_permission === 'research' ||
      m.indication_code === 'TINNITUS' ||
      m.indication_code === 'TBI',
  );

  return (
    <div className="container page-container-col">
      <Breadcrumbs
        items={[
          { label: 'Research', href: '/research' },
          { label: 'Modules', current: true },
        ]}
      />

      {/* Research Mode Warning */}
      <Alert
        variant="research"
        title="RESEARCH MODE — NOT FOR CLINICAL USE:"
        description="Modules shown here have not completed clinical qualification. Clinical decisions cannot be signed with these modules (§13)."
      />

      <PageHeader
        eyebrow={
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="tierexp">RESEARCH ENVIRONMENT</Badge>
            <Badge variant="neutral">Modules</Badge>
          </div>
        }
        title="Research & Experimental Modules"
        subtitle="Experimental indication modules available for research workflows. Clinical decision signing is not available for Research-only modules (§195, §216)."
      />

      <Card>
        <CardHeader>
          <CardTitle as="h2" className="text-cyan">
            Active Experimental Modules
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="comparison-table-wrapper">
            <table className="comparison-table" aria-label="Research Modules">
              <thead>
                <tr>
                  <th scope="col">Module</th>
                  <th scope="col">Indication</th>
                  <th scope="col">Version</th>
                  <th scope="col">Qualification</th>
                  <th scope="col">Permission</th>
                  <th scope="col">Measurements</th>
                </tr>
              </thead>
              <tbody>
                {researchModules.length === 0 ? (
                  <TableEmptyRow colSpan={6} message="No experimental research modules found." />
                ) : (
                  researchModules.map((mod: IndicationModuleUiDescriptor) => {
                    const info = MODULE_QUAL_INFO[mod.indication_code];
                    return (
                      <tr key={mod.indication_module_release_id}>
                        <td>
                          <strong>{mod.indication_name}</strong>
                        </td>
                        <td>
                          <code className="text-cyan text-xs">{mod.indication_code}</code>
                        </td>
                        <td>{mod.indication_module_release_id}</td>
                        <td>
                          <Badge variant="tierexp">{info?.qualification_level || 'Q0'}</Badge>
                        </td>
                        <td>
                          <Badge variant="tierexp">
                            {info?.effective_permission || 'Research Only'}
                          </Badge>
                        </td>
                        <td className="text-sm text-secondary">
                          {mod.measurement_sections.map(ms => ms.label).join(', ')}
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
        <Button variant="secondary" href="/research">
          <ArrowLeftIcon size={14} className="mr-1 inline" /> Research Home
        </Button>
        <Button variant="secondary" href="/research/cases">
          Research Cases <ArrowRightIcon size={14} className="ml-1 inline" />
        </Button>
      </div>
    </div>
  );
}
