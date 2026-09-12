'use client';

import { Button, Badge, Card, CardHeader, CardTitle, CardDescription } from '@/components/ui';
import { HEX_NUMERIC_TOKENS } from '@magniom/ui';

import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import type { CameraOrientationPreset, SurfaceMeshType } from '@magniom/domain';
import type {
  Clinical3DViewerViewModel,
  ViewerLayerVisibilityViewModel,
} from '@magniom/presentation';
import { ViewerControls } from './viewer-controls';
import { CoordinatePanel } from './coordinate-panel';
import { Counterfactual3DOverlay } from './counterfactual-3d-overlay';
import { ConfidenceRegionOverlay } from './confidence-region-overlay';
import { CircuitOverlaySelector } from './circuit-overlay-selector';

interface Clinical3DViewerProps {
  viewModel: Clinical3DViewerViewModel;
  onSelectCandidate?: ((candidateId: string) => void) | undefined;
}

export function Clinical3DViewer({ viewModel, onSelectCandidate }: Clinical3DViewerProps) {
  const mountRef = useRef<HTMLDivElement>(null);

  // Viewer State
  const [cameraPreset, setCameraPreset] = useState<CameraOrientationPreset>('RESET');
  const [surfaceType, setSurfaceType] = useState<SurfaceMeshType>(viewModel.activeSurfaceType);
  const [hemisphere, setHemisphere] = useState<'L' | 'R' | 'BOTH'>(viewModel.activeHemisphere);
  const [layers, setLayers] = useState<ViewerLayerVisibilityViewModel>(viewModel.visibleLayers);
  const [activeCircuitId, setActiveCircuitId] = useState<string | undefined>(
    viewModel.activeCircuitOverlayId,
  );
  const [circuitOpacity, setCircuitOpacity] = useState<number>(0.75);
  const [isWebGlSupported, setIsWebGlSupported] = useState<boolean>(true);
  const [isOrbiting, setIsOrbiting] = useState<boolean>(false);

  // References for Three.js objects
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const brainMeshRef = useRef<THREE.Group | null>(null);
  const overlaysGroupRef = useRef<THREE.Group | null>(null);

  // Handle Layer Toggle
  const handleToggleLayer = (layerKey: keyof ViewerLayerVisibilityViewModel) => {
    setLayers(prev => ({ ...prev, [layerKey]: !prev[layerKey] }));
  };

  // Three.js Scene Setup & Render Loop
  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // Check WebGL support
    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      if (!gl) {
        setIsWebGlSupported(false);
        return;
      }
    } catch {
      setIsWebGlSupported(false);
      return;
    }

    const width = container.clientWidth || 640;
    const height = 480;

    // 1. Scene (§128-§130 dark canvas invariant: 0x090d16)
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(HEX_NUMERIC_TOKENS.background /* 0x090d16 */);
    sceneRef.current = scene;

    // 2. Camera
    const camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 1000);
    camera.position.set(-110, 65, 85);
    camera.lookAt(-35, 25, 25);
    cameraRef.current = camera;

    // 3. Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = false;
    container.innerHTML = '';
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // 4. Lighting (Clean anatomical clinical lighting)
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.65);
    scene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight(0xffffff, 0.85);
    dirLight1.position.set(-100, 100, 100);
    scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(HEX_NUMERIC_TOKENS.primary, 0.35);
    dirLight2.position.set(100, -50, -50);
    scene.add(dirLight2);

    const hemiLight = new THREE.HemisphereLight(0xffffff, HEX_NUMERIC_TOKENS.borderSubtle, 0.5);
    scene.add(hemiLight);

    // 5. Brain Mesh & Overlays Groups
    const brainGroup = new THREE.Group();
    scene.add(brainGroup);
    brainMeshRef.current = brainGroup;

    const overlaysGroup = new THREE.Group();
    scene.add(overlaysGroup);
    overlaysGroupRef.current = overlaysGroup;

    // 6. Interactive Orbit / Drag controls
    let isDragging = false;
    let prevMouseX = 0;
    let prevMouseY = 0;
    let rotX = 0.2;
    let rotY = -0.5;

    const onMouseDown = (e: MouseEvent) => {
      isDragging = true;
      setIsOrbiting(true);
      prevMouseX = e.clientX;
      prevMouseY = e.clientY;
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!isDragging || !brainMeshRef.current) return;
      const deltaX = e.clientX - prevMouseX;
      const deltaY = e.clientY - prevMouseY;
      prevMouseX = e.clientX;
      prevMouseY = e.clientY;

      rotY += deltaX * 0.008;
      rotX += deltaY * 0.008;

      // Clamp vertical rotation
      rotX = Math.max(-Math.PI / 2.2, Math.min(Math.PI / 2.2, rotX));
    };

    const onMouseUp = () => {
      isDragging = false;
      setIsOrbiting(false);
    };

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      if (!cameraRef.current) return;
      const zoomFactor = e.deltaY > 0 ? 1.05 : 0.95;
      cameraRef.current.position.multiplyScalar(zoomFactor);
    };

    const domEl = renderer.domElement;
    domEl.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    domEl.addEventListener('wheel', onWheel, { passive: false });

    // 7. Animation Loop
    let animationFrameId: number;
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      if (brainMeshRef.current) {
        brainMeshRef.current.rotation.y = rotY;
        brainMeshRef.current.rotation.x = rotX;
      }
      if (overlaysGroupRef.current) {
        overlaysGroupRef.current.rotation.y = rotY;
        overlaysGroupRef.current.rotation.x = rotX;
      }

      renderer.render(scene, camera);
    };
    animate();

    // Resize Handler
    const handleResize = () => {
      if (!container || !cameraRef.current || !rendererRef.current) return;
      const newWidth = container.clientWidth;
      cameraRef.current.aspect = newWidth / height;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(newWidth, height);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      domEl.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      domEl.removeEventListener('wheel', onWheel);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
    };
  }, []);

  // Update Brain Surface Geometry and Overlays when props change
  useEffect(() => {
    if (!brainMeshRef.current || !overlaysGroupRef.current) return;

    // Clear previous geometries
    while (brainMeshRef.current.children.length > 0) {
      const obj = brainMeshRef.current.children[0];
      if (obj) {
        brainMeshRef.current.remove(obj);
        if (obj instanceof THREE.Mesh) {
          obj.geometry.dispose();
          if (Array.isArray(obj.material)) {
            obj.material.forEach(m => m.dispose());
          } else {
            obj.material.dispose();
          }
        }
      }
    }

    while (overlaysGroupRef.current.children.length > 0) {
      const obj = overlaysGroupRef.current.children[0];
      if (obj) {
        overlaysGroupRef.current.remove(obj);
        if (obj instanceof THREE.Mesh) {
          obj.geometry.dispose();
          if (Array.isArray(obj.material)) {
            obj.material.forEach(m => m.dispose());
          } else {
            obj.material.dispose();
          }
        }
      }
    }

    // 1. Build Left & Right Cortical Meshes
    const renderHemisphereMesh = (isLeft: boolean) => {
      const uSegments = 48;
      const vSegments = 48;
      const geom = new THREE.BufferGeometry();
      const positions: number[] = [];
      const normals: number[] = [];
      const colors: number[] = [];
      const indices: number[] = [];

      const xSign = isLeft ? -1.0 : 1.0;
      const isInflated = surfaceType === 'inflated';

      for (let i = 0; i <= uSegments; i++) {
        const u = i / uSegments;
        const phi = u * Math.PI;

        for (let j = 0; j <= vSegments; j++) {
          const v = j / vSegments;
          const theta = v * 2 * Math.PI;

          // Anatomical prefrontal & frontal curvature synthesis
          const rBase = isInflated ? 48.0 : 44.0;
          const sulcalNoise = isInflated ? 0.0 : 3.2 * Math.sin(6 * phi) * Math.cos(7 * theta);
          const r = rBase + sulcalNoise;

          // Realistic brain hemisphere dimensions
          const x = xSign * (r * Math.sin(phi) * Math.cos(theta) * 0.72 + 18.0);
          const y = r * Math.sin(phi) * Math.sin(theta) * 0.95 + 15.0;
          const z = r * Math.cos(phi) * 0.82 + 15.0;

          positions.push(x, y, z);

          // Normal
          const len = Math.sqrt(x * x + y * y + z * z);
          normals.push(x / len, y / len, z / len);

          // Vertex color based on sulcal depth & circuit overlays
          if (activeCircuitId && layers.therapeuticCircuit) {
            // Project active circuit map intensity (e.g. Left DLPFC peak anti-correlation zone)
            const dTarget = Math.sqrt(
              Math.pow(x - viewModel.selectedTarget.mniCoordinate.x, 2) +
                Math.pow(y - viewModel.selectedTarget.mniCoordinate.y, 2) +
                Math.pow(z - viewModel.selectedTarget.mniCoordinate.z, 2),
            );

            if (isLeft && dTarget < 28.0) {
              const weight = Math.max(0, 1.0 - dTarget / 28.0) * circuitOpacity;
              // Coolwarm colormap (Cyan/Blue to Amber)
              colors.push(
                0.02 * (1 - weight) + 0.1 * weight,
                0.45 * (1 - weight) + 0.74 * weight,
                0.85 * (1 - weight) + 0.98 * weight,
              );
            } else {
              colors.push(0.18, 0.22, 0.28);
            }
          } else {
            // Standard anatomical sulcal shading
            const curvature = (sulcalNoise + 3.2) / 6.4;
            const shade = 0.22 + curvature * 0.25;
            colors.push(shade, shade + 0.04, shade + 0.08);
          }
        }
      }

      for (let i = 0; i < uSegments; i++) {
        for (let j = 0; j < vSegments; j++) {
          const a = i * (vSegments + 1) + j;
          const b = (i + 1) * (vSegments + 1) + j;
          const c = (i + 1) * (vSegments + 1) + (j + 1);
          const d = i * (vSegments + 1) + (j + 1);

          indices.push(a, b, d);
          indices.push(b, c, d);
        }
      }

      geom.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
      geom.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3));
      geom.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
      geom.setIndex(indices);

      const mat = new THREE.MeshStandardMaterial({
        vertexColors: true,
        roughness: 0.65,
        metalness: 0.15,
        wireframe: false,
        transparent: false,
      });

      const mesh = new THREE.Mesh(geom, mat);
      brainMeshRef.current?.add(mesh);
    };

    if (layers.corticalAnatomy) {
      if (hemisphere === 'L' || hemisphere === 'BOTH') renderHemisphereMesh(true);
      if (hemisphere === 'R' || hemisphere === 'BOTH') renderHemisphereMesh(false);
    }

    // 2. Render Target ROI Node & Surface Patch (Selected Target)
    const activeTarget = viewModel.selectedTarget;
    if (layers.selectedTarget && activeTarget) {
      const pos = new THREE.Vector3(
        activeTarget.mniCoordinate.x,
        activeTarget.mniCoordinate.y,
        activeTarget.mniCoordinate.z,
      );

      // Target centre node (Solid sphere marker)
      const targetSphereGeom = new THREE.SphereGeometry(2.4, 24, 24);
      const targetMat = new THREE.MeshStandardMaterial({
        color: new THREE.Color(activeTarget.markerColor),
        emissive: new THREE.Color(activeTarget.markerColor),
        emissiveIntensity: 0.6,
        roughness: 0.3,
      });
      const targetMesh = new THREE.Mesh(targetSphereGeom, targetMat);
      targetMesh.position.copy(pos);
      overlaysGroupRef.current.add(targetMesh);

      // Surface ROI circular patch
      const patchGeom = new THREE.RingGeometry(1.5, 5.2, 32);
      const patchMat = new THREE.MeshBasicMaterial({
        color: new THREE.Color(HEX_NUMERIC_TOKENS.primary),
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.7,
      });
      const patchMesh = new THREE.Mesh(patchGeom, patchMat);
      patchMesh.position.copy(pos);
      patchMesh.lookAt(
        pos.x + activeTarget.coilNormal.x,
        pos.y + activeTarget.coilNormal.y,
        pos.z + activeTarget.coilNormal.z,
      );
      overlaysGroupRef.current.add(patchMesh);

      // Coil normal orientation vector line (22 mm vector)
      const normalVector = new THREE.Vector3(
        activeTarget.coilNormal.x,
        activeTarget.coilNormal.y,
        activeTarget.coilNormal.z,
      )
        .normalize()
        .multiplyScalar(22.0);

      const lineGeom = new THREE.BufferGeometry().setFromPoints([
        pos,
        pos.clone().add(normalVector),
      ]);
      const lineMat = new THREE.LineBasicMaterial({
        color: HEX_NUMERIC_TOKENS.primary,
        linewidth: 2,
      });
      const normalLine = new THREE.Line(lineGeom, lineMat);
      overlaysGroupRef.current.add(normalLine);
    }

    // 3. Render 3D Spatial Confidence Region (Uncertainty Envelope)
    if (layers.reliabilityRegion && viewModel.confidenceRegion) {
      const conf = viewModel.confidenceRegion;
      const confCenter = new THREE.Vector3(
        conf.centroidMni.x,
        conf.centroidMni.y,
        conf.centroidMni.z,
      );

      // Semi-transparent dispersion ellipsoid
      const radius = conf.dispersionRadiusMm;
      const confGeom = new THREE.SphereGeometry(radius, 24, 24);
      const confMat = new THREE.MeshStandardMaterial({
        color: HEX_NUMERIC_TOKENS.success,
        transparent: true,
        opacity: 0.28,
        roughness: 0.5,
        wireframe: false,
      });
      const confMesh = new THREE.Mesh(confGeom, confMat);
      confMesh.position.copy(confCenter);
      overlaysGroupRef.current.add(confMesh);
    }

    // 4. Render Evidence Counterfactual Baseline & Connecting 3D Vector
    if (layers.evidenceOnlyTarget && viewModel.counterfactual?.hasCounterfactual) {
      const cf = viewModel.counterfactual;
      const baselinePos = new THREE.Vector3(cf.baselineMni.x, cf.baselineMni.y, cf.baselineMni.z);
      const candidatePos = new THREE.Vector3(
        cf.candidateMni.x,
        cf.candidateMni.y,
        cf.candidateMni.z,
      );

      // ○ Evidence baseline open ring marker
      const ringGeom = new THREE.RingGeometry(1.8, 3.2, 24);
      const ringMat = new THREE.MeshBasicMaterial({
        color: HEX_NUMERIC_TOKENS.textSecondary,
        side: THREE.DoubleSide,
        wireframe: true,
      });
      const ringMesh = new THREE.Mesh(ringGeom, ringMat);
      ringMesh.position.copy(baselinePos);
      overlaysGroupRef.current.add(ringMesh);

      // 3D Connecting dashed trajectory line
      const linePoints = [baselinePos, candidatePos];
      const trajGeom = new THREE.BufferGeometry().setFromPoints(linePoints);
      const trajMat = new THREE.LineDashedMaterial({
        color: HEX_NUMERIC_TOKENS.warning,
        dashSize: 2.0,
        gapSize: 1.5,
      });
      const trajLine = new THREE.Line(trajGeom, trajMat);
      trajLine.computeLineDistances();
      overlaysGroupRef.current.add(trajLine);
    }

    // 5. Render Alternative Slate Candidates
    if (layers.alternativeTargets) {
      viewModel.candidates3D.forEach(cand => {
        if (cand.id === activeTarget.id) return;
        const candPos = new THREE.Vector3(
          cand.mniCoordinate.x,
          cand.mniCoordinate.y,
          cand.mniCoordinate.z,
        );

        const sphereGeom = new THREE.SphereGeometry(1.8, 16, 16);
        const sphereMat = new THREE.MeshStandardMaterial({
          color: new THREE.Color(cand.markerColor),
          opacity: 0.85,
          transparent: true,
        });
        const mesh = new THREE.Mesh(sphereGeom, sphereMat);
        mesh.position.copy(candPos);
        overlaysGroupRef.current?.add(mesh);
      });
    }
  }, [
    surfaceType,
    hemisphere,
    layers,
    activeCircuitId,
    circuitOpacity,
    viewModel.selectedTarget,
    viewModel.confidenceRegion,
    viewModel.counterfactual,
    viewModel.candidates3D,
  ]);

  // Handle Camera Presets
  const handleSelectCameraPreset = (preset: CameraOrientationPreset) => {
    setCameraPreset(preset);
    if (!cameraRef.current) return;

    switch (preset) {
      case 'LEFT_LATERAL':
        cameraRef.current.position.set(-130, 25, 25);
        break;
      case 'RIGHT_LATERAL':
        cameraRef.current.position.set(130, 25, 25);
        break;
      case 'SUPERIOR':
        cameraRef.current.position.set(-20, 25, 140);
        break;
      case 'MEDIAL':
        cameraRef.current.position.set(0, 25, 25);
        break;
      case 'ANTERIOR':
        cameraRef.current.position.set(-25, 140, 25);
        break;
      case 'POSTERIOR':
        cameraRef.current.position.set(-25, -140, 25);
        break;
      case 'RESET':
      default:
        cameraRef.current.position.set(-110, 65, 85);
        break;
    }
    cameraRef.current.lookAt(-35, 25, 25);
  };

  const handleZoomIn = () => {
    if (!cameraRef.current) return;
    cameraRef.current.position.multiplyScalar(0.9);
  };

  const handleZoomOut = () => {
    if (!cameraRef.current) return;
    cameraRef.current.position.multiplyScalar(1.1);
  };

  const handleResetView = () => {
    handleSelectCameraPreset('RESET');
  };

  return (
    <div className="clinical-3d-viewer-container" aria-label="3D Clinical Cortical Viewer Island">
      {/* 3D WebGL Viewport Container */}
      <div className="viewer-viewport-wrapper">
        <div
          ref={mountRef}
          className="webgl-canvas-container"
          style={{ cursor: isOrbiting ? 'grabbing' : 'grab' }}
          role="img"
          aria-label={viewModel.accessibleTextSummary}
        />

        {/* Viewport Floating Indicator Overlay */}
        <div className="viewport-overlay-badges">
          <Badge variant="neutral" className="backdrop-blur">
            Coordinate Space: MNI152NLin2009cAsym (RAS)
          </Badge>
          <Badge variant="neutral" className="backdrop-blur">
            Target: {viewModel.selectedTarget.targetFamily}
          </Badge>
        </div>

        {/* Non-WebGL Fallback if WebGL unsupported */}
        {!isWebGlSupported && (
          <Card className="webgl-fallback-card">
            <CardHeader className="p-0">
              <CardTitle as="h4">WebGL Hardware Acceleration Disabled</CardTitle>
              <CardDescription className="text-sm text-secondary">
                Operating in WCAG 2.2 AA accessible schematic mode. All spatial coordinates, parcel
                boundaries, and counterfactuals remain fully accessible below.
              </CardDescription>
            </CardHeader>
          </Card>
        )}
      </div>

      {/* Candidate Focus Selector Chips */}
      {viewModel.candidates3D.length > 1 && (
        <div className="flex items-center gap-2 flex-wrap py-1">
          <span className="text-xs font-semibold text-secondary">Focus Target:</span>
          {viewModel.candidates3D.map(c => {
            const isSelected = c.id === viewModel.selectedCandidateId;
            return (
              <Button
                className={`btn-sm flex items-center gap-1.5 text-xs ${isSelected ? 'btn-primary' : 'btn-secondary'}`}
                key={c.id}
                type="button"
                onClick={() => onSelectCandidate?.(c.id)}
              >
                <span
                  className="w-2 h-2 rounded-full inline-block shrink-0"
                  style={{ background: c.markerColor }}
                />
                <strong>{c.roleTitle}</strong>
                <span>{c.mniFormatted}</span>
              </Button>
            );
          })}
        </div>
      )}

      {/* Interactive Controls Bar */}
      <ViewerControls
        cameraPreset={cameraPreset}
        onSelectCameraPreset={handleSelectCameraPreset}
        surfaceType={surfaceType}
        onChangeSurfaceType={setSurfaceType}
        hemisphere={hemisphere}
        onChangeHemisphere={setHemisphere}
        layers={layers}
        onToggleLayer={handleToggleLayer}
        onResetView={handleResetView}
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
      />

      {/* Multi-Section Clinical Data Panels */}
      <div className="viewer-details-grid">
        <CoordinatePanel
          target={viewModel.selectedTarget}
          confidenceRegion={viewModel.confidenceRegion}
        />

        <Counterfactual3DOverlay counterfactual={viewModel.counterfactual} />

        <ConfidenceRegionOverlay confidenceRegion={viewModel.confidenceRegion} />

        <CircuitOverlaySelector
          overlays={viewModel.circuitOverlays}
          activeCircuitId={activeCircuitId}
          onSelectCircuit={setActiveCircuitId}
          opacity={circuitOpacity}
          onChangeOpacity={setCircuitOpacity}
        />
      </div>

      {/* Screen Reader Full Accessibility Table (Section 129 WCAG 2.2 AA) */}
      <div className="sr-only" aria-live="polite">
        <h3>Accessible Text Equivalent for 3D Viewer</h3>
        <p>{viewModel.accessibleTextSummary}</p>
      </div>
    </div>
  );
}
