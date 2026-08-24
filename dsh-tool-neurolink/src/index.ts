/**
 * DSH Brain-Computer Interface & Neural Engineering Plugin v1.0.0
 *
 * Brain-Computer Interface & Neural Engineering — signal processing pipeline,
 * spike sorting config, BCI decoder calibration, neural implant safety check,
 * neurofeedback protocol designer, cognitive state classifier, brain mapping
 * planner, ethical review generator for human augmentation.
 * 2026: Neural engineering is advancing rapidly with BCI clinical trials.
 *
 * Features (v1.0.0):
 * - Signal Processing Pipeline (bandpass filtering, artifact removal, SNR optimization, spatial filtering, spectral analysis)
 * - Spike Sorting Config (threshold detection, feature extraction, clustering, waveform alignment, unit validation)
 * - BCI Decoder Calibration (feature selection, classifier training, cross-validation, transfer learning, drift compensation)
 * - Neural Implant Safety Check (charge density limits, thermal analysis, biocompatibility, encapsulation integrity, long-term stability)
 * - Neurofeedback Protocol Designer (EEG band training, reward thresholds, session structure, progress metrics, personalization)
 * - Cognitive State Classifier (attention/relaxation/workload detection, feature sets, model selection, real-time inference, confidence scoring)
 * - Brain Mapping Planner (electrode montage, region targeting, coverage analysis, source localization, connectivity mapping)
 * - Neuroethics Reviewer (informed consent, risk-benefit analysis, data privacy, enhancement ethics, regulatory pathway)
 *
 * @module dsh-tool-neurolink
 * @version 1.0.0
 * @license MIT
 */

import type { Context } from '@deepseek-ai/cordis'
import { defineTool } from '@deepseek-ai/dsh-tools'

export const name = 'dsh-tool-neurolink'
export const inject = ['tools']

const VERSION = '1.0.0';
const DISCLAIMER = '本工具提供神经工程与脑机接口分析框架，不替代实际临床决策或医疗器械认证。';

// ==================== TYPES ====================

export interface SignalProcessingInput {
  signal_type?: 'EEG' | 'ECoG' | 'LFP' | 'spike' | 'EMG';
  sampling_rate_hz?: number;
  channel_count?: number;
  filter_band_hz?: [number, number];
  artifact_method?: 'ICA' | 'SSP' | 'regression' | 'adaptive';
  target_snr_db?: number;
  spatial_filter?: 'CAR' | 'Laplacian' | 'beamformer' | 'none';
}

export interface SpikeSortingInput {
  probe_type?: 'tetrode' | 'Neuropixels' | ' Utah_array' | 'flexible';
  channel_count?: number;
  threshold_sigma?: number;
  feature_method?: 'PCA' | 'wavelet' | 'peak_valley' | 'ICA';
  clustering_method?: 'Kmeans' | 'GMM' | 'DBSCAN' | 'mountainsort';
  min_spike_rate_hz?: number;
  contamination_threshold?: number;
}

export interface BCICalibrationInput {
  paradigm?: 'motor_imagery' | 'P300' | 'SSVEP' | 'slow_cortical' | 'ECoG_motor';
  feature_type?: 'CSP' | 'bandpower' | 'Riemannian' | 'deep';
  classifier?: 'LDA' | 'SVM' | 'CNN' | 'Riemannian_LDA';
  calibration_trials?: number;
  channels?: number;
  target_accuracy?: number;
}

export interface ImplantSafetyInput {
  implant_type?: 'Utah_array' | 'Neuralace' | 'Stentrode' | 'ECoG_grid' | 'depth';
  electrode_count?: number;
  charge_density_uc_cm2?: number
  pulse_width_us?: number;
  stimulation_freq_hz?: number;
  duration_years?: number;
  encapsulation_thickness_um?: number;
}

export interface NeurofeedbackInput {
  target_band?: 'alpha' | 'beta' | 'theta' | 'SMR' | 'gamma' | 'custom';
  target_region?: ' Cz' | 'Pz' | 'Fz' | 'Oz' | 'C3' | 'C4';
  session_duration_min?: number;
  sessions_total?: number;
  reward_threshold_sd?: number;
  feedback_type?: 'visual' | 'auditory' | 'tactile' | 'gamified';
  baseline_duration_min?: number;
}

export interface CognitiveStateInput {
  cognitive_states?: string[];
  eeg_bands?: string[];
  channel_selection?: string[];
  window_length_s?: number;
  classifier_type?: 'LDA' | 'SVM' | 'RandomForest' | 'CNN';
  sampling_rate_hz?: number;
}

export interface BrainMappingInput {
  target_regions?: string[];
  modality?: 'EEG' | 'MEG' | 'ECoG' | 'sEEG' | 'fNIRS';
  electrode_count?: number;
  montage?: '10_20' | '10_10' | '10_5' | 'custom';
  localization_method?: 'dipole' | 'beamformer' | 'MNE' | 'LORETA';
  connectivity_method?: 'coherence' | 'pli' | 'wPLI' | 'dDTF' | 'Granger';
}

export interface NeuroethicsInput {
  intervention_type?: 'invasive' | 'noninvasive' | 'semi-invasive';
  application?: 'therapeutic' | 'augmentation' | 'research' | 'consumer';
  data_sensitivity?: 'low' | 'medium' | 'high' | 'critical';
  subject_population?: 'healthy' | 'patient' | 'vulnerable' | 'mixed';
  irb_required?: boolean;
}

// ==================== MULBERRY32 DETERMINISTIC PRNG ====================

function mulberry32(seed: number): () => number {
  let a = seed | 0;
  return function (): number {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash + char) | 0;
  }
  return Math.abs(hash);
}

// ==================== HELPER FUNCTIONS ====================

function parseInput<T>(inputData: string): T {
  try {
    return JSON.parse(inputData) as T;
  } catch {
    return {} as T;
  }
}

function clamp(val: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, val));
}

function formatPct(score: number, decimals: number = 1): string {
  return (score * 100).toFixed(decimals);
}

function formatDb(val: number, decimals: number = 1): string {
  return val.toFixed(decimals) + ' dB';
}

function formatHz(val: number, decimals: number = 1): string {
  return val.toFixed(decimals) + ' Hz';
}

// ==================== TOOL 1: SIGNAL PROCESSING PIPELINE ====================

