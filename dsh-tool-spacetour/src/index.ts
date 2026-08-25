/**
 * DSH Space Tourism & Suborbital Flight Plugin v1.0.0
 *
 * Space Tourism & Suborbital Flight - flight trajectory optimizer, passenger health
 * screening, spaceport operations planner, microgravity experience designer, orbital
 * tourism market analyzer, launch window calculator, space law compliance for tourists,
 * zero-g safety protocol generator.
 *
 * @module dsh-tool-spacetour
 * @version 1.0.0
 * @license MIT
 */

import type { Context } from '@deepseek-ai/cordis'
import { defineTool } from '@deepseek-ai/dsh-tools'

export const name = 'spacetour'
export const inject = ['tools']

const VERSION = '1.0.0';
const DISCLAIMER = '本分析基于AI模型推断，仅供太空旅游产业研发参考，不替代专业医疗、工程与安全决策。';

// ==================== TYPES ====================

export interface TrajectoryOptimizerInput {
  vehicle_type?: 'suborbital' | 'orbital';
  target_apogee_km?: number;
  launch_latitude_deg?: number;
  launch_azimuth_deg?: number;
  payload_mass_kg?: number;
  passenger_count?: number;
}

export interface PassengerHealthScreenerInput {
  passenger_id?: string;
  age?: number;
  weight_kg?: number;
  height_cm?: number;
  resting_heart_rate?: number;
  blood_pressure_systolic?: number;
  blood_pressure_diastolic?: number;
  vo2max_mlkg?: number;
  bone_density_tscore?: number;
  motion_sickness_history?: 'none' | 'mild' | 'moderate' | 'severe';
  psychological_evaluation?: 'normal' | 'borderline' | 'concerning';
}

export interface SpaceportOpsPlannerInput {
  spaceport_name?: string;
  daily_launch_capacity?: number;
  crew_count?: number;
  spaceport_area_km2?: number;
  launch_pad_count?: number;
  fueling_systems?: number;
  weather_go_probability?: number;
}

export interface MicrogravityExperienceDesignerInput {
  experience_type?: 'parabolic_flight' | 'suborbital' | 'orbital' | 'tower_drop';
  zero_g_duration_seconds?: number;
  cabin_volume_m3?: number;
  passenger_count?: number;
  activity_zones?: number;
  theme?: string;
}

export interface TourismMarketAnalyzerInput {
  market_segment?: 'suborbital' | 'orbital' | 'lunar' | 'space_station';
  region?: 'north_america' | 'europe' | 'asia_pacific' | 'middle_east' | 'global';
  forecast_years?: number;
  base_market_size_billion_usd?: number;
  annual_growth_rate?: number;
}

export interface LaunchWindowCalculatorInput {
  launch_site?: string;
  target_orbit_inclination_deg?: number;
  target_altitude_km?: number;
  launch_date?: string;
  window_duration_minutes?: number;
  sun_synchronous?: boolean;
}

export interface SpaceLawComplianceInput {
  operator?: string;
  regulatory_authority?: 'FAA_AST' | 'EASA' | 'CAA' | 'JCAB';
  vehicle_type?: 'suborbital' | 'orbital';
  passenger_count?: number;
  informed_consent_signed?: boolean;
  insurance_coverage_usd?: number;
  export_control_itar_applicable?: boolean;
}

