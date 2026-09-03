/**
 * @magniom/measurement-core - Measurement Provider Registry
 * Conforms to MAGNIOM-Neuroimaging, Neurophysiology & Multimodal Measurement Specification v2.0 (§5-6)
 */

import type { MeasurementModality } from '@magniom/domain';
import type { MeasurementProvider } from './contract.js';

export class MeasurementProviderRegistry {
  private readonly providersByModality = new Map<MeasurementModality, MeasurementProvider>();
  private readonly providersByCode = new Map<string, MeasurementProvider>();

  public register(provider: MeasurementProvider): void {
    const code = provider.manifest.code;
    if (this.providersByCode.has(code)) {
      throw new Error(`MeasurementProvider with code '${code}' is already registered.`);
    }

    this.providersByCode.set(code, provider);
    this.providersByModality.set(provider.modality, provider);
  }

  public getByModality(modality: MeasurementModality): MeasurementProvider | undefined {
    return this.providersByModality.get(modality);
  }

  public getByCode(code: string): MeasurementProvider | undefined {
    return this.providersByCode.get(code);
  }

  public listAll(): readonly MeasurementProvider[] {
    return Array.from(this.providersByCode.values());
  }

  public hasModality(modality: MeasurementModality): boolean {
    return this.providersByModality.has(modality);
  }
}

export const defaultMeasurementRegistry = new MeasurementProviderRegistry();