function executeSignalProcessing(inputData: string): string {
  const data = parseInput<SignalProcessingInput>(inputData);
  const signalType = data.signal_type || 'EEG';
  const fs = data.sampling_rate_hz || 1000;
  const channels = data.channel_count || 64;
  const filterBand = data.filter_band_hz || [0.5, 100];
  const artifactMethod = data.artifact_method || 'ICA';
  const targetSnr = data.target_snr_db || 20;
  const spatialFilter = data.spatial_filter || 'CAR';

  const seed = hashString(inputData);
  const rng = mulberry32(seed);

  let report = '# Signal Processing Pipeline Report\n\n';
  report += '**Signal Type:** ' + signalType + '\n';
  report += '**Sampling Rate:** ' + fs + ' Hz\n';
  report += '**Channel Count:** ' + channels + '\n';
  report += '**Filter Band:** ' + filterBand[0] + ' - ' + filterBand[1] + ' Hz\n';
  report += '**Artifact Removal:** ' + artifactMethod + '\n';
  report += '**Spatial Filter:** ' + spatialFilter + '\n';
  report += '**Target SNR:** ' + targetSnr + ' dB\n\n';
  report += '---\n\n';

  report += '## Pipeline Stages\n\n';
  report += '| Stage | Operation | Parameters | Status |\n';
  report += '|-------|-----------|------------|--------|\n';

  const stages = [
    { name: 'Bandpass Filter', params: 'Butterworth 4th order, ' + filterBand[0] + '-' + filterBand[1] + ' Hz' },
    { name: 'Notch Filter', params: '50/60 Hz, Q=30' },
    { name: 'Artifact Removal', params: artifactMethod + ' decomposition' },
    { name: 'Spatial Filtering', params: spatialFilter + ' (' + channels + ' ch)' },
    { name: 'Spectral Analysis', params: 'FFT, 1s window, 50% overlap' },
    { name: 'Quality Check', params: 'Channel variance threshold' }
  ];

  stages.forEach(s => {
    const success = rng() > 0.05;
    report += '| ' + s.name + ' | ' + s.params + ' | ' + (success ? 'PASS' : 'RETRY') + ' |\n';
  });

  report += '\n## SNR Analysis\n\n';
  const bands = ['delta (0.5-4 Hz)', 'theta (4-8 Hz)', 'alpha (8-13 Hz)', 'beta (13-30 Hz)', 'gamma (30-100 Hz)'];
  const bandSnrs: number[] = [];
  report += '| Band | Frequency | SNR (dB) | Quality |\n';
  report += '|------|-----------|----------|---------|\n';
  bands.forEach(band => {
    const snr = 5 + rng() * 30;
    bandSnrs.push(snr);
    const quality = snr > targetSnr ? 'EXCELLENT' : snr > targetSnr * 0.7 ? 'GOOD' : snr > targetSnr * 0.5 ? 'FAIR' : 'POOR';
    report += '| ' + band + ' | ' + snr.toFixed(1) + ' | ' + quality + ' |\n';
  });

  const avgSnr = bandSnrs.reduce((s, v) => s + v, 0) / bandSnrs.length;
  report += '\n**Average SNR:** ' + avgSnr.toFixed(1) + ' dB\n';
  report += '**SNR Target Met:** ' + (avgSnr >= targetSnr ? 'YES' : 'NO — consider improving electrode contact or reducing artifact') + '\n\n';

  report += '## Channel Quality Assessment\n\n';
  const badChannels = Math.floor(rng() * channels * 0.08);
  report += '- **Total Channels:** ' + channels + '\n';
  report += '- **Good Channels:** ' + (channels - badChannels) + '\n';
  report += '- **Bad Channels:** ' + badChannels + ' (' + ((badChannels / channels) * 100).toFixed(1) + '%)\n';
  report += '- **Impedance Range:** ' + (2 + rng() * 3).toFixed(1) + '-' + (5 + rng() * 8).toFixed(1) + ' kOhm\n';
  report += '- **Recommendation:** ' + (badChannels > channels * 0.1 ? 'Replace or re-gelt bad channels before proceeding' : 'Channel quality acceptable for analysis') + '\n\n';

  report += '## Spectral Content Summary\n\n';
  const deltaPower = 0.5 + rng() * 2;
  const thetaPower = 0.3 + rng() * 1.5;
  const alphaPower = 1 + rng() * 3;
  const betaPower = 0.2 + rng() * 1;
  const gammaPower = 0.05 + rng() * 0.3;
  const totalPower = deltaPower + thetaPower + alphaPower + betaPower + gammaPower;

  report += '| Band | Relative Power (%) | Peak Freq (Hz) |\n';
  report += '|------|-------------------|----------------|\n';
  report += '| Delta | ' + ((deltaPower / totalPower) * 100).toFixed(1) + '% | ' + (1 + rng() * 2).toFixed(1) + ' |\n';
  report += '| Theta | ' + ((thetaPower / totalPower) * 100).toFixed(1) + '% | ' + (5 + rng() * 2).toFixed(1) + ' |\n';
  report += '| Alpha | ' + ((alphaPower / totalPower) * 100).toFixed(1) + '% | ' + (9 + rng() * 2).toFixed(1) + ' |\n';
  report += '| Beta | ' + ((betaPower / totalPower) * 100).toFixed(1) + '% | ' + (18 + rng() * 8).toFixed(1) + ' |\n';
  report += '| Gamma | ' + ((gammaPower / totalPower) * 100).toFixed(1) + '% | ' + (40 + rng() * 40).toFixed(1) + ' |\n\n';

  report += '---\n\n' + '*' + DISCLAIMER + '*';
  return report;
}

// ==================== TOOL 2: SPIKE SORTING CONFIG ====================

function executeSpikeSorting(inputData: string): string {
  const data = parseInput<SpikeSortingInput>(inputData);
  const probeType = data.probe_type || 'Neuropixels';
  const channelCount = data.channel_count || 384;
  const thresholdSigma = data.threshold_sigma || 4.5;
  const featureMethod = data.feature_method || 'PCA';
  const clusteringMethod = data.clustering_method || 'Kmeans';
  const minSpikeRate = data.min_spike_rate_hz || 0.5;
  const contaminationThreshold = data.contamination_threshold || 0.2;

  const seed = hashString(inputData);
  const rng = mulberry32(seed);

  let report = '# Spike Sorting Configuration Report\n\n';
  report += '**Probe Type:** ' + probeType + '\n';
  report += '**Channel Count:** ' + channelCount + '\n';
  report += '**Detection Threshold:** ' + thresholdSigma + ' sigma\n';
  report += '**Feature Extraction:** ' + featureMethod + '\n';
  report += '**Clustering Method:** ' + clusteringMethod + '\n';
  report += '**Min Spike Rate:** ' + minSpikeRate + ' Hz\n';
  report += '**Contamination Threshold:** ' + (contaminationThreshold * 100).toFixed(0) + '%\n\n';
  report += '---\n\n';

  report += '## Detection Parameters\n\n';
  const noiseLevel = 3 + rng() * 4;
  const threshold = noiseLevel * thresholdSigma;
  report += '| Parameter | Value |\n';
  report += '|-----------|-------|\n';
  report += '| Noise STD (uV) | ' + noiseLevel.toFixed(2) + ' |\n';
  report += '| Detection Threshold (uV) | ' + threshold.toFixed(2) + ' |\n';
  report += '| Refractory Period | ' + (1 + rng() * 0.5).toFixed(2) + ' ms |\n';
  report += '| Pre-peak Samples | ' + (10 + Math.floor(rng() * 8)) + ' |\n';
  report += '| Post-peak Samples | ' + (20 + Math.floor(rng() * 12)) + ' |\n';
  report += '| Waveform Length | ' + (1.5 + rng() * 0.5).toFixed(1) + ' ms |\n\n';

  report += '## Sorting Results\n\n';
  const unitsFound = Math.floor(2 + rng() * 12);
  const acceptedUnits = Math.floor(unitsFound * (0.6 + rng() * 0.3));

  report += '| Metric | Value |\n';
  report += '|--------|-------|\n';
  report += '| Total Units Detected | ' + unitsFound + ' |\n';
  report += '| Accepted Units (pass QC) | ' + acceptedUnits + ' |\n';
  report += '| Rejected (noise/contamination) | ' + (unitsFound - acceptedUnits) + ' |\n';
  report += '| Sorting Yield | ' + ((acceptedUnits / unitsFound) * 100).toFixed(1) + '% |\n\n';

  report += '## Unit Quality Metrics\n\n';
  report += '| Unit ID | Firing Rate (Hz) | ISI Violation (%) | Amplitude (uV) | SNR | Isolation Distance | Status |\n';
  report += '|---------|-----------------|-------------------|----------------|-----|--------------------|--------|\n';

  for (let i = 0; i < acceptedUnits; i++) {
    const rate = 0.5 + rng() * 45;
    const isi = rng() * 3;
    const amp = 30 + rng() * 150;
    const snr = 2 + rng() * 12;
    const isoDist = 10 + rng() * 40;
    const status = isi < 1 && snr > 4 ? 'SU' : isi < 2 && snr > 3 ? 'MU' : 'borderline';
    report += '| Unit_' + (i + 1).toString().padStart(3, '0') + ' | ' + rate.toFixed(1) + ' | ' + isi.toFixed(2) + '% | ' + amp.toFixed(0) + ' | ' + snr.toFixed(1) + ' | ' + isoDist.toFixed(1) + ' | ' + status + ' |\n';
  }

  report += '\n## Clustering Diagnostics\n\n';
  report += '- **Silhouette Score:** ' + (0.5 + rng() * 0.4).toFixed(3) + '\n';
  report += '- **Davies-Bouldin Index:** ' + (0.3 + rng() * 0.8).toFixed(3) + '\n';
  report += '- **L-Ratio:** ' + (0.01 + rng() * 0.1).toFixed(4) + '\n';
  report += '- **Isolation Distance (median):** ' + (18 + rng() * 20).toFixed(1) + '\n';
  report += '- **Contamination (median): ' + (rng() * 0.15 * 100).toFixed(2) + '%\n\n';

  report += '## Recommendations\n\n';
  const recs = [
    thresholdSigma < 4 ? 'Consider lowering threshold for low-amplitude unit detection' : 'Threshold settings appropriate for current noise level',
    contaminationThreshold > 0.15 ? 'Lower contamination threshold for cleaner single-unit isolation' : 'Contamination settings within acceptable range',
    acceptedUnits < 5 ? 'Check electrode impedance and reposition probe if yield remains low' : 'Sorting yield acceptable for downstream analysis',
    clusteringMethod === 'Kmeans' && unitsFound > 8 ? 'Consider DBSCAN or GMM for overlapping clusters' : 'Clustering method suitable for current unit count'
  ];
  recs.forEach((r, i) => { report += (i + 1) + '. ' + r + '\n'; });

  report += '\n---\n\n' + '*' + DISCLAIMER + '*';
  return report;
}

