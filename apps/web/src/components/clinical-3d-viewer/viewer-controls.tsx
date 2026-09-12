'use client';

import { Button, RefreshCwIcon, Select, Checkbox } from '@/components/ui';

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
            <Button
              className={`btn-sm ${cameraPreset === p.id ? 'btn-primary' : 'btn-secondary'}`}
              key={p.id}
              type="button"

              onClick={() => onSelectCameraPreset(p.id)}
              title={`${p.label} view`}
            >
              {p.label}
            </Button>
          ))}
          <Button
            variant="secondary"
            size="sm"
            type="button"
            onClick={onResetView}
            title="Reset to default Left DLPFC review perspective"
          >
            <RefreshCwIcon size={14} className="mr-1 inline" /> Reset
          </Button>
        </div>
      </div>

      {/* Surface Geometry & Hemisphere Selector */}
      <div className="control-group">
        <span className="control-group-title">Surface Mesh</span>
        <div className="flex items-center gap-2">
          <Select
            value={surfaceType}
            onChange={e => onChangeSurfaceType(e.target.value as SurfaceMeshType)}
            aria-label="Cortical Surface Geometry"
          >
            <option value="midthickness">Midthickness Surface</option>
            <option value="pial">Pial (Outer Cortex)</option>
            <option value="inflated">Inflated (Sulcal Expanded)</option>
            <option value="white">White Matter Surface</option>
          </Select>

          <Select
            value={hemisphere}
            onChange={e => onChangeHemisphere(e.target.value as 'L' | 'R' | 'BOTH')}
            aria-label="Hemisphere Selection"
          >
            <option value="L">Left Hemisphere (Target)</option>
            <option value="R">Right Hemisphere</option>
            <option value="BOTH">Bilateral Hemispheres</option>
          </Select>

          <div className="btn-group" role="group" aria-label="Zoom Controls">
            <Button
              variant="secondary"
              size="sm"
              type="button"
              onClick={onZoomIn}
              title="Zoom In"
              aria-label="Zoom In"
            >
              +
            </Button>
            <Button
              variant="secondary"
              size="sm"
              type="button"
              onClick={onZoomOut}
              title="Zoom Out"
              aria-label="Zoom Out"
            >
              −
            </Button>
          </div>
        </div>
      </div>

      {/* Layer Visibility Toggles (Section 46) */}
      <div className="control-group w-full">
        <span className="control-group-title">Display Overlays (Section 46)</span>
        <div className="layer-toggles-grid">
          <label className="checkbox-label" title="Render 3D Cortical Gyral & Sulcal Geometry">
            <Checkbox
              checked={layers.corticalAnatomy}
              onChange={() => onToggleLayer('corticalAnatomy')}
            />
            <span>Cortical Anatomy</span>
          </label>

          <label className="checkbox-label" title="Render Selected Target ROI Centre & Normal">
            <Checkbox
              checked={layers.selectedTarget}
              onChange={() => onToggleLayer('selectedTarget')}
            />
            <span className="text-cyan font-semibold">Selected Target</span>
          </label>

          <label
            className="checkbox-label"
            title="Render 3D Spatial Reliability & Uncertainty Envelope"
          >
            <Checkbox
              checked={layers.reliabilityRegion}
              onChange={() => onToggleLayer('reliabilityRegion')}
            />
            <span className="text-emerald">Reliability Region</span>
          </label>

          <label className="checkbox-label" title="Project 3D Functional Therapeutic Circuit Map">
            <Checkbox
              checked={layers.therapeuticCircuit}
              onChange={() => onToggleLayer('therapeuticCircuit')}
            />
            <span className="text-amber">Therapeutic Circuit</span>
          </label>

          <label
            className="checkbox-label"
            title="Render Evidence-Only Standard Baseline Reference Coordinate"
          >
            <Checkbox
              checked={layers.evidenceOnlyTarget}
              onChange={() => onToggleLayer('evidenceOnlyTarget')}
            />
            <span className="text-secondary">Evidence Counterfactual</span>
          </label>

          <label
            className="checkbox-label"
            title="Render All Alternative Slate Candidates in 3D Space"
          >
            <Checkbox
              checked={layers.alternativeTargets}
              onChange={() => onToggleLayer('alternativeTargets')}
            />
            <span>Alternative Targets</span>
          </label>

          <label className="checkbox-label" title="Render HCP-MMP1.0 Cortical Parcel Boundaries">
            <Checkbox
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
