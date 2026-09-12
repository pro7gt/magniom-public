'use client';

import { Badge, Card, CardHeader, CardDescription, CardContent } from '@/components/ui';

import React from 'react';
import type { TargetGeometryType } from '@magniom/domain';

// ==========================================
// Multi-Geometry Target Presentation Renderers (§112–117)
// Each renderer displays geometry-specific information for a target candidate.
// ==========================================

interface BaseGeometryRendererProps {
  label: string;
  description?: string | undefined;
  children?: React.ReactNode | undefined;
}

function GeometryCard({ label, description, children }: BaseGeometryRendererProps) {
  return (
    <Card className="target-geometry-card">
      <CardHeader className="p-0 mb-2">
        <Badge variant="neutral" className="text-xs uppercase self-start">
          {label}
        </Badge>
        {description && (
          <CardDescription className="mt-2 text-sm text-secondary">{description}</CardDescription>
        )}
      </CardHeader>
      <CardContent className="p-0">{children}</CardContent>
    </Card>
  );
}

// ==========================================
// §113 — Point Target Renderer
// ==========================================

interface PointTargetRendererProps {
  mniFormatted: string;
  subjectNativeFormatted?: string | undefined;
  hcpParcel?: string | undefined;
  depthMm?: number | undefined;
  accessibilityRating?: string | undefined;
}

export function PointTargetRenderer({
  mniFormatted,
  subjectNativeFormatted,
  hcpParcel,
  depthMm,
  accessibilityRating,
}: PointTargetRendererProps) {
  return (
    <GeometryCard
      label="Point Target"
      description="Focal cortical stimulation point defined by a single MNI coordinate."
    >
      <div className="flex flex-col gap-2 text-sm">
        <div className="flex justify-between">
          <span className="text-muted">MNI Coordinate</span>
          <strong className="text-primary font-mono">{mniFormatted}</strong>
        </div>
        {subjectNativeFormatted && (
          <div className="flex justify-between">
            <span className="text-muted">Subject Native</span>
            <strong className="text-primary font-mono">{subjectNativeFormatted}</strong>
          </div>
        )}
        {hcpParcel && (
          <div className="flex justify-between">
            <span className="text-muted">HCP Parcel</span>
            <span className="text-secondary">{hcpParcel}</span>
          </div>
        )}
        {depthMm !== undefined && (
          <div className="flex justify-between">
            <span className="text-muted">Cortical Depth</span>
            <span className="text-secondary">{depthMm} mm</span>
          </div>
        )}
        {accessibilityRating && (
          <div className="flex justify-between">
            <span className="text-muted">Accessibility</span>
            <Badge
              className={`${accessibilityRating === 'Optimal' ? 'badge-tier1' : accessibilityRating === 'Acceptable' ? 'badge-tier2' : 'badge-tier3'} text-xs`}
            >
              {accessibilityRating}
            </Badge>
          </div>
        )}
      </div>
    </GeometryCard>
  );
}

// ==========================================
// §114 — ROI (Surface Region of Interest) Target Renderer
// ==========================================

interface RoiTargetRendererProps {
  centroidFormatted: string;
  surfaceAreaMm2: number;
  reliabilityRegionMm?: number | undefined;
  parcels?: string[] | undefined;
}