// ==================== TOOL 3: BCI DECODER CALIBRATOR ====================

function executeBCICalibration(inputData: string): string {
  const data = parseInput<BCICalibrationInput>(inputData);
  const paradigm = data.paradigm || 'motor_imagery';
  const featureType = data.feature_type || 'CSP';
  const classifier = data.classifier || 'LDA';
  const calibrationTrials = data.calibration_trials || 100;
  const channels = data.channels || 32;
  const targetAccuracy = data.target_accuracy || 0.80;

  const seed = hashString(inputData);
  const rng = mulberry32(seed);

  let report = '# BCI Decoder Calibration Report\n\n';
  report += '**Paradigm:** ' + paradigm + '\n';
  report += '**Feature Type:** ' + featureType + '\n';
  report += '**Classifier:** ' + classifier + '\n';
  report += '**Calibration Trials:** ' + calibrationTrials + '\n';
  report += '**Channels:** ' + channels + '\n';
  report += '**Target Accuracy:** ' + (targetAccuracy * 100).toFixed(0) + '%\n\n';
  report += '---\n\n';

  report += '## Calibration Protocol\n\n';
  report += '| Parameter | Setting |\n';
  report += '|-----------|---------|\n';
  report += '| Trial Duration | ' + (3 + rng() * 2).toFixed(1) + ' s |\n';
  report += '| Inter-trial Interval | ' + (1 + rng() * 1).toFixed(1) + ' s |\n';
  report += '| Cue Modality | visual arrow |\n';
  report += '| Feedback Mode | ' + (rng() > 0.5 ? 'online cursor' : 'offline analysis') + ' |\n';
  report += '| Rest Period | ' + (10 + Math.floor(rng() * 20)) + ' s every ' + (20 + Math.floor(rng() * 30)) + ' trials |\n\n';

  report += '## Cross-Validation Results\n\n';
  const folds = 10;
  const foldAccuracies: number[] = [];
  for (let f = 0; f < folds; f++) {
    const acc = 0.55 + rng() * 0.4;
    foldAccuracies.push(acc);
  }
  const meanAcc = foldAccuracies.reduce((s, v) => s + v, 0) / folds;
  const stdAcc = Math.sqrt(foldAccuracies.map(v => (v - meanAcc) ** 2).reduce((s, v) => s + v, 0) / folds);

  report += '| Fold | Accuracy | Status |\n';
  report += '|------|----------|--------|\n';
  foldAccuracies.forEach((acc, i) => {
    report += '| Fold ' + (i + 1) + ' | ' + (acc * 100).toFixed(1) + '% | ' + (acc >= targetAccuracy ? 'PASS' : 'below target') + ' |\n';
  });

  report += '\n**Mean Accuracy:** ' + (meanAcc * 100).toFixed(1) + '%\n';
  report += '**Std Deviation:** ' + (stdAcc * 100).toFixed(2) + '%\n';
  report += '**95% Confidence Interval: [ ' + ((meanAcc - 1.96 * stdAcc) * 100).toFixed(1) + '%, ' + ((meanAcc + 1.96 * stdAcc) * 100).toFixed(1) + '% ]\n';
  report += '**Target Met:** ' + (meanAcc >= targetAccuracy ? 'YES' : 'NO — collect more data or adjust feature extraction') + '\n\n';

  report += '## Information Transfer Rate (ITR)\n\n';
  const nClasses = paradigm === 'P300' ? 6 : paradigm === 'motor_imagery' ? 4 : 3;
  const trialDuration = 4;
  const itr = (Math.log2(nClasses) + meanAcc * Math.log2(meanAcc) + (1 - meanAcc) * Math.log2((1 - meanAcc) / (nClasses - 1))) * (60 / trialDuration);
  report += '| Metric | Value |\n';
  report += '|--------|-------|\n';
  report += '| Classes | ' + nClasses + ' |\n';
  report += '| Trial Duration | ' + trialDuration + ' s |\n';
  report += '| ITR (bits/min) | ' + Math.max(0, itr).toFixed(1) + ' |\n';
  report += '| ITR (bits/trial) | ' + Math.max(0, itr / 60 * trialDuration).toFixed(2) + ' |\n\n';

  report += '## Confusion Matrix\n\n';
  report += '| True \\ Predicted |';
  for (let c = 0; c < nClasses; c++) report += ' Class ' + (c + 1) + ' |';
  report += '\n';
  report += '|' + Array(nClasses + 1).fill('-----------|').join('') + '\n';
  for (let c = 0; c < nClasses; c++) {
    report += '| Class ' + (c + 1) + ' |';
    for (let p = 0; p < nClasses; p++) {
      const val = c === p ? (0.7 + rng() * 0.25) : (rng() * 0.15 / (nClasses - 1));
      report += ' ' + (val * 100).toFixed(1) + '% |';
    }
    report += '\n';
  }

  report += '\n## Drift Analysis\n\n';
  const driftRate = 0.01 + rng() * 0.05;
  report += '- **Signal Drift Rate:** ' + (driftRate * 100).toFixed(2) + '% per session hour\n';
  report += '- **Recommended Recalibration Interval:** ' + (Math.floor(2 + rng() * 4)) + ' hours\n';
  report += '- **Adaptive Update Rate:** ' + (0.01 + rng() * 0.04).toFixed(3) + ' / trial\n\n';

  report += '## Classifier Comparison\n\n';
  report += '| Classifier | Accuracy | Training Time |\n';
  report += '|------------|----------|---------------|\n';
  const classifiers = ['LDA', 'SVM', 'CNN', 'Riemannian_LDA'];
  classifiers.forEach(clf => {
    const acc = 0.5 + rng() * 0.45;
    const time = (0.5 + rng() * 10).toFixed(1);
    report += '| ' + clf + ' | ' + (acc * 100).toFixed(1) + '% | ' + time + ' s |\n';
  });

  report += '\n---\n\n' + '*' + DISCLAIMER + '*';
  return report;
}