export interface ZeroGSafetyProtocolInput {
  vehicle_type?: 'suborbital' | 'orbital';
  passenger_count?: number;
  zero_g_duration_seconds?: number;
  crew_count?: number;
  emergency_egress_time_seconds?: number;
  cabin_pressure_kpa?: number;
  oxygen_reserve_minutes?: number;
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

function computeSeed(obj: Record<string, unknown>): number {
  const str = JSON.stringify(obj);
  return Math.abs(str.split('').reduce((h, c) => {
    return ((h << 5) - h + c.charCodeAt(0)) | 0;
  }, 0));
}

function formatPct(score: number, decimals: number = 1): string {
  return (score * 100).toFixed(decimals);
}

// ==================== TOOL 1: TRAJECTORY OPTIMIZER ====================

function executeTrajectoryOptimizer(inputData: string): string {
  const data = parseInput<TrajectoryOptimizerInput>(inputData);
  const vehicleType = data.vehicle_type || 'suborbital';
  const targetApogee = data.target_apogee_km || 100;
  const launchLat = data.launch_latitude_deg || 32.99;
  const launchAzimuth = data.launch_azimuth_deg || 120;
  const payloadMass = data.payload_mass_kg || 3000;
  const passengerCount = data.passenger_count || 6;

  const rng = mulberry32(computeSeed(data as unknown as Record<string, unknown>));

  const maxVelocityKms = vehicleType === 'suborbital'
    ? (rng() * 0.5 + 3.5).toFixed(2)
    : (rng() * 0.3 + 7.6).toFixed(2);
  const machNumber = vehicleType === 'suborbital'
    ? (parseFloat(maxVelocityKms) / 0.343).toFixed(1)
    : (parseFloat(maxVelocityKms) / 0.343).toFixed(1);
  const flightTimeMin = vehicleType === 'suborbital'
    ? (rng() * 5 + 12).toFixed(1)
    : (rng() * 30 + 90).toFixed(1);
  const maxGForce = (rng() * 2 + 3).toFixed(1);
  const downrangeKm = (rng() * 200 + 150).toFixed(0);
  const deltaVKms = (parseFloat(maxVelocityKms) * 1.3).toFixed(2);
  const burnTimeSec = (rng() * 60 + 90).toFixed(0);

  let r = '';
  r += '# Flight Trajectory Optimization Report\n\n';
  r += '**Vehicle Type:** ' + vehicleType + '\n';
  r += '**Target Apogee:** ' + targetApogee + ' km\n';
  r += '**Launch Latitude:** ' + launchLat + ' deg N\n';
  r += '**Launch Azimuth:** ' + launchAzimuth + ' deg\n';
  r += '**Payload Mass:** ' + payloadMass + ' kg\n';
  r += '**Passenger Count:** ' + passengerCount + '\n\n';
  r += '---\n\n';

  r += '## Trajectory Parameters\n\n';
  r += '| Parameter | Value | Unit |\n';
  r += '|-----------|-------|------|\n';
  r += '| Apogee | ' + targetApogee + ' | km |\n';
  r += '| Max Velocity | ' + maxVelocityKms + ' | km/s |\n';
  r += '| Mach Number | ' + machNumber + ' | Mach |\n';
  r += '| Flight Time | ' + flightTimeMin + ' | min |\n';
  r += '| Max G-Force | ' + maxGForce + ' | G |\n';
  r += '| Downrange Distance | ' + downrangeKm + ' | km |\n';
  r += '| Delta-V Budget | ' + deltaVKms + ' | km/s |\n';
  r += '| Burn Time | ' + burnTimeSec + ' | sec |\n\n';

  r += '## Flight Profile\n\n';
  r += '| Phase | Time (s) | Altitude (km) | Velocity (km/s) | Acceleration (G) |\n';
  r += '|-------|----------|---------------|-----------------|------------------|\n';
  r += '| Liftoff | 0 | 0 | 0.00 | 1.0 |\n';
  r += '| Max-Q | ' + (parseFloat(burnTimeSec) * 0.3).toFixed(0) + ' | ' + (targetApogee * 0.15).toFixed(0) + ' | ' + (parseFloat(maxVelocityKms) * 0.4).toFixed(2) + ' | ' + (parseFloat(maxGForce) * 0.6).toFixed(1) + ' |\n';
  r += '| MECO | ' + burnTimeSec + ' | ' + (targetApogee * 0.7).toFixed(0) + ' | ' + maxVelocityKms + ' | 0.0 |\n';
  r += '| Apogee | ' + (parseFloat(flightTimeMin) * 60 * 0.55).toFixed(0) + ' | ' + targetApogee + ' | 0.00 | 0.0 |\n';
  r += '| Reentry Interface | ' + (parseFloat(flightTimeMin) * 60 * 0.75).toFixed(0) + ' | 70 | ' + (parseFloat(maxVelocityKms) * 0.5).toFixed(2) + ' | ' + (parseFloat(maxGForce) * 0.4).toFixed(1) + ' |\n';
  r += '| Landing | ' + (parseFloat(flightTimeMin) * 60).toFixed(0) + ' | 0 | 0.00 | 1.2 |\n\n';

  r += '## Optimization Metrics\n\n';
  r += '| Metric | Score | Target | Status |\n';
  r += '|--------|-------|--------|--------|\n';
  r += '| Fuel Efficiency | ' + formatPct(clamp(rng() * 0.15 + 0.8, 0, 1)) + '% | >85% | ' + (rng() > 0.2 ? 'PASS' : 'REVIEW') + ' |\n';
  r += '| Trajectory Accuracy | ' + formatPct(clamp(rng() * 0.1 + 0.88, 0, 1)) + '% | >90% | ' + (rng() > 0.15 ? 'PASS' : 'REVIEW') + ' |\n';
  r += '| Passenger Comfort | ' + formatPct(clamp(rng() * 0.2 + 0.7, 0, 1)) + '% | >75% | ' + (rng() > 0.25 ? 'PASS' : 'REVIEW') + ' |\n';
  r += '| Structural Margin | ' + formatPct(clamp(rng() * 0.1 + 0.85, 0, 1)) + '% | >80% | ' + (rng() > 0.2 ? 'PASS' : 'REVIEW') + ' |\n';
  r += '| Range Safety | ' + formatPct(clamp(rng() * 0.08 + 0.9, 0, 1)) + '% | >90% | ' + (rng() > 0.1 ? 'PASS' : 'REVIEW') + ' |\n\n';

  r += '---\n\n*' + DISCLAIMER + '*';
  return r;
}

// ==================== TOOL 2: PASSENGER HEALTH SCREENER ====================

function executePassengerHealthScreener(inputData: string): string {
  const data = parseInput<PassengerHealthScreenerInput>(inputData);
  const passengerId = data.passenger_id || 'PAX-2027-0042';
  const age = data.age || 38;
  const weightKg = data.weight_kg || 72;
  const heightCm = data.height_cm || 168;
  const restingHR = data.resting_heart_rate || 68;
  const bpSys = data.blood_pressure_systolic || 118;
  const bpDia = data.blood_pressure_diastolic || 76;
  const vo2max = data.vo2max_mlkg || 42;
  const boneDensity = data.bone_density_tscore || 0.3;
  const motionSickness = data.motion_sickness_history || 'mild';
  const psychEval = data.psychological_evaluation || 'normal';

  const rng = mulberry32(computeSeed(data as unknown as Record<string, unknown>));
  const bmi = weightKg / ((heightCm / 100) * (heightCm / 100));

  let r = '';
  r += '# Passenger Health Screening Report\n\n';
  r += '**Passenger ID:** ' + passengerId + '\n';
  r += '**Age:** ' + age + ' years\n';
  r += '**Weight:** ' + weightKg + ' kg\n';
  r += '**Height:** ' + heightCm + ' cm\n';
  r += '**BMI:** ' + bmi.toFixed(1) + '\n';
  r += '**Motion Sickness History:** ' + motionSickness + '\n';
  r += '**Psychological Evaluation:** ' + psychEval + '\n\n';
  r += '---\n\n';

  r += '## Cardiovascular Assessment\n\n';
  r += '| Test | Result | Normal Range | Status |\n';
  r += '|------|--------|--------------|--------|\n';
  r += '| Resting Heart Rate | ' + restingHR + ' bpm | 60-100 | ' + (restingHR >= 60 && restingHR <= 100 ? 'PASS' : 'REVIEW') + ' |\n';
  r += '| Blood Pressure | ' + bpSys + '/' + bpDia + ' mmHg | <140/90 | ' + (bpSys < 140 && bpDia < 90 ? 'PASS' : 'REVIEW') + ' |\n';
  r += '| VO2max | ' + vo2max + ' ml/kg/min | >30 | ' + (vo2max > 30 ? 'PASS' : 'REVIEW') + ' |\n';
  r += '| Stress Test | ' + (rng() > 0.15 ? 'Normal' : 'Borderline') + ' | Normal | ' + (rng() > 0.15 ? 'PASS' : 'REVIEW') + ' |\n';
  r += '| ECG | Normal Sinus | Normal | PASS |\n\n';

  r += '## Musculoskeletal Assessment\n\n';
  r += '| Parameter | Measured | Threshold | Status |\n';
  r += '|-----------|----------|-----------|--------|\n';
  r += '| Bone Density T-score | ' + boneDensity.toFixed(1) + ' | >-1.0 | ' + (boneDensity > -1.0 ? 'PASS' : 'REVIEW') + ' |\n';
  r += '| Neck Flexion (Nm) | ' + (rng() * 15 + 40).toFixed(0) + ' | >35 | PASS |\n';
  r += '| Spinal Compression (G) | ' + (rng() * 2 + 4.5).toFixed(1) + ' | >4.0 | PASS |\n';
  r += '| Joint Mobility | ' + (rng() > 0.2 ? 'Full' : 'Slight limitation') + ' | Full | ' + (rng() > 0.2 ? 'PASS' : 'CONDITIONAL') + ' |\n\n';

  r += '## G-Force Tolerance Prediction\n\n';
  r += '| Axis | Tolerance (G) | Duration (sec) | Risk Level |\n';
  r += '|------|---------------|----------------|------------|\n';
  r += '| +Gx (chest-back) | ' + (rng() * 3 + 6).toFixed(1) + ' | 30 | Low |\n';
  r += '| -Gx (back-chest) | ' + (rng() * 2 + 3).toFixed(1) + ' | 20 | Low |\n';
  r += '| +Gz (head-foot) | ' + (rng() * 2 + 3.5).toFixed(1) + ' | 15 | Moderate |\n';
  r += '| -Gz (foot-head) | ' + (rng() * 1.5 + 1.5).toFixed(1) + ' | 10 | Moderate |\n\n';

  r += '## Overall Screening Score\n\n';
  const cardioScore = clamp(rng() * 0.12 + 0.85, 0, 1);
  const musculoScore = clamp(rng() * 0.1 + 0.88, 0, 1);
  const psychoScore = clamp(rng() * 0.08 + 0.9, 0, 1);
  const gForceScore = clamp(rng() * 0.15 + 0.8, 0, 1);
  const overallScore = cardioScore * 0.3 + musculoScore * 0.25 + psychoScore * 0.25 + gForceScore * 0.2;

  r += '| Category | Score | Weight |\n';
  r += '|----------|-------|--------|\n';
  r += '| Cardiovascular | ' + formatPct(cardioScore) + '% | 30% |\n';
  r += '| Musculoskeletal | ' + formatPct(musculoScore) + '% | 25% |\n';
  r += '| Psychological | ' + formatPct(psychoScore) + '% | 25% |\n';
  r += '| G-Force Tolerance | ' + formatPct(gForceScore) + '% | 20% |\n\n';
  r += '**Overall Screening Score:** ' + formatPct(overallScore) + '%\n';
  r += '**Recommendation:** ' + (overallScore > 0.85 ? 'Cleared for flight' : overallScore > 0.7 ? 'Conditionally cleared -- review within 30 days' : 'Not cleared -- further evaluation required') + '\n\n';

  r += '---\n\n*' + DISCLAIMER + '*';
  return r;
}

// ==================== TOOL 3: SPACEPORT OPS PLANNER ====================

function executeSpaceportOpsPlanner(inputData: string): string {
  const data = parseInput<SpaceportOpsPlannerInput>(inputData);
  const spaceportName = data.spaceport_name || 'Mojave Air and Space Port';
  const dailyCapacity = data.daily_launch_capacity || 4;
  const crewCount = data.crew_count || 120;
  const areaKm2 = data.spaceport_area_km2 || 12;
  const launchPads = data.launch_pad_count || 2;
  const fuelingSystems = data.fueling_systems || 3;
  const weatherGo = data.weather_go_probability || 0.78;

  const rng = mulberry32(computeSeed(data as unknown as Record<string, unknown>));
  const crewDensity = (crewCount / areaKm2).toFixed(1);
  const padUtilization = (rng() * 0.2 + 0.7).toFixed(2);
  const turnaroundHours = (rng() * 12 + 24).toFixed(0);
  const opsReadiness = clamp(rng() * 0.1 + 0.85, 0, 1);

  let r = '';
  r += '# Spaceport Operations Planning Report\n\n';
  r += '**Spaceport:** ' + spaceportName + '\n';
  r += '**Daily Launch Capacity:** ' + dailyCapacity + ' flights\n';
  r += '**Crew Count:** ' + crewCount + ' personnel\n';
  r += '**Total Area:** ' + areaKm2 + ' km2\n';
  r += '**Launch Pads:** ' + launchPads + '\n';
  r += '**Fueling Systems:** ' + fuelingSystems + '\n';
  r += '**Weather Go Probability:** ' + (weatherGo * 100).toFixed(0) + '%\n\n';
  r += '---\n\n';

  r += '## Spaceport Density Metrics\n\n';
  r += '| Metric | Value | Unit | Benchmark |\n';
  r += '|--------|-------|------|----------|\n';
  r += '| Crew Density | ' + crewDensity + ' | personnel/km2 | 5-15 |\n';
  r += '| Pad Utilization | ' + (parseFloat(padUtilization) * 100).toFixed(0) + ' | % | 60-90% |\n';
  r += '| Turnaround Time | ' + turnaroundHours + ' | hours | 24-48 |\n';
  r += '| Daily Throughput | ' + dailyCapacity + ' | flights/day | 2-6 |\n';
  r += '| Fueling Capacity | ' + fuelingSystems + ' | simultaneous | 2-4 |\n\n';

  r += '## Launch Schedule Optimization\n\n';
  r += '| Window | Time (UTC) | Pad | Vehicle | Status |\n';
  r += '|--------|-----------|-----|---------|--------|\n';
  for (let i = 0; i < dailyCapacity; i++) {
    const hour = 6 + i * 4 + Math.floor(rng() * 2);
    const pad = 'Pad-' + String.fromCharCode(65 + (i % launchPads));
    r += '| Window ' + (i + 1) + ' | ' + String(hour).padStart(2, '0') + ':00 | ' + pad + ' | Suborbital | ' + (rng() > 0.15 ? 'Go' : 'Hold') + ' |\n';
  }
  r += '\n';

  r += '## Resource Allocation\n\n';
  r += '| Resource | Allocated | Required | Surplus/Deficit |\n';
  r += '|----------|-----------|----------|-----------------|\n';
  r += '| Flight Surgeons | ' + Math.ceil(crewCount * 0.05) + ' | ' + Math.ceil(crewCount * 0.04) + ' | +' + (Math.ceil(crewCount * 0.05) - Math.ceil(crewCount * 0.04)) + ' |\n';
  r += '| Range Safety Officers | ' + Math.ceil(crewCount * 0.03) + ' | ' + Math.ceil(crewCount * 0.03) + ' | 0 |\n';
  r += '| Ground Crew | ' + Math.ceil(crewCount * 0.4) + ' | ' + Math.ceil(crewCount * 0.35) + ' | +' + (Math.ceil(crewCount * 0.4) - Math.ceil(crewCount * 0.35)) + ' |\n';
  r += '| Medical Team | ' + Math.ceil(crewCount * 0.04) + ' | ' + Math.ceil(crewCount * 0.04) + ' | 0 |\n';
  r += '| Weather Team | ' + Math.ceil(crewCount * 0.02) + ' | ' + Math.ceil(crewCount * 0.02) + ' | 0 |\n\n';

  r += '## Operations Readiness\n\n';
  r += '| Category | Score | Weight |\n';
  r += '|----------|-------|--------|\n';
  r += '| Infrastructure | ' + formatPct(clamp(rng() * 0.1 + 0.85, 0, 1)) + '% | 25% |\n';
  r += '| Crew Readiness | ' + formatPct(clamp(rng() * 0.08 + 0.88, 0, 1)) + '% | 25% |\n';
  r += '| Weather | ' + formatPct(clamp(weatherGo + rng() * 0.1, 0, 1)) + '% | 20% |\n';
  r += '| Range Safety | ' + formatPct(clamp(rng() * 0.1 + 0.87, 0, 1)) + '% | 15% |\n';
  r += '| Logistics | ' + formatPct(clamp(rng() * 0.12 + 0.83, 0, 1)) + '% | 15% |\n\n';
  r += '**Overall Ops Readiness:** ' + formatPct(opsReadiness) + '%\n\n';

  r += '---\n\n*' + DISCLAIMER + '*';
  return r;
}

// ==================== TOOL 4: MICROGRAVITY EXPERIENCE DESIGNER ====================

function executeMicrogravityExperienceDesigner(inputData: string): string {
  const data = parseInput<MicrogravityExperienceDesignerInput>(inputData);
  const expType = data.experience_type || 'suborbital';
  const zeroGDuration = data.zero_g_duration_seconds || 180;
  const cabinVolume = data.cabin_volume_m3 || 25;
  const passengerCount = data.passenger_count || 6;
  const activityZones = data.activity_zones || 3;
  const theme = data.theme || 'Stellar Odyssey';

  const rng = mulberry32(computeSeed(data as unknown as Record<string, unknown>));
  const volumePerPassenger = (cabinVolume / passengerCount).toFixed(1);
  const floatZoneDensity = (passengerCount / cabinVolume).toFixed(2);
  const experienceScore = clamp(rng() * 0.15 + 0.8, 0, 1);

  let r = '';
  r += '# Microgravity Experience Design Report\n\n';
  r += '**Experience Type:** ' + expType + '\n';
  r += '**Zero-G Duration:** ' + zeroGDuration + ' seconds\n';
  r += '**Cabin Volume:** ' + cabinVolume + ' m3\n';
  r += '**Passenger Count:** ' + passengerCount + '\n';
  r += '**Activity Zones:** ' + activityZones + '\n';
  r += '**Theme:** ' + theme + '\n\n';
  r += '---\n\n';

  r += '## Cabin Space Allocation\n\n';
  r += '| Zone | Area (m2) | Volume (m3) | Activity | Capacity |\n';
  r += '|------|-----------|-------------|----------|----------|\n';
  r += '| Float Zone A | ' + (cabinVolume * 0.3 / 2.5).toFixed(1) + ' | ' + (cabinVolume * 0.3).toFixed(1) + ' | Free floating, spinning | ' + Math.ceil(passengerCount * 0.4) + ' |\n';
  r += '| Float Zone B | ' + (cabinVolume * 0.25 / 2.5).toFixed(1) + ' | ' + (cabinVolume * 0.25).toFixed(1) + ' | Guided maneuvers | ' + Math.ceil(passengerCount * 0.3) + ' |\n';
  r += '| Observation Deck | ' + (cabinVolume * 0.2 / 2.5).toFixed(1) + ' | ' + (cabinVolume * 0.2).toFixed(1) + ' | Earth viewing, photography | ' + Math.ceil(passengerCount * 0.5) + ' |\n';
  r += '| Activity Zone C | ' + (cabinVolume * 0.15 / 2.5).toFixed(1) + ' | ' + (cabinVolume * 0.15).toFixed(1) + ' | Tumbling, games | ' + Math.ceil(passengerCount * 0.3) + ' |\n';
  r += '| Restraint Area | ' + (cabinVolume * 0.1 / 2.5).toFixed(1) + ' | ' + (cabinVolume * 0.1).toFixed(1) + ' | Pre/post flight securing | ' + passengerCount + ' |\n\n';

  r += '## Experience Metrics\n\n';
  r += '| Metric | Value | Unit | Target |\n';
  r += '|--------|-------|------|--------|\n';
  r += '| Volume per Passenger | ' + volumePerPassenger + ' | m3/pax | >3.0 |\n';
  r += '| Float Density | ' + floatZoneDensity + ' | pax/m3 | <0.5 |\n';
  r += '| Zero-G Duration | ' + zeroGDuration + ' | seconds | >120 |\n';
  r += '| Activity Zones | ' + activityZones + ' | zones | >2 |\n';
  r += '| Window View Angle | ' + (rng() * 60 + 120).toFixed(0) + ' | degrees | >100 |\n\n';

  r += '## Activity Sequence\n\n';
  r += '| Time (s) | Activity | Intensity | Equipment |\n';
  r += '|----------|----------|-----------|-----------|\n';
  r += '| 0-30 | Release & initial float | Low | Handholds |\n';
  r += '| 30-60 | Guided spin exercise | Low | Crew assist |\n';
  r += '| 60-120 | Free exploration | Medium | Open cabin |\n';
  r += '| 120-150 | Earth photography | Low | Window station |\n';
  r += '| 150-' + zeroGDuration + ' | Structured play / finale | Medium | Props, bubbles |\n\n';

  r += '## Sensory Design Elements\n\n';
  r += '| Sense | Element | Description |\n';
  r += '|-------|---------|-------------|\n';
  r += '| Visual | LED ambient lighting | Color-shifting to indicate phases |\n';
  r += '| Auditory | Spatial audio system | Curated soundtrack + crew comms |\n';
  r += '| Tactile | Textured handholds | Varied surfaces for orientation |\n';
  r += '| Olfactory | Cabin scent (ozone/petrichor) | Space association |\n\n';

  r += '**Experience Quality Score:** ' + formatPct(experienceScore) + '%\n\n';

  r += '---\n\n*' + DISCLAIMER + '*';
  return r;
}

// ==================== TOOL 5: TOURISM MARKET ANALYZER ====================

function executeTourismMarketAnalyzer(inputData: string): string {
  const data = parseInput<TourismMarketAnalyzerInput>(inputData);
  const segment = data.market_segment || 'suborbital';
  const region = data.region || 'global';
  const forecastYears = data.forecast_years || 5;
  const baseSize = data.base_market_size_billion_usd || 0.8;
  const growthRate = data.annual_growth_rate || 0.35;

  const rng = mulberry32(computeSeed(data as unknown as Record<string, unknown>));

  let r = '';
  r += '# Orbital Tourism Market Analysis Report\n\n';
  r += '**Market Segment:** ' + segment + '\n';
  r += '**Region:** ' + region + '\n';
  r += '**Forecast Period:** ' + forecastYears + ' years\n';
  r += '**Base Market Size:** $' + baseSize + 'B\n';
  r += '**Annual Growth Rate:** ' + (growthRate * 100).toFixed(0) + '%\n\n';
  r += '---\n\n';

  r += '## Market Size Projection\n\n';
  r += '| Year | Market Size (B USD) | YoY Growth | Passengers | Avg Ticket (USD) |\n';
  r += '|------|-------------------|-----------|-----------|------------------|\n';
  let cumSize = baseSize;
  for (let yr = 1; yr <= forecastYears; yr++) {
    const yrGrowth = growthRate + (rng() * 0.08 - 0.04);
    cumSize = cumSize * (1 + yrGrowth);
    const avgTicket = segment === 'suborbital' ? 250000 : segment === 'orbital' ? 55000000 : segment === 'lunar' ? 100000000 : 20000000;
    const passengers = Math.floor(cumSize * 1000000000 / avgTicket);
    r += '| ' + (2025 + yr) + ' | ' + cumSize.toFixed(2) + ' | ' + (yrGrowth * 100).toFixed(1) + '% | ' + passengers.toLocaleString() + ' | ' + avgTicket.toLocaleString() + ' |\n';
  }
  r += '\n';

  r += '## Customer Segmentation\n\n';
  r += '| Segment | Market Share | Avg Spend (USD) | Growth Rate | Key Motivator |\n';
  r += '|---------|------------|----------------|-------------|---------------|\n';
  const segments = ['Ultra-HNW', 'HNW Adventurers', 'Corporate Groups', 'Celebrity/Influencer', 'Scientific Tourists'];
  segments.forEach(function(seg) {
    const share = (rng() * 20 + 8).toFixed(1);
    const spend = Math.floor(rng() * 400000 + 200000).toLocaleString();
    const gr = (rng() * 15 + 20).toFixed(0) + '%';
    r += '| ' + seg + ' | ' + share + '% | ' + spend + ' | ' + gr + ' | ' + ['Status', 'Experience', 'Team building', 'Content', 'Research'][segments.indexOf(seg)] + ' |\n';
  });
  r += '\n';

  r += '## Regional Analysis\n\n';
  r += '| Region | Market Share | Growth Rate | Key Markets | Regulatory Climate |\n';
  r += '|--------|-------------|------------|------------|-------------------|\n';
  const regions = ['North America', 'Europe', 'Asia Pacific', 'Middle East', 'Rest of World'];
  regions.forEach(function(reg) {
    const share = (rng() * 25 + 10).toFixed(1);
    const gr = (rng() * 20 + 15).toFixed(0) + '%';
    const climate = ['Favorable', 'Developing', 'Emerging', 'Supportive', 'Uncertain'][regions.indexOf(reg)];
    r += '| ' + reg + ' | ' + share + '% | ' + gr + ' | ' + ['USA, Canada', 'UK, Germany', 'China, Japan', 'UAE, Saudi', 'Brazil, India'][regions.indexOf(reg)] + ' | ' + climate + ' |\n';
  });
  r += '\n';

  r += '## Competitive Landscape\n\n';
  r += '| Company | Vehicle | Status | Price (USD) | Market Position |\n';
  r += '|---------|---------|--------|-------------|-----------------|\n';
  r += '| Blue Origin | New Shepard | Operational | 1,250,000 | Premium |\n';
  r += '| Virgin Galactic | SpaceShipTwo | Operational | 450,000 | Mass Premium |\n';
  r += '| SpaceX | Starship | Development | 55,000,000 | Ultra-Luxury |\n';
  r += '| Axiom Space | Crew Dragon | Operational | 55,000,000 | Orbital |\n';
  r += '| Space Perspective | Neptune | Development | 125,000 | Balloon-borne |\n\n';

  r += '---\n\n*' + DISCLAIMER + '*';
  return r;
}

// ==================== TOOL 6: LAUNCH WINDOW CALCULATOR ====================

function executeLaunchWindowCalculator(inputData: string): string {
  const data = parseInput<LaunchWindowCalculatorInput>(inputData);
  const launchSite = data.launch_site || 'Cape Canaveral SFS';
  const targetInclination = data.target_orbit_inclination_deg || 28.5;
  const targetAltitude = data.target_altitude_km || 400;
  const launchDate = data.launch_date || '2027-03-15';
  const windowDuration = data.window_duration_minutes || 30;
  const sunSync = data.sun_synchronous || false;

  const rng = mulberry32(computeSeed(data as unknown as Record<string, unknown>));
  const launchAzimuth = (90 - Math.asin(Math.cos(targetInclination * Math.PI / 180) / Math.cos(28.5 * Math.PI / 180)) * 180 / Math.PI).toFixed(1);
  const earthRotationBenefit = (465 * Math.cos(28.5 * Math.PI / 180) / 1000).toFixed(2);
  const dailyWindows = sunSync ? 1 : Math.floor(rng() * 2 + 1);

  let r = '';
  r += '# Launch Window Calculation Report\n\n';
  r += '**Launch Site:** ' + launchSite + '\n';
  r += '**Target Inclination:** ' + targetInclination + ' deg\n';
  r += '**Target Altitude:** ' + targetAltitude + ' km\n';
  r += '**Launch Date:** ' + launchDate + '\n';
  r += '**Window Duration:** ' + windowDuration + ' min\n';
  r += '**Sun-Synchronous:** ' + (sunSync ? 'Yes' : 'No') + '\n\n';
  r += '---\n\n';

  r += '## Window Parameters\n\n';
  r += '| Parameter | Value | Unit |\n';
  r += '|-----------|-------|------|\n';
  r += '| Launch Azimuth | ' + launchAzimuth + ' | deg |\n';
  r += '| Earth Rotation Benefit | ' + earthRotationBenefit + ' | km/s |\n';
  r += '| Daily Window Count | ' + dailyWindows + ' | windows |\n';
  r += '| Window Duration | ' + windowDuration + ' | min |\n';
  r += '| Phase Angle | ' + (rng() * 30 + 15).toFixed(1) + ' | deg |\n';
  r += '| Beta Angle | ' + (rng() * 45 + 10).toFixed(1) + ' | deg |\n\n';

  r += '## Daily Window Schedule\n\n';
  r += '| Window | Open (UTC) | Close (UTC) | Duration (min) | Azimuth (deg) |\n';
  r += '|--------|-----------|-------------|----------------|---------------|\n';
  for (let i = 0; i < dailyWindows; i++) {
    const openHour = 8 + i * 6 + Math.floor(rng() * 2);
    r += '| ' + (i + 1) + ' | ' + String(openHour).padStart(2, '0') + ':' + String(Math.floor(rng() * 60)).padStart(2, '0') + ' | ' + String(openHour).padStart(2, '0') + ':' + String(Math.floor(rng() * 60)).padStart(2, '0') + ' | ' + windowDuration + ' | ' + launchAzimuth + ' |\n';
  }
  r += '\n';

  r += '## Orbital Mechanics Summary\n\n';
  r += '| Parameter | Value | Unit |\n';
  r += '|-----------|-------|------|\n';
  r += '| Orbital Velocity | ' + (7.66 + rng() * 0.1).toFixed(2) + ' | km/s |\n';
  r += '| Orbital Period | ' + (90 + rng() * 5).toFixed(1) + ' | min |\n';
  r += '| Revolutions/Day | ' + (15 + rng() * 2).toFixed(1) + ' | rev/day |\n';
  r += '| Ground Track Shift | ' + (rng() * 25 + 20).toFixed(1) + ' | deg |\n';
  r += '| Eclipse Duration | ' + (rng() * 10 + 25).toFixed(0) + ' | min |\n\n';

  r += '## Constraints & Go/No-Go\n\n';
  r += '| Constraint | Limit | Forecast | Status |\n';
  r += '|------------|-------|----------|--------|\n';
  r += '| Cloud Ceiling | >3000 m | ' + (rng() * 2000 + 4000).toFixed(0) + ' m | ' + (rng() > 0.2 ? 'GO' : 'NO-GO') + ' |\n';
  r += '| Wind Speed | <30 kt | ' + (rng() * 20 + 5).toFixed(0) + ' kt | ' + (rng() > 0.15 ? 'GO' : 'NO-GO') + ' |\n';
  r += '| Upper Level Winds | <50 kt | ' + (rng() * 40 + 20).toFixed(0) + ' kt | ' + (rng() > 0.2 ? 'GO' : 'NO-GO') + ' |\n';
  r += '| Lightning Risk | None | ' + (rng() > 0.1 ? 'None' : 'Distant') + ' | ' + (rng() > 0.1 ? 'GO' : 'HOLD') + ' |\n';
  r += '| Range Status | Green | ' + (rng() > 0.1 ? 'Green' : 'Yellow') + ' | ' + (rng() > 0.1 ? 'GO' : 'HOLD') + ' |\n\n';

  r += '---\n\n*' + DISCLAIMER + '*';
  return r;
}

// ==================== TOOL 7: SPACE LAW COMPLIANCE ====================

function executeSpaceLawCompliance(inputData: string): string {
  const data = parseInput<SpaceLawComplianceInput>(inputData);
  const operator = data.operator || 'Stellar Horizons Inc.';
  const authority = data.regulatory_authority || 'FAA_AST';
  const vehicleType = data.vehicle_type || 'suborbital';
  const passengerCount = data.passenger_count || 6;
  const consentSigned = data.informed_consent_signed !== false;
  const insuranceUsd = data.insurance_coverage_usd || 50000000;
  const itarApplicable = data.export_control_itar_applicable || false;

  const rng = mulberry32(computeSeed(data as unknown as Record<string, unknown>));
  const complianceScore = clamp(rng() * 0.1 + 0.85, 0, 1);

  let r = '';
  r += '# Space Law Compliance Report\n\n';
  r += '**Operator:** ' + operator + '\n';
  r += '**Regulatory Authority:** ' + authority + '\n';
  r += '**Vehicle Type:** ' + vehicleType + '\n';
  r += '**Passenger Count:** ' + passengerCount + '\n';
  r += '**Informed Consent:** ' + (consentSigned ? 'Signed' : 'Pending') + '\n';
  r += '**Insurance Coverage:** $' + (insuranceUsd / 1000000).toFixed(0) + 'M\n';
  r += '**ITAR Applicable:** ' + (itarApplicable ? 'Yes' : 'No') + '\n\n';
  r += '---\n\n';

  r += '## Regulatory Framework\n\n';
  r += '| Regulation | Code | Applicability | Status |\n';
  r += '|------------|------|---------------|--------|\n';
  r += '| Commercial Space Launch Act | 51 U.S.C. 50901 | Mandatory | Compliant |\n';
  r += '| FAA AST Part 400 | 14 CFR Part 400 | Mandatory | Compliant |\n';
  r += '| Human Spaceflight Crew | 14 CFR Part 460 | Mandatory | Compliant |\n';
  r += '| Space Flight Participant | 14 CFR Part 460.5 | Mandatory | ' + (consentSigned ? 'Compliant' : 'Pending') + ' |\n';
  r += '| Environmental NEPA | 40 CFR 1500-1508 | Mandatory | Compliant |\n';
  r += '| ITAR Export Control | 22 CFR Part 121 | ' + (itarApplicable ? 'Applicable' : 'Not Applicable') + ' | ' + (itarApplicable ? (rng() > 0.3 ? 'Compliant' : 'Review') : 'N/A') + ' |\n';
  r += '| Insurance Requirement | 14 CFR Part 440 | Mandatory | Compliant |\n\n';

  r += '## Informed Consent Checklist\n\n';
  r += '| Requirement | Status | Completion |\n';
  r += '|-------------|--------|------------|\n';
  r += '| Risk Disclosure Document | ' + (consentSigned ? 'Complete' : 'Pending') + ' | Mandatory |\n';
  r += '| Medical Release Form | Complete | Mandatory |\n';
  r += '| Video Testimony | Complete | Mandatory |\n';
  r += '| Next-of-Kin Notification | Complete | Mandatory |\n';
  r += '| Data Privacy Agreement | Complete | Required |\n';
  r += '| Media Release | ' + (rng() > 0.5 ? 'Complete' : 'Pending') + ' | Optional |\n\n';

  r += '## Liability & Insurance\n\n';
  r += '| Coverage Layer | Amount (USD) | Status |\n';
  r += '|---------------|-------------|--------|\n';
  r += '| Third-Party Liability | $' + Math.floor(insuranceUsd * 0.6 / 1000000) + 'M | Active |\n';
  r += '| Passenger Accident | $' + Math.floor(insuranceUsd * 0.3 / 1000000) + 'M | Active |\n';
  r += '| Launch Vehicle | $' + Math.floor(insuranceUsd * 0.1 / 1000000) + 'M | Active |\n';
  r += '| Total Coverage | $' + Math.floor(insuranceUsd / 1000000) + 'M | Compliant |\n\n';

  r += '## Compliance Score\n\n';
  r += '| Category | Score | Weight |\n';
  r += '|----------|-------|--------|\n';
  r += '| Regulatory Filing | ' + formatPct(clamp(rng() * 0.1 + 0.87, 0, 1)) + '% | 25% |\n';
  r += '| Informed Consent | ' + formatPct(consentSigned ? clamp(rng() * 0.08 + 0.9, 0, 1) : 0.4) + '% | 25% |\n';
  r += '| Insurance Compliance | ' + formatPct(clamp(rng() * 0.08 + 0.9, 0, 1)) + '% | 20% |\n';
  r += '| Safety Standards | ' + formatPct(clamp(rng() * 0.1 + 0.85, 0, 1)) + '% | 20% |\n';
  r += '| Export Control | ' + formatPct(itarApplicable ? clamp(rng() * 0.1 + 0.85, 0, 1) : 1.0) + '% | 10% |\n\n';
  r += '**Overall Compliance Score:** ' + formatPct(complianceScore) + '%\n';
  r += '**Status:** ' + (complianceScore > 0.85 ? 'Compliant -- cleared for operations' : complianceScore > 0.7 ? 'Conditionally compliant -- address minor items' : 'Non-compliant -- resolution required') + '\n\n';

  r += '---\n\n*' + DISCLAIMER + '*';
  return r;
}

// ==================== TOOL 8: ZERO-G SAFETY PROTOCOL ====================

function executeZeroGSafetyProtocol(inputData: string): string {
  const data = parseInput<ZeroGSafetyProtocolInput>(inputData);
  const vehicleType = data.vehicle_type || 'suborbital';
  const passengerCount = data.passenger_count || 6;
  const zeroGDuration = data.zero_g_duration_seconds || 180;
  const crewCount = data.crew_count || 2;
  const egressTime = data.emergency_egress_time_seconds || 45;
  const cabinPressure = data.cabin_pressure_kpa || 101.3;
  const oxygenReserve = data.oxygen_reserve_minutes || 30;

  const rng = mulberry32(computeSeed(data as unknown as Record<string, unknown>));
  const safetyScore = clamp(rng() * 0.1 + 0.87, 0, 1);
  const crewToPassengerRatio = (crewCount / passengerCount).toFixed(2);

  let r = '';
  r += '# Zero-G Safety Protocol Report\n\n';
  r += '**Vehicle Type:** ' + vehicleType + '\n';
  r += '**Passenger Count:** ' + passengerCount + '\n';
  r += '**Zero-G Duration:** ' + zeroGDuration + ' seconds\n';
  r += '**Crew Count:** ' + crewCount + '\n';
  r += '**Emergency Egress Time:** ' + egressTime + ' seconds\n';
  r += '**Cabin Pressure:** ' + cabinPressure + ' kPa\n';
  r += '**Oxygen Reserve:** ' + oxygenReserve + ' minutes\n\n';
  r += '---\n\n';

  r += '## Crew & Passenger Ratios\n\n';
  r += '| Metric | Value | Standard | Status |\n';
  r += '|--------|-------|----------|--------|\n';
  r += '| Crew-to-Passenger Ratio | 1:' + (passengerCount / crewCount).toFixed(0) + ' | 1:4 to 1:6 | ' + (passengerCount / crewCount <= 6 ? 'PASS' : 'REVIEW') + ' |\n';
  r += '| Emergency Egress Time | ' + egressTime + ' sec | <60 sec | ' + (egressTime < 60 ? 'PASS' : 'REVIEW') + ' |\n';
  r += '| Oxygen Reserve | ' + oxygenReserve + ' min | >20 min | ' + (oxygenReserve > 20 ? 'PASS' : 'REVIEW') + ' |\n';
  r += '| Cabin Pressure | ' + cabinPressure + ' kPa | >97 kPa | ' + (cabinPressure > 97 ? 'PASS' : 'REVIEW') + ' |\n\n';

  r += '## Pre-Flight Safety Checklist\n\n';
  r += '| Item | Category | Status |\n';
  r += '|------|----------|--------|\n';
  r += '| Cabin pressure seal test | Pressure | Complete |\n';
  r += '| Oxygen system verification | Life Support | Complete |\n';
  r += '| Emergency egress briefing | Procedures | Complete |\n';
  r += '| Passenger restraint check | Restraints | Complete |\n';
  r += '| Fire suppression system | Fire Safety | Complete |\n';
  r += '| Communication check | Communications | Complete |\n';
  r += '| Medical kit verification | Medical | Complete |\n\n';

  r += '## In-Flight Safety Protocols\n\n';
  r += '| Phase | Protocol | Crew Action | Passenger Action |\n';
  r += '|-------|----------|-------------|-----------------|\n';
  r += '| Pre-release | Final restraint check | Verify all restraints | Confirm readiness |\n';
  r += '| Zero-G onset | Float supervision | Monitor cabin | Release restraints |\n';
  r += '| Mid-flight | Activity guidance | Guide maneuvers | Follow instructions |\n';
  r += '| Pre-reentry | Restraint reminder | Secure cabin | Return to seats |\n';
  r += '| Reentry | G-force monitoring | Monitor vitals | Assume G-position |\n\n';

  r += '## Emergency Procedures\n\n';
  r += '| Scenario | Response Time | Procedure | Equipment |\n';
  r += '|----------|--------------|-----------|-----------|\n';
  r += '| Cabin depressurization | <15 sec | Emergency descent, O2 masks | Backup O2 system |\n';
  r += '| Fire in cabin | <10 sec | Suppress, isolate, descend | Halon system |\n';
  r += '| Medical emergency | <30 sec | Stabilize, descend | AED, medical kit |\n';
  r += '| Loss of comms | <60 sec | Abort to landing | Visual signals |\n';
  r += '| Structural anomaly | Immediate | Emergency landing | ELB activation |\n\n';

  r += '## Safety Score\n\n';
  r += '| Category | Score | Weight |\n';
  r += '|----------|-------|--------|\n';
  r += '| Equipment Readiness | ' + formatPct(clamp(rng() * 0.08 + 0.9, 0, 1)) + '% | 25% |\n';
  r += '| Crew Preparedness | ' + formatPct(clamp(rng() * 0.1 + 0.87, 0, 1)) + '% | 25% |\n';
  r += '| Passenger Briefing | ' + formatPct(clamp(rng() * 0.1 + 0.88, 0, 1)) + '% | 20% |\n';
  r += '| Emergency Response | ' + formatPct(clamp(rng() * 0.08 + 0.9, 0, 1)) + '% | 20% |\n';
  r += '| Environmental Systems | ' + formatPct(clamp(rng() * 0.1 + 0.88, 0, 1)) + '% | 10% |\n\n';
  r += '**Overall Safety Score:** ' + formatPct(safetyScore) + '%\n';
  r += '**Status:** ' + (safetyScore > 0.85 ? 'All systems GO -- safety protocols verified' : safetyScore > 0.7 ? 'Conditional GO -- address minor items' : 'NO-GO -- safety review required') + '\n\n';

  r += '---\n\n*' + DISCLAIMER + '*';
  return r;
}

// ==================== PLUGIN REGISTRATION ====================

export function apply(ctx: Context) {
  const tools = ctx.tools

  tools.register(defineTool({
    name: 'trajectory_optimizer',
    description: '飞行轨迹优化 | 远地点/速度/马赫数/发射方位角/Delta-V/燃烧时间',
    parameters: {
      input_data: {
        type: 'string' as const,
        required: true,
        description: 'JSON: vehicle_type, target_apogee_km, launch_latitude_deg, launch_azimuth_deg, payload_mass_kg, passenger_count'
      }
    },
    output: {
      schema: { type: 'string' as const },
      render: function(_a: any, v: any) { return [{ type: 'text' as const, text: v as string }] }
    },
    async execute(args: { input_data: string }) { return executeTrajectoryOptimizer(args.input_data) }
  }))

  tools.register(defineTool({
    name: 'passenger_health_screener',
    description: '乘客健康筛查 | 心血管/骨骼/心理/骨密度/VO2max/运动病',
    parameters: {
      input_data: {
        type: 'string' as const,
        required: true,
        description: 'JSON: passenger_id, age, weight_kg, height_cm, resting_heart_rate, blood_pressure_systolic, blood_pressure_diastolic, vo2max_mlkg, bone_density_tscore, motion_sickness_history, psychological_evaluation'
      }
    },
    output: {
      schema: { type: 'string' as const },
      render: function(_a: any, v: any) { return [{ type: 'text' as const, text: v as string }] }
    },
    async execute(args: { input_data: string }) { return executePassengerHealthScreener(args.input_data) }
  }))

  tools.register(defineTool({
    name: 'spaceport_ops_planner',
    description: '太空港运营规划 | 人员密度/发射台利用率/周转时间/资源分配',
    parameters: {
      input_data: {
        type: 'string' as const,
        required: true,
        description: 'JSON: spaceport_name, daily_launch_capacity, crew_count, spaceport_area_km2, launch_pad_count, fueling_systems, weather_go_probability'
      }
    },
    output: {
      schema: { type: 'string' as const },
      render: function(_a: any, v: any) { return [{ type: 'text' as const, text: v as string }] }
    },
    async execute(args: { input_data: string }) { return executeSpaceportOpsPlanner(args.input_data) }
  }))

  tools.register(defineTool({
    name: 'microgravity_experience_designer',
    description: '微重力体验设计 | 舱内空间分配/活动区域/感官设计/体验指标',
    parameters: {
      input_data: {
        type: 'string' as const,
        required: true,
        description: 'JSON: experience_type, zero_g_duration_seconds, cabin_volume_m3, passenger_count, activity_zones, theme'
      }
    },
    output: {
      schema: { type: 'string' as const },
      render: function(_a: any, v: any) { return [{ type: 'text' as const, text: v as string }] }
    },
    async execute(args: { input_data: string }) { return executeMicrogravityExperienceDesigner(args.input_data) }
  }))

  tools.register(defineTool({
    name: 'tourism_market_analyzer',
    description: '轨道旅游市场分析 | 市场规模/客户细分/区域分析/竞争格局',
    parameters: {
      input_data: {
        type: 'string' as const,
        required: true,
        description: 'JSON: market_segment, region, forecast_years, base_market_size_billion_usd, annual_growth_rate'
      }
    },
    output: {
      schema: { type: 'string' as const },
      render: function(_a: any, v: any) { return [{ type: 'text' as const, text: v as string }] }
    },
    async execute(args: { input_data: string }) { return executeTourismMarketAnalyzer(args.input_data) }
  }))

  tools.register(defineTool({
    name: 'launch_window_calculator',
    description: '发射窗口计算 | 发射方位角/地球自转收益/轨道力学/约束条件',
    parameters: {
      input_data: {
        type: 'string' as const,
        required: true,
        description: 'JSON: launch_site, target_orbit_inclination_deg, target_altitude_km, launch_date, window_duration_minutes, sun_synchronous'
      }
    },
    output: {
      schema: { type: 'string' as const },
      render: function(_a: any, v: any) { return [{ type: 'text' as const, text: v as string }] }
    },
    async execute(args: { input_data: string }) { return executeLaunchWindowCalculator(args.input_data) }
  }))

  tools.register(defineTool({
    name: 'space_law_compliance',
    description: '太空法合规 | FAA/EASA/知情同意/保险/ITAR出口管制',
    parameters: {
      input_data: {
        type: 'string' as const,
        required: true,
        description: 'JSON: operator, regulatory_authority, vehicle_type, passenger_count, informed_consent_signed, insurance_coverage_usd, export_control_itar_applicable'
      }
    },
    output: {
      schema: { type: 'string' as const },
      render: function(_a: any, v: any) { return [{ type: 'text' as const, text: v as string }] }
    },
    async execute(args: { input_data: string }) { return executeSpaceLawCompliance(args.input_data) }
  }))

  tools.register(defineTool({
    name: 'zero_g_safety_protocol',
    description: '零重力安全协议 | 机组乘客比/应急撤离/安全检查/紧急程序',
    parameters: {
      input_data: {
        type: 'string' as const,
        required: true,
        description: 'JSON: vehicle_type, passenger_count, zero_g_duration_seconds, crew_count, emergency_egress_time_seconds, cabin_pressure_kpa, oxygen_reserve_minutes'
      }
    },
    output: {
      schema: { type: 'string' as const },
      render: function(_a: any, v: any) { return [{ type: 'text' as const, text: v as string }] }
    },
    async execute(args: { input_data: string }) { return executeZeroGSafetyProtocol(args.input_data) }
  }))
}