export function RoiTargetRenderer({
  centroidFormatted,
  surfaceAreaMm2,
  reliabilityRegionMm,
  parcels,
}: RoiTargetRendererProps) {
  return (
    <GeometryCard
      label="Surface ROI"
      description="Cortical region of interest defined by centroid, surface extent, and reliability dispersion."
    >
      <div className="flex flex-col gap-2 text-sm">
        <div className="flex justify-between">
          <span className="text-muted">Centroid</span>
          <strong className="text-primary font-mono">{centroidFormatted}</strong>
        </div>
        <div className="flex justify-between">
          <span className="text-muted">Surface Area</span>
          <span className="text-secondary">{surfaceAreaMm2} mm²</span>
        </div>
        {reliabilityRegionMm !== undefined && (
          <div className="flex justify-between">
            <span className="text-muted">Reliability Region</span>
            <span className="text-secondary">± {reliabilityRegionMm} mm</span>
          </div>
        )}
        {parcels && parcels.length > 0 && (
          <div className="mt-1">
            <span className="text-muted block mb-1">Parcels</span>
            <div className="flex gap-1 flex-wrap">
              {parcels.map(p => (
                <Badge variant="neutral" key={p} className="text-xs">
                  {p}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </div>
    </GeometryCard>
  );
}

// ==========================================
// §115 — Somatotopic Target Renderer
// ==========================================

interface SomatotopicTargetRendererProps {
  bodyRegion: string;
  laterality: string;
  motorCortexZone: string;
  somatotopicMapSource: string;
  hotspotFormatted?: string | undefined;
}

export function SomatotopicTargetRenderer({
  bodyRegion,
  laterality,
  motorCortexZone,
  somatotopicMapSource,
  hotspotFormatted,
}: SomatotopicTargetRendererProps) {
  return (
    <GeometryCard
      label="Somatotopic"
      description="Motor cortex target localised via somatotopic mapping of the affected body region."
    >
      <div className="flex flex-col gap-2 text-sm">
        <div className="flex justify-between">
          <span className="text-muted">Body Region</span>
          <strong className="text-primary">{bodyRegion}</strong>
        </div>
        <div className="flex justify-between">
          <span className="text-muted">Laterality</span>
          <span className="text-secondary">{laterality}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted">Motor Cortex Zone</span>
          <span className="text-secondary">{motorCortexZone}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted">Somatotopic Map</span>
          <span className="text-secondary">{somatotopicMapSource}</span>
        </div>
        {hotspotFormatted && (
          <div className="flex justify-between">
            <span className="text-muted">Motor Hotspot</span>
            <strong className="text-primary font-mono">{hotspotFormatted}</strong>
          </div>
        )}
      </div>
    </GeometryCard>
  );
}

// ==========================================
// §116 — Coil-Field Target Renderer
// ==========================================

interface CoilFieldTargetRendererProps {
  coilType: string;
  placementDescription: string;
  maxFieldDepthMm: number;
  coverageAreaLabel?: string | undefined;
  protocolFamily?: string | undefined;
}

export function CoilFieldTargetRenderer({
  coilType,
  placementDescription,
  maxFieldDepthMm,
  coverageAreaLabel,
  protocolFamily,
}: CoilFieldTargetRendererProps) {
  return (
    <GeometryCard
      label="Coil Field"
      description="Deep TMS coil-field placement targeting a volumetric cortical or subcortical region."
    >
      <div className="flex flex-col gap-2 text-sm">
        <div className="flex justify-between">
          <span className="text-muted">Coil Type</span>
          <strong className="text-primary">{coilType}</strong>
        </div>
        <div className="flex justify-between">
          <span className="text-muted">Placement</span>
          <span className="text-secondary">{placementDescription}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted">Max Field Depth</span>
          <span className="text-secondary">{maxFieldDepthMm} mm</span>
        </div>
        {coverageAreaLabel && (
          <div className="flex justify-between">
            <span className="text-muted">Coverage Area</span>
            <span className="text-secondary">{coverageAreaLabel}</span>
          </div>
        )}
        {protocolFamily && (
          <div className="flex justify-between">
            <span className="text-muted">Protocol</span>
            <span className="text-secondary">{protocolFamily}</span>
          </div>
        )}
      </div>
    </GeometryCard>
  );
}

// ==========================================
// §117 — Network Target Renderer
// ==========================================

interface NetworkTargetRendererProps {
  networkName: string;
  nodeCount: number;
  primaryNodeFormatted?: string | undefined;
  circuitDescription: string;
  connectivityMetric?: string | undefined;
}

export function NetworkTargetRenderer({
  networkName,
  nodeCount,
  primaryNodeFormatted,
  circuitDescription,
  connectivityMetric,
}: NetworkTargetRendererProps) {
  return (
    <GeometryCard
      label="Network"
      description="Distributed cortical network target defined by multi-node functional connectivity architecture."
    >
      <div className="flex flex-col gap-2 text-sm">
        <div className="flex justify-between">
          <span className="text-muted">Network</span>
          <strong className="text-primary">{networkName}</strong>
        </div>
        <div className="flex justify-between">
          <span className="text-muted">Node Count</span>
          <span className="text-secondary">{nodeCount} nodes</span>
        </div>
        {primaryNodeFormatted && (
          <div className="flex justify-between">
            <span className="text-muted">Primary Stimulation Node</span>
            <strong className="text-primary font-mono">{primaryNodeFormatted}</strong>
          </div>
        )}
        <div className="mt-1">
          <span className="text-muted block mb-1">Circuit Description</span>
          <p className="m-0 text-sm text-secondary leading-normal">{circuitDescription}</p>
        </div>
        {connectivityMetric && (
          <div className="flex justify-between mt-1">
            <span className="text-muted">Connectivity Metric</span>
            <span className="text-secondary">{connectivityMetric}</span>
          </div>
        )}
      </div>
    </GeometryCard>
  );
}

// ==========================================
// Geometry Type Dispatcher
// ==========================================

interface TargetGeometryRendererProps {
  geometryType: TargetGeometryType | string;
  coordinateFormatted?: string | undefined;
  subjectNativeFormatted?: string | undefined;
  hcpParcel?: string | undefined;
  depthMm?: number | undefined;
  accessibilityRating?: string | undefined;
  surfaceAreaMm2?: number | undefined;
  reliabilityRegionMm?: number | undefined;
}

/**
 * Dispatches to the appropriate geometry-specific renderer based on `geometryType`.
 */
export function TargetGeometryRenderer({
  geometryType,
  coordinateFormatted = '(—, —, —)',
  subjectNativeFormatted,
  hcpParcel,
  depthMm,
  accessibilityRating,
  surfaceAreaMm2,
  reliabilityRegionMm,
}: TargetGeometryRendererProps) {
  switch (geometryType) {
    case 'point':
      return (
        <PointTargetRenderer
          mniFormatted={coordinateFormatted}
          subjectNativeFormatted={subjectNativeFormatted}
          hcpParcel={hcpParcel}
          depthMm={depthMm}
          accessibilityRating={accessibilityRating}
        />
      );
    case 'surface_roi':
      return (
        <RoiTargetRenderer
          centroidFormatted={coordinateFormatted}
          surfaceAreaMm2={surfaceAreaMm2 ?? 24.5}
          reliabilityRegionMm={reliabilityRegionMm}
          parcels={hcpParcel ? [hcpParcel] : undefined}
        />
      );
    case 'somatotopic':
      return (
        <SomatotopicTargetRenderer
          bodyRegion="Upper extremity (contralateral)"
          laterality="Left"
          motorCortexZone="Primary Motor Cortex (M1)"
          somatotopicMapSource="TMS motor mapping hotspot"
          hotspotFormatted={coordinateFormatted}
        />
      );
    case 'coil_field':
      return (
        <CoilFieldTargetRenderer
          coilType="H1 Deep TMS Coil"
          placementDescription="Bilateral mPFC coverage"
          maxFieldDepthMm={45}
          coverageAreaLabel="Medial prefrontal / anterior cingulate"
          protocolFamily="Deep TMS Standard Protocol"
        />
      );
    case 'network':
      return (
        <NetworkTargetRenderer
          networkName="Language Recovery Network"
          nodeCount={3}
          primaryNodeFormatted={coordinateFormatted}
          circuitDescription="Distributed frontotemporal language network targeting peri-lesional cortex."
          connectivityMetric="Effective connectivity (DCM)"
        />
      );
    default:
      return (
        <PointTargetRenderer
          mniFormatted={coordinateFormatted}
          subjectNativeFormatted={subjectNativeFormatted}
          hcpParcel={hcpParcel}
          depthMm={depthMm}
          accessibilityRating={accessibilityRating}
        />
      );
  }
}