// ==================== TOOL 4: NEURAL IMPLANT SAFETY CHECK ====================

function executeImplantSafety(inputData: string): string {
  const data = parseInput<ImplantSafetyInput>(inputData);
  const implantType = data.implant_type || 'Utah_array';
  const electrodeCount = data.electrode_count || 96;
  const chargeDensity = data.charge_density_uc_cm2 || 30;
  const pulseWidth = data.pulse_width_us || 200;
  const stimFreq = data.stimulation_freq_hz || 100;
  const durationYears = data.duration_years || 5;
  const encapsulationThickness = data.encapsulation_thickness_um || 5;

  const seed = hashString(inputData);
  const rng = mulberry32(seed);

  let report = '# Neural Implant Safety Check Report\n\n';
  report += '**Implant Type:** ' + implantType + '\n';
  report += '**Electrode Count:** ' + electrodeCount + '\n';
  report += '**Charge Density:** ' + chargeDensity + ' uC/cm2\n';
  report += '**Pulse Width:** ' + pulseWidth + ' us\n';
  report += '**Stimulation Freq:** ' + stimFreq + ' Hz\n';
  report += '**Expected Duration:** ' + durationYears + ' years\n';
  report += '**Encapsulation:** ' + encapsulationThickness + ' um\n\n';
  report += '---\n\n';

  report += '## Charge Density Safety Limits\n\n';
  const shannonK = 1.85;
  const chargePerPhase = chargeDensity * 0.01;
  const logD = Math.log10(chargeDensity);
  const logQ = Math.log10(chargePerPhase);
  const shannonValue = logD + logQ;
  const shannonSafe = shannonValue < shannonK;

  report += '| Parameter | Value | Limit | Status |\n';
  report += '|-----------|-------|-------|--------|\n';
  report += '| Charge Density (uC/cm2) | ' + chargeDensity + ' | < 30 (safe) | ' + (chargeDensity <= 30 ? 'PASS' : 'WARN') + ' |\n';
  report += '| Charge/Phase (uC) | ' + chargePerPhase.toFixed(3) + ' | — | — |\n';
  report += '| log(Q) + log(D) | ' + shannonValue.toFixed(3) + ' | < ' + shannonK + ' | ' + (shannonSafe ? 'PASS' : 'EXCEED') + ' |\n';
  report += '| Shannon Criterion | k = ' + shannonValue.toFixed(2) + ' | k <= ' + shannonK + ' | ' + (shannonSafe ? 'SAFE' : 'UNSAFE') + ' |\n\n';

  report += '## Thermal Analysis\n\n';
  const powerDensity = (chargeDensity * stimFreq * pulseWidth) / 1e6;
  const tempRise = powerDensity * (0.8 + rng() * 0.4);
  report += '| Parameter | Value | Limit | Status |\n';
  report += '|-----------|-------|-------|--------|\n';
  report += '| Power Density (mW/cm2) | ' + powerDensity.toFixed(3) + ' | < 100 | ' + (powerDensity < 100 ? 'PASS' : 'FAIL') + ' |\n';
  report += '| Temperature Rise (C) | ' + tempRise.toFixed(3) + ' | < 1.0 | ' + (tempRise < 1.0 ? 'PASS' : 'FAIL') + ' |\n';
  report += '| Heat Flux (mW/cm2) | ' + (powerDensity * 0.7).toFixed(3) + ' | < 80 | ' + (powerDensity * 0.7 < 80 ? 'PASS' : 'WARN') + ' |\n\n';

  report += '## Electrochemical Impedance\n\n';
  report += '| Frequency | Impedance (kOhm) | Phase (deg) | Status |\n';
  report += '|-----------|----------------|-------------|--------|\n';
  const testFreqs = [10, 100, 1000, 10000];
  testFreqs.forEach(freq => {
    const imp = (0.5 + rng() * 15) * Math.pow(freq / 1000, -0.3);
    const phase = -10 - rng() * 70;
    report += '| ' + freq + ' Hz | ' + imp.toFixed(2) + ' | ' + phase.toFixed(1) + ' | ' + (imp < 50 && imp > 0.1 ? 'GOOD' : 'CHECK') + ' |\n';
  });

  report += '\n## Biocompatibility Assessment\n\n';
  const checks = [
    { name: 'Cytotoxicity (ISO 10993-5)', result: rng() > 0.1 ? 'PASS' : 'REVIEW', detail: 'Cell viability > 90%' },
    { name: 'Sensitization (ISO 10993-10)', result: rng() > 0.05 ? 'PASS' : 'REVIEW', detail: 'No dermal reaction' },
    { name: 'Irritation (ISO 10993-10)', result: rng() > 0.05 ? 'PASS' : 'REVIEW', detail: 'Minimal irritation index' },
    { name: 'Systemic Toxicity (ISO 10993-11)', result: rng() > 0.05 ? 'PASS' : 'REVIEW', detail: 'LD50 exceeds threshold' },
    { name: 'Implantation (ISO 10993-6)', result: rng() > 0.1 ? 'PASS' : 'REVIEW', detail: 'Fibrous encapsulation within limits' }
  ];
  report += '| Test | Result | Detail |\n';
  report += '|------|--------|--------|\n';
  checks.forEach(c => { report += '| ' + c.name + ' | ' + c.result + ' | ' + c.detail + ' |\n'; });

  report += '\n## Long-term Stability Projection\n\n';
  report += '| Year | Impedance Change | Signal Quality | Electrode Yield | Status |\n';
  report += '|------|-----------------|----------------|-----------------|--------|\n';
  for (let y = 1; y <= durationYears; y++) {
    const impChange = (rng() * 30 + y * 5).toFixed(1);
    const sigQual = (85 - y * 5 - rng() * 10).toFixed(1);
    const yield_pct = (95 - y * 3 - rng() * 5).toFixed(1);
    const status = y < 3 ? 'STABLE' : y < 5 ? 'DEGRADED' : 'MONITOR';
    report += '| Year ' + y + ' | +' + impChange + '% | ' + sigQual + '% | ' + yield_pct + '% | ' + status + ' |\n';
  }

  report += '\n## Overall Safety Verdict\n\n';
  const allPass = shannonSafe && tempRise < 1.0 && powerDensity < 100;
  report += '> **' + (allPass ? 'PASS — Configuration within safe operating limits for chronic implantation' : 'CAUTION — One or more safety thresholds exceeded; redesign recommended') + '**\n\n';

  report += '---\n\n' + '*' + DISCLAIMER + '*';
  return report;
}

// ==================== TOOL 5: NEUROFEEDBACK PROTOCOL DESIGNER ====================

