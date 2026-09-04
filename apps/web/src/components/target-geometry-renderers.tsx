'use client';

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
    <div
      className="target-geometry-card"
      style={{
        backgroundColor: 'rgba(255,255,255,0.04)',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: '8px',
        padding: '16px',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
        <span className="badge badge-neutral" style={{ fontSize: '0.75rem', textTransform: 'uppercase' }}>
          {label}
        </span>
      </div>
      {description && (
        <p style={{ margin: '0 0 12px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
          {description}
        </p>
      )}
      {children}
    </div>
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
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.85rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ color: 'var(--text-muted)' }}>MNI Coordinate</span>
          <strong style={{ color: 'var(--text-main)', fontFamily: 'var(--font-mono)' }}>
            {mniFormatted}
          </strong>
        </div>
        {subjectNativeFormatted && (
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: 'var(--text-muted)' }}>Subject Native</span>
            <strong style={{ color: 'var(--text-main)', fontFamily: 'var(--font-mono)' }}>
              {subjectNativeFormatted}
            </strong>
          </div>
        )}
        {hcpParcel && (
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: 'var(--text-muted)' }}>HCP Parcel</span>
            <span style={{ color: 'var(--text-secondary)' }}>{hcpParcel}</span>
          </div>
        )}
        {depthMm !== undefined && (
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: 'var(--text-muted)' }}>Cortical Depth</span>
            <span style={{ color: 'var(--text-secondary)' }}>{depthMm} mm</span>
          </div>
        )}
        {accessibilityRating && (
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: 'var(--text-muted)' }}>Accessibility</span>
            <span className={`badge ${accessibilityRating === 'Optimal' ? 'badge-tier1' : accessibilityRating === 'Acceptable' ? 'badge-tier2' : 'badge-tier3'}`} style={{ fontSize: '0.75rem' }}>
              {accessibilityRating}
            </span>
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
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.85rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ color: 'var(--text-muted)' }}>Centroid</span>
          <strong style={{ color: 'var(--text-main)', fontFamily: 'var(--font-mono)' }}>
            {centroidFormatted}
          </strong>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ color: 'var(--text-muted)' }}>Surface Area</span>
          <span style={{ color: 'var(--text-secondary)' }}>{surfaceAreaMm2} mm²</span>
        </div>
        {reliabilityRegionMm !== undefined && (
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: 'var(--text-muted)' }}>Reliability Region</span>
            <span style={{ color: 'var(--text-secondary)' }}>± {reliabilityRegionMm} mm</span>
          </div>
        )}
        {parcels && parcels.length > 0 && (
          <div style={{ marginTop: '4px' }}>
            <span style={{ color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Parcels</span>
            <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
              {parcels.map(p => (
                <span key={p} className="badge badge-neutral" style={{ fontSize: '0.75rem' }}>{p}</span>
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
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.85rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ color: 'var(--text-muted)' }}>Body Region</span>
          <strong style={{ color: 'var(--text-main)' }}>{bodyRegion}</strong>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ color: 'var(--text-muted)' }}>Laterality</span>
          <span style={{ color: 'var(--text-secondary)' }}>{laterality}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ color: 'var(--text-muted)' }}>Motor Cortex Zone</span>
          <span style={{ color: 'var(--text-secondary)' }}>{motorCortexZone}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ color: 'var(--text-muted)' }}>Somatotopic Map</span>
          <span style={{ color: 'var(--text-secondary)' }}>{somatotopicMapSource}</span>
        </div>
        {hotspotFormatted && (
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: 'var(--text-muted)' }}>Motor Hotspot</span>
            <strong style={{ color: 'var(--text-main)', fontFamily: 'var(--font-mono)' }}>
              {hotspotFormatted}
            </strong>
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
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.85rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ color: 'var(--text-muted)' }}>Coil Type</span>
          <strong style={{ color: 'var(--text-main)' }}>{coilType}</strong>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ color: 'var(--text-muted)' }}>Placement</span>
          <span style={{ color: 'var(--text-secondary)' }}>{placementDescription}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ color: 'var(--text-muted)' }}>Max Field Depth</span>
          <span style={{ color: 'var(--text-secondary)' }}>{maxFieldDepthMm} mm</span>
        </div>
        {coverageAreaLabel && (
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: 'var(--text-muted)' }}>Coverage Area</span>
            <span style={{ color: 'var(--text-secondary)' }}>{coverageAreaLabel}</span>
          </div>
        )}
        {protocolFamily && (
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: 'var(--text-muted)' }}>Protocol</span>
            <span style={{ color: 'var(--text-secondary)' }}>{protocolFamily}</span>
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
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.85rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ color: 'var(--text-muted)' }}>Network</span>
          <strong style={{ color: 'var(--text-main)' }}>{networkName}</strong>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ color: 'var(--text-muted)' }}>Node Count</span>
          <span style={{ color: 'var(--text-secondary)' }}>{nodeCount} nodes</span>
        </div>
        {primaryNodeFormatted && (
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: 'var(--text-muted)' }}>Primary Stimulation Node</span>
            <strong style={{ color: 'var(--text-main)', fontFamily: 'var(--font-mono)' }}>
              {primaryNodeFormatted}
            </strong>
          </div>
        )}
        <div style={{ marginTop: '4px' }}>
          <span style={{ color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Circuit Description</span>
          <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.85rem', lineHeight: 1.4 }}>
            {circuitDescription}
          </p>
        </div>
        {connectivityMetric && (
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4px' }}>
            <span style={{ color: 'var(--text-muted)' }}>Connectivity Metric</span>
            <span style={{ color: 'var(--text-secondary)' }}>{connectivityMetric}</span>
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
