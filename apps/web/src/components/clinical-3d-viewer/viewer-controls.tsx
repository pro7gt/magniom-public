'use client';

import React from 'react';
import type { CameraOrientationPreset, SurfaceMeshType } from '@magniom/domain';
import type { ViewerLayerVisibilityViewModel } from '@magniom/presentation';

interface ViewerControlsProps {
  cameraPreset: CameraOrientationPreset;
  onSelectCameraPreset: (preset: CameraOrientationPreset) => void;
  surfaceType: SurfaceMeshType;
  onChangeSurfaceType: (type: SurfaceMeshType) => void;
  hemisphere: 'L' | 'R' | 'BOTH';
  onChangeHemisphere: (hemi: 'L' | 'R' | 'BOTH') => void;
  layers: ViewerLayerVisibilityViewModel;
  onToggleLayer: (layerKey: keyof ViewerLayerVisibilityViewModel) => void;
  onResetView: () => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
}

export function ViewerControls({
  cameraPreset,
  onSelectCameraPreset,
  surfaceType,
  onChangeSurfaceType,
  hemisphere,
  onChangeHemisphere,
  layers,
  onToggleLayer,
  onResetView,
  onZoomIn,
  onZoomOut,
}: ViewerControlsProps) {
  const presets: { id: CameraOrientationPreset; label: string; shortcut: string }[] = [
    { id: 'LEFT_LATERAL', label: 'Left Lateral', shortcut: 'L' },
    { id: 'SUPERIOR', label: 'Superior', shortcut: 'S' },
    { id: 'MEDIAL', label: 'Medial', shortcut: 'M' },
    { id: 'ANTERIOR', label: 'Anterior', shortcut: 'A' },
    { id: 'RIGHT_LATERAL', label: 'Right Lateral', shortcut: 'R' },
  ];

  return (
    <div className="viewer-controls-bar" aria-label="3D Viewer Navigation and Layer Controls">
      {/* View Presets */}
      <div className="control-group">
        <span className="control-group-title">Camera Views</span>
        <div className="btn-group" role="group" aria-label="Anatomical View Presets">
          {presets.map(p => (
            <button
              key={p.id}
              type="button"
              className={`btn btn-sm ${cameraPreset === p.id ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => onSelectCameraPreset(p.id)}
              title={`${p.label} view`}
            >
              {p.label}
            </button>
          ))}
          <button
            type="button"
            className="btn btn-sm btn-secondary"
            onClick={onResetView}
            title="Reset to default Left DLPFC review perspective"
          >
            ↺ Reset
          </button>
        </div>
      </div>

      {/* Surface Geometry & Hemisphere Selector */}
      <div className="control-group">
        <span className="control-group-title">Surface Mesh</span>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <select
            className="form-select"
            value={surfaceType}
            onChange={e => onChangeSurfaceType(e.target.value as SurfaceMeshType)}
            aria-label="Cortical Surface Geometry"
          >
            <option value="midthickness">Midthickness Surface</option>
            <option value="pial">Pial (Outer Cortex)</option>
            <option value="inflated">Inflated (Sulcal Expanded)</option>
            <option value="white">White Matter Surface</option>
          </select>

          <select
            className="form-select"
            value={hemisphere}
            onChange={e => onChangeHemisphere(e.target.value as 'L' | 'R' | 'BOTH')}
            aria-label="Hemisphere Selection"
          >
            <option value="L">Left Hemisphere (Target)</option>
            <option value="R">Right Hemisphere</option>
            <option value="BOTH">Bilateral Hemispheres</option>
          </select>

          <div className="btn-group" role="group" aria-label="Zoom Controls">
            <button
              type="button"
              className="btn btn-sm btn-secondary"
              onClick={onZoomIn}
              title="Zoom In"
              aria-label="Zoom In"
            >
              +
            </button>
            <button
              type="button"
              className="btn btn-sm btn-secondary"
              onClick={onZoomOut}
              title="Zoom Out"
              aria-label="Zoom Out"
            >
              −
            </button>
          </div>
        </div>
      </div>

      {/* Layer Visibility Toggles (Section 46) */}
      <div className="control-group" style={{ width: '100%' }}>
        <span className="control-group-title">Display Overlays (Section 46)</span>
        <div className="layer-toggles-grid">
          <label className="checkbox-label" title="Render 3D Cortical Gyral & Sulcal Geometry">
            <input
              type="checkbox"
              checked={layers.corticalAnatomy}
              onChange={() => onToggleLayer('corticalAnatomy')}
            />
            <span>Cortical Anatomy</span>
          </label>

          <label className="checkbox-label" title="Render Selected Target ROI Centre & Normal">
            <input
              type="checkbox"
              checked={layers.selectedTarget}
              onChange={() => onToggleLayer('selectedTarget')}
            />
            <span style={{ color: 'var(--accent-cyan)', fontWeight: 600 }}>Selected Target</span>
          </label>

          <label
            className="checkbox-label"
            title="Render 3D Spatial Reliability & Uncertainty Envelope"
          >
            <input
              type="checkbox"
              checked={layers.reliabilityRegion}
              onChange={() => onToggleLayer('reliabilityRegion')}
            />
            <span style={{ color: '#34d399' }}>Reliability Region</span>
          </label>

          <label className="checkbox-label" title="Project 3D Functional Therapeutic Circuit Map">
            <input
              type="checkbox"
              checked={layers.therapeuticCircuit}
              onChange={() => onToggleLayer('therapeuticCircuit')}
            />
            <span style={{ color: '#f59e0b' }}>Therapeutic Circuit</span>
          </label>

          <label
            className="checkbox-label"
            title="Render Evidence-Only Standard Baseline Reference Coordinate"
          >
            <input
              type="checkbox"
              checked={layers.evidenceOnlyTarget}
              onChange={() => onToggleLayer('evidenceOnlyTarget')}
            />
            <span style={{ color: '#9ca3af' }}>Evidence Counterfactual</span>
          </label>

          <label
            className="checkbox-label"
            title="Render All Alternative Slate Candidates in 3D Space"
          >
            <input
              type="checkbox"
              checked={layers.alternativeTargets}
              onChange={() => onToggleLayer('alternativeTargets')}
            />
            <span>Alternative Targets</span>
          </label>

          <label className="checkbox-label" title="Render HCP-MMP1.0 Cortical Parcel Boundaries">
            <input
              type="checkbox"
              checked={layers.atlasBoundaries}
              onChange={() => onToggleLayer('atlasBoundaries')}
            />
            <span>Atlas Boundaries</span>
          </label>
        </div>
      </div>
    </div>
  );
}