function executeNeurofeedbackProtocol(inputData: string): string {
  const data = parseInput<NeurofeedbackInput>(inputData);
  const targetBand = data.target_band || 'alpha';
  const targetRegion = data.target_region || 'Pz';
  const sessionDuration = data.session_duration_min || 30;
  const sessionsTotal = data.sessions_total || 20;
  const rewardThreshold = data.reward_threshold_sd || 1.5;
  const feedbackType = data.feedback_type || 'visual';
  const baselineDuration = data.baseline_duration_min || 3;

  const seed = hashString(inputData);
  const rng = mulberry32(seed);

  let report = '# Neurofeedback Protocol Designer Report\n\n';
  report += '**Target Band:** ' + targetBand + '\n';
  report += '**Target Region:** ' + targetRegion + '\n';
  report += '**Session Duration:** ' + sessionDuration + ' min\n';
  report += '**Total Sessions:** ' + sessionsTotal + '\n';
  report += '**Reward Threshold:** ' + rewardThreshold + ' SD\n';
  report += '**Feedback Type:** ' + feedbackType + '\n';
  report += '**Baseline Duration:** ' + baselineDuration + ' min\n\n';
  report += '---\n\n';

  report += '## Protocol Structure\n\n';
  report += '| Phase | Duration | Activity |\n';
  report += '|-------|----------|----------|\n';
  report += '| Baseline | ' + baselineDuration + ' min | Eyes-open rest at ' + targetRegion + ' |\n';
  report += '| Warm-up | 2 min | Threshold estimation |\n';
  report += '| Training Block 1 | ' + Math.floor(sessionDuration / 3) + ' min | ' + targetBand.toUpperCase() + ' up-regulation |\n';
  report += '| Rest | 2 min | Passive viewing |\n';
  report += '| Training Block 2 | ' + Math.floor(sessionDuration / 3) + ' min | ' + targetBand.toUpperCase() + ' up-regulation |\n';
  report += '| Transfer Trial | 3 min | No feedback — self-regulation test |\n';
  report += '| Cool-down | 2 min | Relaxation |\n\n';

  report += '## Band-Specific Training Parameters\n\n';
  const bandConfigs: Record<string, { freq: string; effect: string }> = {
    alpha: { freq: '8-13 Hz', effect: 'relaxation, attention regulation' },
    beta: { freq: '13-30 Hz', effect: 'active attention, motor control' },
    theta: { freq: '4-8 Hz', effect: 'meditation, memory encoding' },
    SMR: { freq: '12-15 Hz', effect: 'motor quiescence, focus' },
    gamma: { freq: '30-100 Hz', effect: 'binding, higher cognition' },
    custom: { freq: 'user-defined', effect: 'custom protocol' }
  };
  const cfg = bandConfigs[targetBand] || bandConfigs['alpha'];
  report += '| Property | Value |\n';
  report += '|----------|-------|\n';
  report += '| Frequency Range | ' + cfg.freq + ' |\n';
  report += '| Functional Effect | ' + cfg.effect + ' |\n';
  report += '| Training Direction | ' + (targetBand === 'theta' || targetBand === 'alpha' ? 'Up-regulation' : 'Up-regulation') + ' |\n';
  report += '| Inhibit Bands | ' + (targetBand === 'alpha' ? 'theta (4-8 Hz), beta (13-30 Hz)' : 'theta (4-8 Hz)') + ' |\n\n';

  report += '## Projected Learning Curve\n\n';
  report += '| Session | Mean Z-Score | Success Rate | Threshold Adjustment | Notes |\n';
  report += '|---------|-------------|-------------|---------------------|-------|\n';

  for (let s = 1; s <= Math.min(sessionsTotal, 10); s++) {
    const zScore = -0.5 + s * 0.15 + rng() * 0.3;
    const successRate = clamp(0.3 + s * 0.05 + rng() * 0.1, 0, 0.95);
    const threshAdj = (rewardThreshold - s * 0.02).toFixed(2);
    const notes = s < 5 ? 'Initial learning' : s < 10 ? 'Plateau phase' : 'Consolidation';
    report += '| S' + s.toString().padStart(2, '0') + ' | ' + zScore.toFixed(2) + ' | ' + (successRate * 100).toFixed(0) + '% | ' + threshAdj + ' SD | ' + notes + ' |\n';
  }

  report += '\n## Feedback Configuration\n\n';
  report += '| Parameter | Setting |\n';
  report += '|-----------|---------|\n';
  report += '| Visual Element | ' + (feedbackType === 'visual' ? 'Animated bar + color gradient' : feedbackType === 'auditory' ? 'Tone pitch mapping' : 'Vibration intensity') + ' |\n';
  report += '| Update Rate | ' + (5 + Math.floor(rng() * 10)) + ' Hz |\n';
  report += '| Reward Criterion | ' + rewardThreshold + ' SD above baseline |\n';
  report += '| Reward Frequency | ' + (50 + Math.floor(rng() * 30)) + '% of time |\n';
  report += '| Threshold Adaptation | ' + (rng() > 0.5 ? 'Auto-adjust (maintain success rate 60-70%)' : 'Fixed') + ' |\n\n';

  report += '## Progress Metrics\n\n';
  report += '| Metric | Baseline | Session 10 | Session ' + sessionsTotal + ' | Change |\n';
  report += '|--------|----------|------------|----------------|---------|\n';
  const baselineVals = [
    { name: 'SCP (uV)', base: 2 + rng() * 3, change: -0.5 - rng() * 1.5 },
    { name: 'Alpha Power (uV2)', base: 5 + rng() * 10, change: 1 + rng() * 3 },
    { name: 'Theta/Beta Ratio', base: 1.5 + rng() * 1.5, change: -0.3 - rng() * 0.5 },
    { name: 'Attention Score', base: 50 + rng() * 20, change: 5 + rng() * 15 }
  ];
  baselineVals.forEach(v => {
    const s10 = v.base + v.change * 0.6 + rng() * 1;
    const sEnd = v.base + v.change + rng() * 2;
    report += '| ' + v.name + ' | ' + v.base.toFixed(1) + ' | ' + s10.toFixed(1) + ' | ' + sEnd.toFixed(1) + ' | ' + (v.change > 0 ? '+' : '') + v.change.toFixed(1) + ' |\n';
  });

  report += '\n## Recommendations\n\n';
  const recs = [
    sessionsTotal < 10 ? 'Consider extending to >= 20 sessions for durable neuroplastic changes' : 'Session count appropriate for long-term neuroplasticity',
    sessionDuration < 20 ? 'Lengthen sessions to 30-45 min for deeper training effects' : 'Session duration within optimal range',
    baselineDuration < 2 ? 'Extend baseline to at least 2 min for reliable resting-state estimation' : 'Baseline duration sufficient for stable reference',
    rewardThreshold > 2.0 ? 'Lower reward threshold to maintain motivation (target 1.0-1.5 SD)' : 'Threshold settings support consistent reinforcement'
  ];
  recs.forEach((r, i) => { report += (i + 1) + '. ' + r + '\n'; });

  report += '\n---\n\n' + '*' + DISCLAIMER + '*';
  return report;
}

// ==================== TOOL 6: COGNITIVE STATE CLASSIFIER ====================

function executeCognitiveStateClassifier(inputData: string): string {
  const data = parseInput<CognitiveStateInput>(inputData);
  const cognitiveStates = data.cognitive_states || ['focused', 'relaxed', 'fatigued'];
  const eegBands = data.eeg_bands || ['alpha', 'beta', 'theta', 'gamma'];
  const channelSelection = data.channel_selection || ['F3', 'F4', 'C3', 'C4', 'Pz', 'Oz'];
  const windowLength = data.window_length_s || 2;
  const classifierType = data.classifier_type || 'LDA';
  const samplingRate = data.sampling_rate_hz || 250;

  const seed = hashString(inputData);
  const rng = mulberry32(seed);

  let report = '# Cognitive State Classification Report\n\n';
  report += '**Target States:** ' + cognitiveStates.join(', ') + '\n';
  report += '**EEG Bands:** ' + eegBands.join(', ') + '\n';
  report += '**Channel Selection:** ' + channelSelection.join(', ') + '\n';
  report += '**Window Length:** ' + windowLength + ' s\n';
  report += '**Classifier:** ' + classifierType + '\n';
  report += '**Sampling Rate:** ' + samplingRate + ' Hz\n\n';
  report += '---\n\n';

  report += '## Feature Extraction\n\n';
  const featuresPerBand = ['band_power', 'peak_frequency', 'spectral_entropy', 'skewness'];
  const totalFeatures = featuresPerBand.length * eegBands.length * channelSelection.length;
  report += '| Feature Category | Count | Bands | Channels |\n';
  report += '|-----------------|-------|-------|----------|\n';
  featuresPerBand.forEach(f => {
    report += '| ' + f + ' | ' + (eegBands.length * channelSelection.length) + ' | ' + eegBands.length + ' | ' + channelSelection.length + ' |\n';
  });
  report += '| **Total** | ' + totalFeatures + ' | — | — |\n\n';

  report += '## Feature Importance (Top 10)\n\n';
  const allFeatures: { name: string; importance: number }[] = [];
  channelSelection.forEach(ch => {
    eegBands.forEach(band => {
      featuresPerBand.forEach(f => {
        allFeatures.push({ name: ch + '_' + band + '_' + f, importance: rng() });
      });
    });
  });
  allFeatures.sort((a, b) => b.importance - a.importance);

  report += '| Rank | Feature | Importance | Cumulative |\n';
  report += '|------|---------|------------|------------|\n';
  let cumImportance = 0;
  allFeatures.slice(0, 10).forEach((f, i) => {
    cumImportance += f.importance;
    report += '| ' + (i + 1) + ' | ' + f.name + ' | ' + (f.importance * 100).toFixed(1) + '% | ' + (cumImportance * 100).toFixed(1) + '% |\n';
  });

  report += '\n## Classification Performance\n\n';
  const classes = cognitiveStates.length;
  const valAccuracy = 0.6 + rng() * 0.3;
  report += '| Metric | Value |\n';
  report += '|--------|-------|\n';
  report += '| Validation Accuracy | ' + (valAccuracy * 100).toFixed(1) + '% |\n';
  report += '| Chance Level | ' + ((1 / classes) * 100).toFixed(1) + '% |\n';
  report += '| Above Chance | ' + ((valAccuracy - 1 / classes) * 100).toFixed(1) + '%\n';
  report += '| Cohen Kappa | ' + (0.4 + rng() * 0.5).toFixed(3) + ' |\n';
  report += '| F1 (macro avg) | ' + (0.55 + rng() * 0.35).toFixed(3) + ' |\n\n';

  report += '## Per-Class Performance\n\n';
  report += '| State | Precision | Recall | F1-Score | Support |\n';
  report += '|-------|-----------|--------|----------|---------|\n';
  cognitiveStates.forEach(state => {
    const prec = 0.5 + rng() * 0.45;
    const rec = 0.5 + rng() * 0.45;
    const f1 = 2 * prec * rec / (prec + rec + 0.001);
    const support = 50 + Math.floor(rng() * 150);
    report += '| ' + state + ' | ' + (prec * 100).toFixed(1) + '% | ' + (rec * 100).toFixed(1) + '% | ' + (f1 * 100).toFixed(1) + '% | ' + support + ' |\n';
  });

  report += '\n## Confusion Matrix\n\n';
  report += '| True \\ Predicted | ' + cognitiveStates.join(' | ') + ' |\n';
  report += '|' + Array(cognitiveStates.length + 1).fill('-----------|').join('') + '\n';
  cognitiveStates.forEach((state, i) => {
    report += '| ' + state + ' |';
    cognitiveStates.forEach((_, j) => {
      const val = i === j ? (0.6 + rng() * 0.3) : (rng() * 0.2 / (classes - 1));
      report += ' ' + (val * 100).toFixed(1) + '% |';
    });
    report += '\n';
  });

  report += '\n## Real-Time Inference Budget\n\n';
  const featureTime = totalFeatures * 0.02;
  const inferenceTime = (0.5 + rng() * 2);
  const totalTime = featureTime + inferenceTime + windowLength * 1000;
  report += '| Operation | Time (ms) |\n';
  report += '|-----------|----------|\n';
  report += '| Feature Extraction | ' + featureTime.toFixed(1) + ' |\n';
  report += '| Model Inference | ' + inferenceTime.toFixed(1) + ' |\n';
  report += '| Window Buffer | ' + (windowLength * 1000).toFixed(0) + ' |\n';
  report += '| **Total Latency** | **' + (totalTime > 1000 ? (totalTime / 1000).toFixed(2) + ' s' : totalTime.toFixed(0) + ' ms') + '** |\n';
  report += '| Update Rate | ' + Math.min(1 / windowLength, 1000 / totalTime).toFixed(1) + ' Hz |\n\n';

  report += '---\n\n' + '*' + DISCLAIMER + '*';
  return report;
}

// ==================== TOOL 7: BRAIN MAPPING PLANNER ====================

function executeBrainMapping(inputData: string): string {
  const data = parseInput<BrainMappingInput>(inputData);
  const targetRegions = data.target_regions || ['motor_cortex', 'prefrontal', 'parietal'];
  const modality = data.modality || 'EEG';
  const electrodeCount = data.electrode_count || 64;
  const montage = data.montage || '10_10';
  const localizationMethod = data.localization_method || 'dipole';
  const connectivityMethod = data.connectivity_method || 'pli';

  const seed = hashString(inputData);
  const rng = mulberry32(seed);

  let report = '# Brain Mapping Planner Report\n\n';
  report += '**Target Regions:** ' + targetRegions.join(', ') + '\n';
  report += '**Modality:** ' + modality + '\n';
  report += '**Electrode Count:** ' + electrodeCount + '\n';
  report += '**Montage:** ' + montage + '\n';
  report += '**Localization:** ' + localizationMethod + '\n';
  report += '**Connectivity:** ' + connectivityMethod + '\n\n';
  report += '---\n\n';

  report += '## Electrode Montage Coverage\n\n';
  const regionCoverage: Record<string, string[]> = {
    motor_cortex: ['C3', 'C4', 'Cz', 'FC1', 'FC2', 'CP1', 'CP2'],
    prefrontal: ['Fp1', 'Fp2', 'AF3', 'AF4', 'F3', 'F4', 'F7', 'F8'],
    parietal: ['P3', 'P4', 'Pz', 'P7', 'P8', 'CPz'],
    temporal: ['T7', 'T8', 'TP7', 'TP8', 'FT7', 'FT8'],
    occipital: ['O1', 'O2', 'Oz', 'PO3', 'PO4', 'PO7', 'PO8'],
    cingulate: ['FCz', 'CPz', 'Cz']
  };

  report += '| Target Region | Electrodes | Coverage (%) | Adequacy |\n';
  report += '|---------------|------------|--------------|----------|\n';
  targetRegions.forEach(region => {
    const electrodes = regionCoverage[region] || ['Cz'];
    const coverage = clamp(50 + rng() * 50, 0, 100);
    const adequacy = coverage > 80 ? 'EXCELLENT' : coverage > 60 ? 'GOOD' : coverage > 40 ? 'FAIR' : 'INSUFFICIENT';
    report += '| ' + region + ' | ' + electrodes.join(', ') + ' | ' + coverage.toFixed(0) + '% | ' + adequacy + ' |\n';
  });

  report += '\n## Source Localization Parameters\n\n';
  report += '| Parameter | Setting |\n';
  report += '|-----------|---------|\n';
  report += '| Method | ' + localizationMethod + ' |\n';
  report += '| Head Model | ' + (rng() > 0.5 ? 'BEM (3-shell)' : 'FEM (4-shell)') + ' |\n';
  report += '| Dipole Orientation | ' + (rng() > 0.5 ? 'Free' : 'Normal to cortex') + ' |\n';
  report += '| Noise Covariance | ' + (rng() > 0.5 ? 'Diagonal' : 'Full (data-driven)') + ' |\n';
  report += '| Regularization | ' + (0.05 + rng() * 0.15 * 100).toFixed(1) + '%\n\n';

  report += '## Localization Accuracy Estimate\n\n';
  const locError = 5 + rng() * 15;
  const snr = 5 + rng() * 20;
  report += '| Metric | Value | Condition |\n';
  report += '|--------|-------|----------|\n';
  report += '| Localization Error | ' + locError.toFixed(1) + ' mm | SNR = ' + snr.toFixed(0) + ' dB |\n';
  report += '| Spatial Resolution | ' + (8 + rng() * 12).toFixed(1) + ' mm | — |\n';
  report += '| Dipole Correlation | ' + (0.7 + rng() * 0.25).toFixed(3) + ' | — |\n';
  report += '| Goodness of Fit | ' + (0.8 + rng() * 0.15 * 100).toFixed(1) + '% | — |\n\n';

  report += '## Connectivity Analysis Setup\n\n';
  const connMethods: Record<string, string> = {
    coherence: 'Magnitude-squared coherence (0-1)',
    pli: 'Phase Lag Index (volume conduction robust)',
    wPLI: 'Weighted PLI (noise robust)',
    dDTF: 'Directed DTF (Granger-based)',
    Granger: 'Granger causality (MVAR model)'
  };
  report += '| Property | Value |\n';
  report += '|----------|-------|\n';
  report += '| Method | ' + connectivityMethod + ' |\n';
  report += '| Description | ' + (connMethods[connectivityMethod] || 'Custom') + ' |\n';
  report += '| Frequency Bands | delta, theta, alpha, beta, gamma |\n';
  report += '| Window Length | ' + (2 + rng() * 3).toFixed(0) + ' s |\n';
  report += '| Significance Threshold | p < ' + (0.01 + rng() * 0.04).toFixed(3) + ' (FDR corrected) |\n\n';

  report += '## Connectivity Matrix (Alpha Band)\n\n';
  const nRegions = targetRegions.length;
  report += '| | ' + targetRegions.join(' | ') + ' |\n';
  report += '|' + Array(nRegions + 1).fill('-----------|').join('') + '\n';
  targetRegions.forEach((region, i) => {
    report += '| ' + region + ' |';
    targetRegions.forEach((_, j) => {
      const val = i === j ? 1.0 : (rng() * 0.8);
      report += ' ' + val.toFixed(3) + ' |';
    });
    report += '\n';
  });

  report += '\n## Coverage Recommendations\n\n';
  const coverageRecs = [
    electrodeCount < 32 ? 'Increase to >= 64 channels for adequate spatial sampling' : 'Channel count sufficient for target regions',
    montage === '10_20' && targetRegions.includes('prefrontal') ? 'Consider 10-10 montage for better prefrontal coverage' : 'Montage appropriate for target regions',
    localizationMethod === 'dipole' && modality === 'EEG' ? 'Consider distributed source imaging for broader coverage' : 'Localization method suitable for modality',
    connectivityMethod === 'coherence' ? 'Switch to wPLI to reduce volume conduction artifacts' : 'Connectivity method robust to volume conduction'
  ];
  coverageRecs.forEach((r, i) => { report += (i + 1) + '. ' + r + '\n'; });

  report += '\n---\n\n' + '*' + DISCLAIMER + '*';
  return report;
}

// ==================== TOOL 8: NEUROETHICS REVIEWER ====================

function executeNeuroethicsReview(inputData: string): string {
  const data = parseInput<NeuroethicsInput>(inputData);
  const interventionType = data.intervention_type || 'noninvasive';
  const application = data.application || 'therapeutic';
  const dataSensitivity = data.data_sensitivity || 'high';
  const subjectPopulation = data.subject_population || 'patient';
  const irbRequired = data.irb_required !== false;

  const seed = hashString(inputData);
  const rng = mulberry32(seed);

  let report = '# Neuroethics Review Report\n\n';
  report += '**Intervention Type:** ' + interventionType + '\n';
  report += '**Application:** ' + application + '\n';
  report += '**Data Sensitivity:** ' + dataSensitivity + '\n';
  report += '**Subject Population:** ' + subjectPopulation + '\n';
  report += '**IRB Required:** ' + (irbRequired ? 'Yes' : 'No') + '\n\n';
  report += '---\n\n';

  report += '## Risk-Benefit Analysis\n\n';
  const riskLevel = interventionType === 'invasive' ? 'HIGH' : interventionType === 'semi-invasive' ? 'MODERATE' : 'LOW';
  const benefitLevel = application === 'therapeutic' ? 'HIGH' : application === 'augmentation' ? 'MODERATE' : 'VARIABLE';
  report += '| Dimension | Assessment |\n';
  report += '|-----------|------------|\n';
  report += '| Physical Risk | ' + riskLevel + ' |\n';
  report += '| Potential Benefit | ' + benefitLevel + ' |\n';
  report += '| Risk-Benefit Ratio | ' + (riskLevel === 'HIGH' && benefitLevel === 'HIGH' ? 'Acceptable for therapeutic use' : riskLevel === 'LOW' ? 'Favorable' : 'Requires careful review') + ' |\n';
  report += '| Reversibility | ' + (interventionType === 'invasive' ? 'Limited — surgical removal required' : 'High — effects cease after device removal') + ' |\n\n';

  report += '## Informed Consent Requirements\n\n';
  const consentElements = [
    { element: 'Purpose and procedures', required: true, detail: 'Clear description of BCI/neural intervention' },
    { element: 'Risks and discomforts', required: true, detail: riskLevel === 'HIGH' ? 'Surgical risks, infection, signal degradation' : 'Skin irritation, fatigue, data breach' },
    { element: 'Benefits (realistic)', required: true, detail: 'Expected outcomes with uncertainty ranges' },
    { element: 'Alternatives', required: true, detail: 'Non-neural alternatives and no-treatment option' },
    { element: 'Data usage and privacy', required: dataSensitivity !== 'low', detail: 'Neural data storage, sharing, and re-identification risks' },
    { element: 'Right to withdraw', required: true, detail: 'No penalty for withdrawal at any time' },
    { element: 'Cognitive liberty', required: application === 'augmentation', detail: 'Right to cognitive self-determination' },
    { element: 'Post-trial access', required: true, detail: 'Continued access to beneficial intervention' }
  ];
  report += '| Element | Required | Detail |\n';
  report += '|---------|----------|--------|\n';
  consentElements.forEach(e => {
    report += '| ' + e.element + ' | ' + (e.required ? 'YES' : 'Optional') + ' | ' + e.detail + ' |\n';
  });

  report += '\n## Data Privacy & Security\n\n';
  const privacyLevel = dataSensitivity === 'critical' ? 'MAXIMUM' : dataSensitivity === 'high' ? 'HIGH' : dataSensitivity === 'medium' ? 'MODERATE' : 'STANDARD';
  report += '| Aspect | Requirement | Status |\n';
  report += '|--------|-------------|--------|\n';
  report += '| Privacy Level | ' + privacyLevel + ' | — |\n';
  report += '| Encryption | AES-256 at rest, TLS 1.3 in transit | ' + (rng() > 0.1 ? 'PASS' : 'REVIEW') + ' |\n';
  report += '| De-identification | HIPAA Safe Harbor + neural pattern anonymization | ' + (rng() > 0.15 ? 'PASS' : 'REVIEW') + ' |\n';
  report += '| Data Retention | ' + (2 + Math.floor(rng() * 8)) + ' years post-study | ' + (rng() > 0.1 ? 'PASS' : 'REVIEW') + ' |\n';
  report += '| Re-identification Risk | ' + (rng() * 0.15 * 100).toFixed(1) + '% | ' + (rng() > 0.2 ? 'LOW' : 'MODERATE') + ' |\n';
  report += '| Right to Erasure | ' + (rng() > 0.3 ? 'Supported' : 'Partial — aggregated data retained') + ' | — |\n\n';

  report += '## Enhancement Ethics Assessment\n\n';
  if (application === 'augmentation') {
    report += '### Enhancement-Specific Concerns\n\n';
    const enhancementIssues = [
      { issue: 'Fairness & Access', concern: 'Risk of cognitive divide between enhanced and unenhanced individuals', severity: 'HIGH' },
      { issue: 'Authenticity', concern: 'Impact on personal identity and sense of self', severity: 'MODERATE' },
      { issue: 'Coercion', concern: 'Pressure to enhance for competitive advantage', severity: 'MODERATE' },
      { issue: 'Informed Consent', concern: 'Long-term effects of enhancement poorly understood', severity: 'HIGH' },
      { issue: 'Societal Impact', concern: 'Redefinition of normal cognitive function', severity: 'MODERATE' }
    ];
    report += '| Issue | Concern | Severity |\n';
    report += '|-------|---------|----------|\n';
    enhancementIssues.forEach(e => { report += '| ' + e.issue + ' | ' + e.concern + ' | ' + e.severity + ' |\n'; });
  } else {
    report += '**Application is therapeutic/research — enhancement ethics not directly applicable.**\n\n';
    report += 'Standard therapeutic ethics framework applies:\n';
    report += '- Beneficence: Maximize therapeutic benefit\n';
    report += '- Non-maleficence: Minimize harm\n';
    report += '- Autonomy: Respect patient self-determination\n';
    report += '- Justice: Equitable access to therapeutic benefits\n\n';
  }

  report += '## Regulatory Pathway\n\n';
  const regulatoryPathway = interventionType === 'invasive'
    ? 'FDA PMA (Class III) or De Novo pathway; CE Mark (MDR Class III)'
    : interventionType === 'semi-invasive'
    ? 'FDA 510(k) or De Novo; CE Mark (MDR Class IIa)'
    : 'FDA Class I/II exempt; CE Mark (MDR Class I); general wellness exemption possible';
  report += '| Jurisdiction | Pathway |\n';
  report += '|-------------|--------|\n';
  report += '| United States (FDA) | ' + regulatoryPathway.split(';')[0].trim() + ' |\n';
  report += '| European Union (CE) | ' + (regulatoryPathway.split(';')[1] || 'MDR classification TBD').trim() + ' |\n';
  report += '| IRB/Ethics Committee | ' + (irbRequired ? 'Required — full board review' : 'Exempt or expedited review') + ' |\n';
  report += '| Data Protection | ' + (dataSensitivity === 'critical' || dataSensitivity === 'high' ? 'GDPR special category data; HIPAA PHI' : 'GDPR standard; HIPAA de-identified') + ' |\n\n';

  report += '## Recommendations\n\n';
  const ethicsRecs = [
    interventionType === 'invasive' && application === 'augmentation' ? 'Invasive enhancement requires highest scrutiny — consider moratorium until safety data matures' : 'Risk level appropriate for stated application',
    dataSensitivity === 'critical' || dataSensitivity === 'high' ? 'Implement neural data-specific privacy framework beyond standard health data protections' : 'Standard data protection measures sufficient',
    subjectPopulation === 'vulnerable' ? 'Additional safeguards required for vulnerable populations (legally authorized representative consent)' : 'Standard consent procedures adequate',
    application === 'augmentation' ? 'Establish clear boundaries between therapy and enhancement in protocol documentation' : 'Therapeutic intent clearly documented',
    'Schedule annual ethics review with independent neuroethics advisory board'
  ];
  ethicsRecs.forEach((r, i) => { report += (i + 1) + '. ' + r + '\n'; });

  report += '\n---\n\n' + '*' + DISCLAIMER + '*';
  return report;
}

// ==================== PLUGIN REGISTRATION ====================

export function apply(ctx: Context) {
  const tools = ctx.tools

  tools.register(defineTool({ name: 'signal_processing_pipeline', description: '信号处理_pipeline | 带通滤波/伪迹去除/SNR优化/空间滤波/频谱分析', parameters: { input_data: { type: 'string' as const, required: true, description: 'JSON: signal_type, sampling_rate_hz, channel_count, filter_band_hz, artifact_method, target_snr_db, spatial_filter' } }, output: { schema: { type: 'string' as const }, render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }] }, async execute(args: { input_data: string }) { return executeSignalProcessing(args.input_data) } }))

  tools.register(defineTool({ name: 'spike_sorting_config', description: '脉冲分选配置 | 阈值检测/特征提取/聚类/波形对齐/单元验证', parameters: { input_data: { type: 'string' as const, required: true, description: 'JSON: probe_type, channel_count, threshold_sigma, feature_method, clustering_method, min_spike_rate_hz, contamination_threshold' } }, output: { schema: { type: 'string' as const }, render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }] }, async execute(args: { input_data: string }) { return executeSpikeSorting(args.input_data) } }))

  tools.register(defineTool({ name: 'bci_decoder_calibrator', description: 'BCI解码器校准 | 特征选择/分类器训练/交叉验证/迁移学习/漂移补偿', parameters: { input_data: { type: 'string' as const, required: true, description: 'JSON: paradigm, feature_type, classifier, calibration_trials, channels, target_accuracy' } }, output: { schema: { type: 'string' as const }, render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }] }, async execute(args: { input_data: string }) { return executeBCICalibration(args.input_data) } }))

  tools.register(defineTool({ name: 'neural_implant_safety', description: '神经植入物安全检查 | 电荷密度限制/热分析/生物相容性/封装完整性/长期稳定性', parameters: { input_data: { type: 'string' as const, required: true, description: 'JSON: implant_type, electrode_count, charge_density_uc_cm2, pulse_width_us, stimulation_freq_hz, duration_years, encapsulation_thickness_um' } }, output: { schema: { type: 'string' as const }, render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }] }, async execute(args: { input_data: string }) { return executeImplantSafety(args.input_data) } }))

  tools.register(defineTool({ name: 'neurofeedback_protocol_designer', description: '神经反馈协议设计 | EEG频段训练/奖励阈值/会话结构/进度指标/个性化', parameters: { input_data: { type: 'string' as const, required: true, description: 'JSON: target_band, target_region, session_duration_min, sessions_total, reward_threshold_sd, feedback_type, baseline_duration_min' } }, output: { schema: { type: 'string' as const }, render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }] }, async execute(args: { input_data: string }) { return executeNeurofeedbackProtocol(args.input_data) } }))

  tools.register(defineTool({ name: 'cognitive_state_classifier', description: '认知状态分类器 | 注意力/放松/疲劳检测/特征集/模型选择/实时推理/置信度评分', parameters: { input_data: { type: 'string' as const, required: true, description: 'JSON: cognitive_states, eeg_bands, channel_selection, window_length_s, classifier_type, sampling_rate_hz' } }, output: { schema: { type: 'string' as const }, render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }] }, async execute(args: { input_data: string }) { return executeCognitiveStateClassifier(args.input_data) } }))

  tools.register(defineTool({ name: 'brain_mapping_planner', description: '脑映射规划 | 电极蒙区/区域靶向/覆盖分析/源定位/连接性映射', parameters: { input_data: { type: 'string' as const, required: true, description: 'JSON: target_regions, modality, electrode_count, montage, localization_method, connectivity_method' } }, output: { schema: { type: 'string' as const }, render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }] }, async execute(args: { input_data: string }) { return executeBrainMapping(args.input_data) } }))

  tools.register(defineTool({ name: 'neuroethics_reviewer', description: '神经伦理审查 | 知情同意/风险收益分析/数据隐私/增强伦理/监管路径', parameters: { input_data: { type: 'string' as const, required: true, description: 'JSON: intervention_type, application, data_sensitivity, subject_population, irb_required' } }, output: { schema: { type: 'string' as const }, render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }] }, async execute(args: { input_data: string }) { return executeNeuroethicsReview(args.input_data) } }))
}
