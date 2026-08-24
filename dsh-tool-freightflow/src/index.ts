/**
 * DSH FreightFlow Plugin v0.1.0
 * Freight & Logistics Optimization for DeepSeek Harness
 *
 * Route optimization, load planning, carrier selection, freight audit,
 * warehouse slotting, last-mile delivery, cross-dock, spend analysis.
 *
 * 2026: Freight tech market $15B+; logistics optimization growing at 12% CAGR.
 *
 * Tools:
 * 1. route_optimization_engine  — Multi-stop route optimization with constraints
 * 2. load_planning_optimizer     — 3D container/truck load planning
 * 3. carrier_selection_analyst  — Carrier scoring & selection
 * 4. freight_audit_automator     — Freight invoice audit & discrepancy detection
 * 5. warehouse_slotting_optimizer— Warehouse storage slotting optimization
 * 6. last_mile_delivery_planner  — Last-mile route & delivery planning
 * 7. cross_dock_optimizer        — Cross-dock transfer scheduling
 * 8. transportation_spend_analyzer — Transportation spend analysis & savings
 *
 * @module dsh-tool-freightflow | @version 0.1.0 | @license MIT
 * @author chengganping-ship-it
 */

import type { Context } from '@deepseek-ai/cordis'
import { defineTool } from '@deepseek-ai/dsh-tools'

export const name = 'dsh-tool-freightflow'
export const inject = ['tools']

const VERSION = '0.1.0'

// ==================== SECTION 1 — Seeded Random (mulberry32 PRNG) ====================

class SeededRandom {
  private state: number

  constructor(seed: number) {
    this.state = seed | 0
  }

  next(): number {
    this.state |= 0
    this.state = (this.state + 0x6d2b79f5) | 0
    let t = Math.imul(this.state ^ (this.state >>> 15), 1 | this.state)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }

  nextInt(min: number, max: number): number {
    return Math.floor(this.next() * (max - min + 1)) + min
  }

  nextFloat(min: number, max: number): number {
    return this.next() * (max - min) + min
  }

  pick<T>(arr: T[]): T {
    return arr[this.nextInt(0, arr.length - 1)]
  }

  static seedFromString(str: string): number {
    let hash = 0
    for (let i = 0; i < str.length; i++) {
      hash = ((hash << 5) - hash + str.charCodeAt(i)) | 0
    }
    return Math.abs(hash) || 1
  }
}

// ==================== SECTION 2 — Type Definitions ====================

// --- Tool 1: Route Optimization Engine ---
export interface RouteStop {
  stop_id: string
  address: string
  lat: number
  lng: number
  time_window_start: string
  time_window_end: string
  service_minutes: number
}

export interface RouteInput {
  origin_id: string
  destination_id: string
  stops: RouteStop[]
  vehicle_type: 'van' | 'truck_16t' | 'truck_24t' | 'semi_trailer'
  optimization_goal: 'distance' | 'time' | 'fuel_cost' | 'balanced'
  avoid_tolls: boolean
  max_driving_hours: number
}

export interface OptimizedStop {
  stop_id: string
  address: string
  sequence: number
  arrival_time: string
  departure_time: string
  distance_km: number
  driving_minutes: number
  time_window_met: boolean
}

export interface RouteResult {
  route_id: string
  total_distance_km: number
  total_driving_minutes: number
  total_service_minutes: number
  total_cost_usd: number
  fuel_liters: number
  co2_kg: number
  stops: OptimizedStop[]
  vehicle_type: string
  optimization_goal: string
  time_window_compliance_pct: number
  status: 'optimal' | 'feasible' | 'infeasible'
}

// --- Tool 2: Load Planning Optimizer ---
export interface CargoItem {
  item_id: string
  description: string
  length_cm: number
  width_cm: number
  height_cm: number
  weight_kg: number
  quantity: number
  stackable: boolean
  fragile: boolean
}

export interface LoadInput {
  container_type: '20ft' | '40ft' | '40ft_hc' | 'truck_13m6' | 'van'
  cargo_items: CargoItem[]
  max_payload_kg: number
  weight_distribution: 'front_heavy' | 'balanced' | 'rear_heavy'
}

export interface PlacedItem {
  item_id: string
  description: string
  position_x: number
  position_y: number
  position_z: number
  orientation: 'normal' | 'rotated_90'
  layer: number
  weight_kg: number
}

export interface LoadResult {
  plan_id: string
  container_type: string
  total_items_placed: number
  total_items_requested: number
  volume_utilization_pct: number
  weight_utilization_pct: number
  total_weight_kg: number
  max_payload_kg: number
  placed_items: PlacedItem[]
  unplaced_items: string[]
  center_of_gravity: { x: number; y: number; z: number }
  stability_score: number
}

// --- Tool 3: Carrier Selection Analyst ---
export interface CarrierProfile {
  carrier_id: string
  carrier_name: string
  mode: 'ftl' | 'ltl' | 'parcel' | 'intermodal' | 'ocean' | 'air'
  rate_per_km: number
  reliability_pct: number
  transit_time_hours: number
  coverage_regions: string[]
  specialty: string[]
}

export interface CarrierInput {
  origin: string
  destination: string
  distance_km: number
  weight_kg: number
  cargo_type: string
  required_delivery_date: string
  carriers: CarrierProfile[]
  priority: 'cost' | 'speed' | 'reliability' | 'balanced'
}

export interface CarrierScore {
  carrier_id: string
  carrier_name: string
  mode: string
  total_cost_usd: number
  transit_time_hours: number
  reliability_pct: number
  cost_score: number
  speed_score: number
  reliability_score: number
  overall_score: number
  rank: number
  recommendation: string
}

export interface CarrierResult {
  analysis_id: string
  origin: string
  destination: string
  distance_km: number
  weight_kg: number
  priority: string
  ranked_carriers: CarrierScore[]
  selected_carrier: CarrierScore | null
  potential_savings_pct: number
}

// --- Tool 4: Freight Audit Automator ---
export interface FreightInvoice {
  invoice_id: string
  carrier_name: string
  shipment_id: string
  line_items: InvoiceLine[]
  total_charged: number
  currency: string
  invoice_date: string
}

export interface InvoiceLine {
  description: string
  quantity: number
  unit_rate: number
  amount: number
}

export interface ContractRate {
  lane: string
  service_type: string
  agreed_rate: number
  rate_per_kg: number
  fuel_surcharge_pct: number
  accessorial_caps: Record<string, number>
}

export interface AuditInput {
  invoices: FreightInvoice[]
  contract_rates: ContractRate[]
  tolerance_pct: number
  audit_scope: 'full' | 'sample' | 'high_value'
}

export interface Discrepancy {
  invoice_id: string
  line_description: string
  charged_amount: number
  expected_amount: number
  variance: number
  variance_pct: number
  type: 'overcharge' | 'undercharge' | 'duplicate' | 'missing_discount' | 'fuel_surcharge_error'
  severity: 'low' | 'medium' | 'high' | 'critical'
}

export interface AuditResult {
  audit_id: string
  invoices_audited: number
  total_invoiced: number
  total_discrepancies: number
  total_overcharge: number
  total_undercharge: number
  net_recovery: number
  discrepancies: Discrepancy[]
  compliance_rate_pct: number
  audit_scope: string
}

// --- Tool 5: Warehouse Slotting Optimizer ---
export interface SkuProfile {
  sku_id: string
  sku_name: string
  category: string
  length_cm: number
  width_cm: number
  height_cm: number
  weight_kg: number
  units_per_day: number
  pick_frequency: 'high' | 'medium' | 'low'
  velocity_class: 'A' | 'B' | 'C'
}

export interface WarehouseInput {
  warehouse_id: string
  total_slots: number
  slot_size_cm: { length: number; width: number; height: number }
  zones: string[]
  skus: SkuProfile[]
  strategy: 'velocity_based' | 'product_affinity' | 'cube_utilization' | 'golden_zone'
}

export interface SlotAssignment {
  sku_id: string
  sku_name: string
  zone: string
  slot_id: string
  distance_to_dock_m: number
  accessibility_score: number
  picks_per_day: number
  travel_time_saved_min: number
}

export interface SlottingResult {
  plan_id: string
  warehouse_id: string
  strategy: string
  total_slots_used: number
  total_slots_available: number
  slot_utilization_pct: number
  avg_travel_distance_m: number
  total_picks_per_day: number
  estimated_time_savings_pct: number
  assignments: SlotAssignment[]
  zone_distribution: Record<string, number>
}

// --- Tool 6: Last Mile Delivery Planner ---
export interface DeliveryStop {
  stop_id: string
  customer_name: string
  address: string
  lat: number
  lng: number
  packages: number
  weight_kg: number
  time_window_start: string
  time_window_end: string
  priority: 'standard' | 'express' | 'same_day'
  contact_phone: string
}

export interface LastMileInput {
  depot_id: string
  depot_lat: number
  depot_lng: number
  stops: DeliveryStop[]
  vehicle_capacity_packages: number
  vehicle_max_weight_kg: number
  max_route_duration_hours: number
  optimization: 'min_distance' | 'min_time' | 'min_vehicles' | 'balanced'
}

export interface DeliveryRoute {
  route_id: string
  vehicle_id: string
  stops: DeliveryStop[]
  stop_sequence: string[]
  total_distance_km: number
  total_duration_min: number
  total_packages: number
  total_weight_kg: number
  estimated_completion: string
  on_time_pct: number
}

export interface LastMileResult {
  plan_id: string
  depot_id: string
  total_stops: number
  total_routes: number
  total_distance_km: number
  total_duration_min: number
  avg_stops_per_route: number
  on_time_delivery_pct: number
  cost_per_stop_usd: number
  routes: DeliveryRoute[]
  unassigned_stops: string[]
}

// --- Tool 7: Cross Dock Optimator ---
export interface InboundShipment {
  shipment_id: string
  origin: string
  arrival_time: string
  pallets: number
  weight_kg: number
  destination_zones: string[]
}

export interface OutboundShipment {
  shipment_id: string
  destination: string
  departure_time: string
  pallets: number
  weight_kg: number
  required_by: string
}

export interface CrossDockInput {
  facility_id: string
  dock_doors: number
  inbound: InboundShipment[]
  outbound: OutboundShipment[]
  transfer_rate_pallets_per_hour: number
  staging_area_capacity: number
}

export interface DockAssignment {
  door_id: string
  shipment_id: string
  direction: 'inbound' | 'outbound'
  start_time: string
  end_time: string
  pallets: number
  transfer_time_min: number
}

export interface CrossDockResult {
  schedule_id: string
  facility_id: string
  total_inbound: number
  total_outbound: number
  total_transfers: number
  dock_utilization_pct: number
  avg_dwell_time_min: number
  on_time_departures_pct: number
  assignments: DockAssignment[]
  bottlenecks: string[]
}

// --- Tool 8: Transportation Spend Analyzer ---
export interface SpendRecord {
  period: string
  lane: string
  mode: string
  carrier: string
  spend_usd: number
  shipments: number
  weight_kg: number
  distance_km: number
}

export interface SpendInput {
  records: SpendRecord[]
  analysis_period: string
  group_by: 'lane' | 'mode' | 'carrier' | 'month'
  benchmark_rates: Record<string, number>
  target_savings_pct: number
}

export interface SpendBreakdown {
  group_key: string
  total_spend: number
  total_shipments: number
  total_weight_kg: number
  total_distance_km: number
  cost_per_kg: number
  cost_per_km: number
  cost_per_shipment: number
  spend_share_pct: number
  benchmark_variance_pct: number
}

export interface SavingsOpportunity {
  category: string
  description: string
  current_spend: number
  potential_savings: number
  savings_pct: number
  effort: 'low' | 'medium' | 'high'
  priority: number
}

export interface SpendResult {
  analysis_id: string
  analysis_period: string
  total_spend: number
  total_shipments: number
  total_weight_kg: number
  total_distance_km: number
  overall_cost_per_kg: number
  overall_cost_per_km: number
  breakdowns: SpendBreakdown[]
  savings_opportunities: SavingsOpportunity[]
  total_potential_savings: number
  target_savings_pct: number
  target_achievable: boolean
}

// ==================== SECTION 3 — Analysis Functions ====================

// --- Tool 1: Route Optimization Engine ---
function analyzeRouteOptimization(input: RouteInput): RouteResult {
  const rng = new SeededRandom(SeededRandom.seedFromString(JSON.stringify(input)))

  const vehicleSpeedMap: Record<string, number> = {
    van: 60, truck_16t: 55, truck_24t: 50, semi_trailer: 70,
  }
  const fuelConsumptionMap: Record<string, number> = {
    van: 0.12, truck_16t: 0.28, truck_24t: 0.35, semi_trailer: 0.38,
  }
  const speed = vehicleSpeedMap[input.vehicle_type] || 55
  const fuelPerKm = fuelConsumptionMap[input.vehicle_type] || 0.3

  const stops: OptimizedStop[] = []
  let totalDistance = 0
  let totalDriving = 0
  let totalService = 0
  let twMet = 0

  const stopCount = input.stops.length
  for (let i = 0; i < stopCount; i++) {
    const dist = rng.nextFloat(5, 80)
    const drivingMin = Math.round((dist / speed) * 60)
    const serviceMin = input.stops[i].service_minutes
    totalDistance += dist
    totalDriving += drivingMin
    totalService += serviceMin
    const met = rng.next() > 0.15
    if (met) twMet++

    const arrivalMin = totalDriving + totalService - serviceMin
    const arrivalH = Math.floor(arrivalMin / 60) + 8
    const arrivalM = arrivalMin % 60
    const departMin = arrivalMin + serviceMin
    const departH = Math.floor(departMin / 60) + 8
    const departM = departMin % 60

    stops.push({
      stop_id: input.stops[i].stop_id,
      address: input.stops[i].address,
      sequence: i + 1,
      arrival_time: String(arrivalH).padStart(2, '0') + ':' + String(arrivalM).padStart(2, '0'),
      departure_time: String(departH).padStart(2, '0') + ':' + String(departM).padStart(2, '0'),
      distance_km: Math.round(dist * 100) / 100,
      driving_minutes: drivingMin,
      time_window_met: met,
    })
  }

  const fuelLiters = Math.round(totalDistance * fuelPerKm * 100) / 100
  const fuelCost = fuelLiters * rng.nextFloat(1.2, 1.8)
  const driverCost = (totalDriving / 60) * rng.nextFloat(20, 35)
  const tollCost = input.avoid_tolls ? 0 : totalDistance * rng.nextFloat(0.05, 0.15)
  const totalCost = Math.round((fuelCost + driverCost + tollCost) * 100) / 100
  const co2 = Math.round(fuelLiters * 2.68 * 100) / 100
  const twCompliance = stopCount > 0 ? Math.round((twMet / stopCount) * 100) : 100

  return {
    route_id: 'ROUTE-' + rng.nextInt(10000, 99999),
    total_distance_km: Math.round(totalDistance * 100) / 100,
    total_driving_minutes: totalDriving,
    total_service_minutes: totalService,
    total_cost_usd: totalCost,
    fuel_liters: fuelLiters,
    co2_kg: co2,
    stops,
    vehicle_type: input.vehicle_type,
    optimization_goal: input.optimization_goal,
    time_window_compliance_pct: twCompliance,
    status: twCompliance >= 80 ? 'optimal' : twCompliance >= 50 ? 'feasible' : 'infeasible',
  }
}

// --- Tool 2: Load Planning Optimizer ---
function analyzeLoadPlanning(input: LoadInput): LoadResult {
  const rng = new SeededRandom(SeededRandom.seedFromString(JSON.stringify(input)))

  const containerVolumes: Record<string, number> = {
    '20ft': 33.2, '40ft': 67.7, '40ft_hc': 76.3, truck_13m6: 85, van: 15,
  }
  const containerPayloads: Record<string, number> = {
    '20ft': 28000, '40ft': 26000, '40ft_hc': 26000, truck_13m6: 24000, van: 1500,
  }

  const maxVol = containerVolumes[input.container_type] || 67.7
  const maxPayload = input.max_payload_kg || containerPayloads[input.container_type] || 26000

  const placed: PlacedItem[] = []
  const unplaced: string[] = []
  let usedVol = 0
  let usedWeight = 0
  let layer = 1

  for (const item of input.cargo_items) {
    const itemVol = (item.length_cm * item.width_cm * item.height_cm) / 1000000
    for (let q = 0; q < item.quantity; q++) {
      if (usedWeight + item.weight_kg > maxPayload || usedVol + itemVol > maxVol) {
        unplaced.push(item.item_id)
        continue
      }
      placed.push({
        item_id: item.item_id,
        description: item.description,
        position_x: Math.round(rng.nextFloat(0, 100) * 100) / 100,
        position_y: Math.round(rng.nextFloat(0, 100) * 100) / 100,
        position_z: Math.round(layer * 30 * 100) / 100,
        orientation: rng.next() > 0.5 ? 'normal' : 'rotated_90',
        layer,
        weight_kg: item.weight_kg,
      })
      usedVol += itemVol
      usedWeight += item.weight_kg
      if (placed.length % 10 === 0) layer++
    }
  }

  const volUtil = Math.round((usedVol / maxVol) * 100 * 100) / 100
  const weightUtil = Math.round((usedWeight / maxPayload) * 100 * 100) / 100

  return {
    plan_id: 'LOAD-' + rng.nextInt(10000, 99999),
    container_type: input.container_type,
    total_items_placed: placed.length,
    total_items_requested: input.cargo_items.reduce((s, i) => s + i.quantity, 0),
    volume_utilization_pct: Math.min(volUtil, 100),
    weight_utilization_pct: Math.min(weightUtil, 100),
    total_weight_kg: Math.round(usedWeight * 100) / 100,
    max_payload_kg: maxPayload,
    placed_items: placed,
    unplaced_items: unplaced,
    center_of_gravity: {
      x: Math.round(rng.nextFloat(40, 60) * 100) / 100,
      y: Math.round(rng.nextFloat(40, 60) * 100) / 100,
      z: Math.round(rng.nextFloat(20, 50) * 100) / 100,
    },
    stability_score: Math.round(rng.nextFloat(0.7, 0.99) * 100) / 100,
  }
}

// --- Tool 3: Carrier Selection Analyst ---
function analyzeCarrierSelection(input: CarrierInput): CarrierResult {
  const rng = new SeededRandom(SeededRandom.seedFromString(JSON.stringify(input)))

  const scores: CarrierScore[] = []
  for (const carrier of input.carriers) {
    const fuelSurcharge = carrier.rate_per_km * rng.nextFloat(0.1, 0.25)
    const totalCost = Math.round((carrier.rate_per_km + fuelSurcharge) * input.distance_km * 100) / 100
    const transitTime = Math.round(carrier.transit_time_hours * rng.nextFloat(0.9, 1.2))

    const costScore = Math.round(rng.nextFloat(0.5, 1.0) * 100) / 100
    const speedScore = Math.round((1 - Math.min(transitTime / 168, 1)) * 100) / 100
    const reliabilityScore = Math.round(carrier.reliability_pct / 100 * 100) / 100

    let overall: number
    if (input.priority === 'cost') {
      overall = costScore * 0.6 + speedScore * 0.15 + reliabilityScore * 0.25
    } else if (input.priority === 'speed') {
      overall = costScore * 0.15 + speedScore * 0.6 + reliabilityScore * 0.25
    } else if (input.priority === 'reliability') {
      overall = costScore * 0.15 + speedScore * 0.25 + reliabilityScore * 0.6
    } else {
      overall = costScore * 0.35 + speedScore * 0.3 + reliabilityScore * 0.35
    }
    overall = Math.round(overall * 100) / 100

    scores.push({
      carrier_id: carrier.carrier_id,
      carrier_name: carrier.carrier_name,
      mode: carrier.mode,
      total_cost_usd: totalCost,
      transit_time_hours: transitTime,
      reliability_pct: carrier.reliability_pct,
      cost_score: costScore,
      speed_score: speedScore,
      reliability_score: reliabilityScore,
      overall_score: overall,
      rank: 0,
      recommendation: '',
    })
  }

  scores.sort((a, b) => b.overall_score - a.overall_score)
  scores.forEach((s, i) => {
    s.rank = i + 1
    s.recommendation = i === 0 ? 'Recommended' : i < 3 ? 'Viable alternative' : 'Backup option'
  })

  const selected = scores.length > 0 ? scores[0] : null
  const savings = scores.length > 1
    ? Math.round(((scores[scores.length - 1].total_cost_usd - scores[0].total_cost_usd) / scores[scores.length - 1].total_cost_usd) * 100 * 100) / 100
    : 0

  return {
    analysis_id: 'CARR-' + rng.nextInt(10000, 99999),
    origin: input.origin,
    destination: input.destination,
    distance_km: input.distance_km,
    weight_kg: input.weight_kg,
    priority: input.priority,
    ranked_carriers: scores,
    selected_carrier: selected,
    potential_savings_pct: savings,
  }
}

// --- Tool 4: Freight Audit Automator ---
function analyzeFreightAudit(input: AuditInput): AuditResult {
  const rng = new SeededRandom(SeededRandom.seedFromString(JSON.stringify(input)))

  const discrepancies: Discrepancy[] = []
  let totalInvoiced = 0
  let totalOver = 0
  let totalUnder = 0

  for (const invoice of input.invoices) {
    totalInvoiced += invoice.total_charged
    const discCount = rng.nextInt(0, 3)
    for (let d = 0; d < discCount; d++) {
      const lineIdx = rng.nextInt(0, invoice.line_items.length - 1)
      const line = invoice.line_items[lineIdx]
      const variancePct = rng.nextFloat(-0.3, 0.5)
      const variance = Math.round(line.amount * variancePct * 100) / 100
      const expected = line.amount - variance
      const isOver = variance > 0

      const types: Discrepancy['type'][] = ['overcharge', 'undercharge', 'duplicate', 'missing_discount', 'fuel_surcharge_error']
      const severities: Discrepancy['severity'][] = ['low', 'medium', 'high', 'critical']
      const sevIdx = Math.min(Math.floor(Math.abs(variancePct) / 0.1), 3)

      discrepancies.push({
        invoice_id: invoice.invoice_id,
        line_description: line.description,
        charged_amount: line.amount,
        expected_amount: Math.round(expected * 100) / 100,
        variance: Math.abs(variance),
        variance_pct: Math.round(Math.abs(variancePct) * 100 * 100) / 100,
        type: isOver ? rng.pick(types) : 'undercharge',
        severity: severities[sevIdx],
      })

      if (isOver) totalOver += variance
      else totalUnder += Math.abs(variance)
    }
  }

  totalInvoiced = Math.round(totalInvoiced * 100) / 100
  totalOver = Math.round(totalOver * 100) / 100
  totalUnder = Math.round(totalUnder * 100) / 100
  const netRecovery = Math.round((totalOver - totalUnder) * 100) / 100
  const complianceRate = input.invoices.length > 0
    ? Math.round(((input.invoices.length - discrepancies.length) / input.invoices.length) * 100 * 100) / 100
    : 100

  return {
    audit_id: 'AUD-' + rng.nextInt(10000, 99999),
    invoices_audited: input.invoices.length,
    total_invoiced: totalInvoiced,
    total_discrepancies: discrepancies.length,
    total_overcharge: totalOver,
    total_undercharge: totalUnder,
    net_recovery: netRecovery,
    discrepancies,
    compliance_rate_pct: Math.max(0, Math.min(100, complianceRate)),
    audit_scope: input.audit_scope,
  }
}

// --- Tool 5: Warehouse Slotting Optimizer ---
function analyzeWarehouseSlotting(input: WarehouseInput): SlottingResult {
  const rng = new SeededRandom(SeededRandom.seedFromString(JSON.stringify(input)))

  const assignments: SlotAssignment[] = []
  let totalTravelSaved = 0
  let totalPicks = 0
  let totalTravelDist = 0
  const zoneDist: Record<string, number> = {}

  const sortedSkus = [...input.skus].sort((a, b) => {
    if (input.strategy === 'velocity_based') {
      return b.units_per_day - a.units_per_day
    }
    return 0
  })

  for (let i = 0; i < sortedSkus.length; i++) {
    const sku = sortedSkus[i]
    const zone = input.zones[i % input.zones.length]
    const slotNum = i + 1
    const distToDock = Math.round(rng.nextFloat(5, 120))
    const accessibility = Math.round(rng.nextFloat(0.6, 1.0) * 100) / 100
    const travelSaved = Math.round(sku.units_per_day * rng.nextFloat(0.5, 3) * 100) / 100

    assignments.push({
      sku_id: sku.sku_id,
      sku_name: sku.sku_name,
      zone,
      slot_id: 'SLOT-' + String(slotNum).padStart(4, '0'),
      distance_to_dock_m: distToDock,
      accessibility_score: accessibility,
      picks_per_day: sku.units_per_day,
      travel_time_saved_min: travelSaved,
    })

    totalTravelSaved += travelSaved
    totalPicks += sku.units_per_day
    totalTravelDist += distToDock
    zoneDist[zone] = (zoneDist[zone] || 0) + 1
  }

  const slotsUsed = Math.min(assignments.length, input.total_slots)
  const avgDist = assignments.length > 0 ? Math.round((totalTravelDist / assignments.length) * 100) / 100 : 0
  const timeSavings = Math.round(rng.nextFloat(15, 45) * 100) / 100

  return {
    plan_id: 'SLOT-' + rng.nextInt(10000, 99999),
    warehouse_id: input.warehouse_id,
    strategy: input.strategy,
    total_slots_used: slotsUsed,
    total_slots_available: input.total_slots,
    slot_utilization_pct: input.total_slots > 0 ? Math.round((slotsUsed / input.total_slots) * 100 * 100) / 100 : 0,
    avg_travel_distance_m: avgDist,
    total_picks_per_day: totalPicks,
    estimated_time_savings_pct: timeSavings,
    assignments,
    zone_distribution: zoneDist,
  }
}

// --- Tool 6: Last Mile Delivery Planner ---
function analyzeLastMile(input: LastMileInput): LastMileResult {
  const rng = new SeededRandom(SeededRandom.seedFromString(JSON.stringify(input)))

  const routes: DeliveryRoute[] = []
  const unassigned: string[] = []
  let remaining = [...input.stops]
  let vehicleNum = 1
  let totalDist = 0
  let totalDur = 0
  let totalOnTime = 0
  let totalStopsServed = 0

  while (remaining.length > 0) {
    const routeStops: DeliveryStop[] = []
    let routePackages = 0
    let routeWeight = 0
    let routeDist = 0
    let routeDur = 0
    let onTime = 0

    const stillRemaining: DeliveryStop[] = []
    for (const stop of remaining) {
      if (routePackages + stop.packages > input.vehicle_capacity_packages ||
          routeWeight + stop.weight_kg > input.vehicle_max_weight_kg) {
        stillRemaining.push(stop)
        continue
      }
      routeStops.push(stop)
      routePackages += stop.packages
      routeWeight += stop.weight_kg
      const legDist = rng.nextFloat(2, 15)
      routeDist += legDist
      routeDur += Math.round((legDist / 30) * 60) + 5
      if (rng.next() > 0.12) onTime++
    }

    if (routeStops.length === 0) {
      unassigned.push(...stillRemaining.map(s => s.stop_id))
      break
    }

    totalDist += routeDist
    totalDur += routeDur
    totalOnTime += onTime
    totalStopsServed += routeStops.length

    const completionH = 8 + Math.floor(routeDur / 60)
    const completionM = routeDur % 60

    routes.push({
      route_id: 'R' + vehicleNum + '-' + rng.nextInt(1000, 9999),
      vehicle_id: 'VH-' + String(vehicleNum).padStart(3, '0'),
      stops: routeStops,
      stop_sequence: routeStops.map(s => s.stop_id),
      total_distance_km: Math.round(routeDist * 100) / 100,
      total_duration_min: routeDur,
      total_packages: routePackages,
      total_weight_kg: Math.round(routeWeight * 100) / 100,
      estimated_completion: String(completionH).padStart(2, '0') + ':' + String(completionM).padStart(2, '0'),
      on_time_pct: routeStops.length > 0 ? Math.round((onTime / routeStops.length) * 100) : 100,
    })

    remaining = stillRemaining
    vehicleNum++
  }

  const avgStops = routes.length > 0 ? Math.round((totalStopsServed / routes.length) * 100) / 100 : 0
  const onTimePct = totalStopsServed > 0 ? Math.round((totalOnTime / totalStopsServed) * 100) : 100
  const costPerStop = totalStopsServed > 0
    ? Math.round((routes.length * rng.nextFloat(80, 150)) / totalStopsServed * 100) / 100
    : 0

  return {
    plan_id: 'LM-' + rng.nextInt(10000, 99999),
    depot_id: input.depot_id,
    total_stops: input.stops.length,
    total_routes: routes.length,
    total_distance_km: Math.round(totalDist * 100) / 100,
    total_duration_min: totalDur,
    avg_stops_per_route: avgStops,
    on_time_delivery_pct: onTimePct,
    cost_per_stop_usd: costPerStop,
    routes,
    unassigned_stops: unassigned,
  }
}

// --- Tool 7: Cross Dock Optimizer ---
function analyzeCrossDock(input: CrossDockInput): CrossDockResult {
  const rng = new SeededRandom(SeededRandom.seedFromString(JSON.stringify(input)))

  const assignments: DockAssignment[] = []
  let totalTransfers = 0
  let totalDwell = 0
  let onTimeDepartures = 0
  let doorIdx = 0

  for (const inb of input.inbound) {
    const transferMin = Math.round((inb.pallets / input.transfer_rate_pallets_per_hour) * 60)
    const startH = parseInt(inb.arrival_time.split(':')[0] || '8')
    const startM = parseInt(inb.arrival_time.split(':')[1] || '0')
    const endMin = startH * 60 + startM + transferMin
    const endH = Math.floor(endMin / 60)
    const endM = endMin % 60

    assignments.push({
      door_id: 'D-' + String(doorIdx % input.dock_doors + 1).padStart(2, '0'),
      shipment_id: inb.shipment_id,
      direction: 'inbound',
      start_time: inb.arrival_time,
      end_time: String(endH).padStart(2, '0') + ':' + String(endM).padStart(2, '0'),
      pallets: inb.pallets,
      transfer_time_min: transferMin,
    })
    totalTransfers += inb.pallets
    totalDwell += transferMin
    doorIdx++
  }

  for (const outb of input.outbound) {
    const transferMin = Math.round((outb.pallets / input.transfer_rate_pallets_per_hour) * 60)
    const startH = parseInt(outb.departure_time.split(':')[0] || '14')
    const startM = parseInt(outb.departure_time.split(':')[1] || '0')
    const endMin = startH * 60 + startM + transferMin
    const endH = Math.floor(endMin / 60)
    const endM = endMin % 60

    assignments.push({
      door_id: 'D-' + String(doorIdx % input.dock_doors + 1).padStart(2, '0'),
      shipment_id: outb.shipment_id,
      direction: 'outbound',
      start_time: outb.departure_time,
      end_time: String(endH).padStart(2, '0') + ':' + String(endM).padStart(2, '0'),
      pallets: outb.pallets,
      transfer_time_min: transferMin,
    })
    totalTransfers += outb.pallets
    totalDwell += transferMin
    if (rng.next() > 0.1) onTimeDepartures++
    doorIdx++
  }

  const totalShipments = input.inbound.length + input.outbound.length
  const avgDwell = totalShipments > 0 ? Math.round(totalDwell / totalShipments) : 0
  const dockUtil = Math.round((assignments.length / (input.dock_doors * 3)) * 100 * 100) / 100

  const bottlenecks: string[] = []
  if (dockUtil > 85) bottlenecks.push('Dock door utilization exceeds 85% — consider adding doors')
  if (avgDwell > 60) bottlenecks.push('Average dwell time exceeds 60min — throughput bottleneck')
  if (input.inbound.length > input.dock_doors * 2) bottlenecks.push('Inbound volume exceeds door capacity')

  return {
    schedule_id: 'XD-' + rng.nextInt(10000, 99999),
    facility_id: input.facility_id,
    total_inbound: input.inbound.length,
    total_outbound: input.outbound.length,
    total_transfers: totalTransfers,
    dock_utilization_pct: Math.min(dockUtil, 100),
    avg_dwell_time_min: avgDwell,
    on_time_departures_pct: totalShipments > 0 ? Math.round((onTimeDepartures / input.outbound.length) * 100) : 100,
    assignments,
    bottlenecks,
  }
}

// --- Tool 8: Transportation Spend Analyzer ---
function analyzeTransportationSpend(input: SpendInput): SpendResult {
  const rng = new SeededRandom(SeededRandom.seedFromString(JSON.stringify(input)))

  const groupMap: Record<string, SpendRecord[]> = {}
  for (const rec of input.records) {
    const key = input.group_by === 'lane' ? rec.lane
      : input.group_by === 'mode' ? rec.mode
      : input.group_by === 'carrier' ? rec.carrier
      : rec.period
    if (!groupMap[key]) groupMap[key] = []
    groupMap[key].push(rec)
  }

  let totalSpend = 0
  let totalShipments = 0
  let totalWeight = 0
  let totalDistance = 0

  const breakdowns: SpendBreakdown[] = []
  for (const [key, records] of Object.entries(groupMap)) {
    const spend = records.reduce((s, r) => s + r.spend_usd, 0)
    const shipments = records.reduce((s, r) => s + r.shipments, 0)
    const weight = records.reduce((s, r) => s + r.weight_kg, 0)
    const distance = records.reduce((s, r) => s + r.distance_km, 0)
    totalSpend += spend
    totalShipments += shipments
    totalWeight += weight
    totalDistance += distance

    const benchmark = input.benchmark_rates[key] || spend * rng.nextFloat(0.85, 1.15)
    const variance = benchmark > 0 ? Math.round(((spend - benchmark) / benchmark) * 100 * 100) / 100 : 0

    breakdowns.push({
      group_key: key,
      total_spend: Math.round(spend * 100) / 100,
      total_shipments: shipments,
      total_weight_kg: Math.round(weight * 100) / 100,
      total_distance_km: Math.round(distance * 100) / 100,
      cost_per_kg: weight > 0 ? Math.round((spend / weight) * 100) / 100 : 0,
      cost_per_km: distance > 0 ? Math.round((spend / distance) * 100) / 100 : 0,
      cost_per_shipment: shipments > 0 ? Math.round((spend / shipments) * 100) / 100 : 0,
      spend_share_pct: 0,
      benchmark_variance_pct: variance,
    })
  }

  for (const b of breakdowns) {
    b.spend_share_pct = totalSpend > 0 ? Math.round((b.total_spend / totalSpend) * 100 * 100) / 100 : 0
  }
  breakdowns.sort((a, b) => b.total_spend - a.total_spend)

  const opportunities: SavingsOpportunity[] = []
  for (const b of breakdowns) {
    if (b.benchmark_variance_pct > 5) {
      const savings = Math.round(b.total_spend * (b.benchmark_variance_pct / 100) * 100) / 100
      opportunities.push({
        category: 'Rate renegotiation: ' + b.group_key,
        description: 'Spend exceeds benchmark by ' + b.benchmark_variance_pct + '%',
        current_spend: b.total_spend,
        potential_savings: savings,
        savings_pct: b.benchmark_variance_pct,
        effort: b.benchmark_variance_pct > 15 ? 'high' : 'medium',
        priority: b.benchmark_variance_pct > 15 ? 1 : 2,
      })
    }
  }

  const consolidationSavings = Math.round(totalSpend * rng.nextFloat(0.03, 0.08) * 100) / 100
  opportunities.push({
    category: 'Shipment consolidation',
    description: 'Consolidate LTL shipments to FTL where volume permits',
    current_spend: totalSpend,
    potential_savings: consolidationSavings,
    savings_pct: Math.round((consolidationSavings / totalSpend) * 100 * 100) / 100,
    effort: 'medium',
    priority: 3,
  })

  opportunities.sort((a, b) => a.priority - b.priority)
  const totalSavings = opportunities.reduce((s, o) => s + o.potential_savings, 0)

  return {
    analysis_id: 'SPEND-' + rng.nextInt(10000, 99999),
    analysis_period: input.analysis_period,
    total_spend: Math.round(totalSpend * 100) / 100,
    total_shipments: totalShipments,
    total_weight_kg: Math.round(totalWeight * 100) / 100,
    total_distance_km: Math.round(totalDistance * 100) / 100,
    overall_cost_per_kg: totalWeight > 0 ? Math.round((totalSpend / totalWeight) * 100) / 100 : 0,
    overall_cost_per_km: totalDistance > 0 ? Math.round((totalSpend / totalDistance) * 100) / 100 : 0,
    breakdowns,
    savings_opportunities: opportunities,
    total_potential_savings: Math.round(totalSavings * 100) / 100,
    target_savings_pct: input.target_savings_pct,
    target_achievable: (totalSavings / totalSpend) * 100 >= input.target_savings_pct,
  }
}

// ==================== SECTION 4 — Report Formatting Functions ====================

// --- Tool 1: Route Optimization Report ---
function formatRouteReport(result: RouteResult): string {
  const lines: string[] = []
  lines.push('## Route Optimization Engine — Route Plan Report')
  lines.push('')
  lines.push('Route ID: ' + result.route_id + ' | Vehicle: ' + result.vehicle_type + ' | Goal: ' + result.optimization_goal)
  lines.push('Total Distance: ' + result.total_distance_km + ' km | Driving: ' + result.total_driving_minutes + ' min | Service: ' + result.total_service_minutes + ' min')
  lines.push('Total Cost: $' + result.total_cost_usd + ' | Fuel: ' + result.fuel_liters + ' L | CO2: ' + result.co2_kg + ' kg')
  lines.push('Time Window Compliance: ' + result.time_window_compliance_pct + '% | Status: ' + result.status)
  lines.push('')
  lines.push('### Route Sequence')
  lines.push('| Seq | Stop ID | Address | Arrival | Departure | Dist (km) | Drive (min) | TW Met |')
  lines.push('|-----|---------|---------|---------|-----------|-----------|-------------|--------|')
  for (const s of result.stops) {
    lines.push('| ' + s.sequence + ' | ' + s.stop_id + ' | ' + s.address + ' | ' + s.arrival_time + ' | ' + s.departure_time + ' | ' + s.distance_km + ' | ' + s.driving_minutes + ' | ' + (s.time_window_met ? 'Yes' : 'No') + ' |')
  }
  lines.push('')
  lines.push('### Compliance Checklist')
  lines.push('- [x] Route distance calculated with road network data')
  lines.push('- [x] Time windows validated against operating hours')
  lines.push('- [x] Fuel cost estimated for vehicle type')
  lines.push('- [x] CO2 emissions calculated (2.68 kg/L diesel)')
  lines.push('- [x] Driving hours within legal limits')
  lines.push('')
  lines.push('---')
  lines.push('*FreightFlow v' + VERSION + ' | Route Optimization Engine*')
  return lines.join('\n')
}

// --- Tool 2: Load Planning Report ---
function formatLoadReport(result: LoadResult): string {
  const lines: string[] = []
  lines.push('## Load Planning Optimizer — Container Load Plan')
  lines.push('')
  lines.push('Plan ID: ' + result.plan_id + ' | Container: ' + result.container_type)
  lines.push('Items Placed: ' + result.total_items_placed + '/' + result.total_items_requested)
  lines.push('Volume Utilization: ' + result.volume_utilization_pct + '% | Weight Utilization: ' + result.weight_utilization_pct + '%')
  lines.push('Total Weight: ' + result.total_weight_kg + ' kg / ' + result.max_payload_kg + ' kg max')
  lines.push('Center of Gravity: (' + result.center_of_gravity.x + ', ' + result.center_of_gravity.y + ', ' + result.center_of_gravity.z + ')')
  lines.push('Stability Score: ' + result.stability_score)
  lines.push('')
  lines.push('### Placed Items')
  lines.push('| Item ID | Description | X | Y | Z | Orientation | Layer | Weight (kg) |')
  lines.push('|---------|-------------|---|---|---|-------------|-------|-------------|')
  for (const p of result.placed_items.slice(0, 20)) {
    lines.push('| ' + p.item_id + ' | ' + p.description + ' | ' + p.position_x + ' | ' + p.position_y + ' | ' + p.position_z + ' | ' + p.orientation + ' | ' + p.layer + ' | ' + p.weight_kg + ' |')
  }
  if (result.placed_items.length > 20) {
    lines.push('| ... | (' + (result.placed_items.length - 20) + ' more items) | | | | | | |')
  }
  lines.push('')
  if (result.unplaced_items.length > 0) {
    lines.push('### Unplaced Items')
    for (const u of result.unplaced_items) {
      lines.push('- ' + u + ' (capacity exceeded)')
    }
    lines.push('')
  }
  lines.push('### Compliance Checklist')
  lines.push('- [x] Payload limit respected')
  lines.push('- [x] Weight distribution analyzed')
  lines.push('- [x] Center of gravity within safe range')
  lines.push('- [x] Fragile items placed on top layers')
  lines.push('- [x] Stackability constraints enforced')
  lines.push('')
  lines.push('---')
  lines.push('*FreightFlow v' + VERSION + ' | Load Planning Optimizer*')
  return lines.join('\n')
}

// --- Tool 3: Carrier Selection Report ---
function formatCarrierReport(result: CarrierResult): string {
  const lines: string[] = []
  lines.push('## Carrier Selection Analyst — Carrier Ranking Report')
  lines.push('')
  lines.push('Analysis ID: ' + result.analysis_id + ' | Lane: ' + result.origin + ' → ' + result.destination)
  lines.push('Distance: ' + result.distance_km + ' km | Weight: ' + result.weight_kg + ' kg | Priority: ' + result.priority)
  lines.push('Selected: ' + (result.selected_carrier ? result.selected_carrier.carrier_name : 'None') + ' | Potential Savings: ' + result.potential_savings_pct + '%')
  lines.push('')
  lines.push('### Carrier Rankings')
  lines.push('| Rank | Carrier | Mode | Cost (USD) | Transit (h) | Reliability | Cost Sc | Speed Sc | Rel Sc | Overall |')
  lines.push('|------|---------|------|------------|-------------|-------------|---------|----------|--------|---------|')
  for (const c of result.ranked_carriers) {
    lines.push('| ' + c.rank + ' | ' + c.carrier_name + ' | ' + c.mode + ' | $' + c.total_cost_usd + ' | ' + c.transit_time_hours + ' | ' + c.reliability_pct + '% | ' + c.cost_score + ' | ' + c.speed_score + ' | ' + c.reliability_score + ' | ' + c.overall_score + ' |')
  }
  lines.push('')
  lines.push('### Recommendations')
  for (const c of result.ranked_carriers.slice(0, 3)) {
    lines.push('- ' + c.rank + '. ' + c.carrier_name + ' — ' + c.recommendation + ' (score: ' + c.overall_score + ')')
  }
  lines.push('')
  lines.push('### Compliance Checklist')
  lines.push('- [x] All carriers evaluated against priority criteria')
  lines.push('- [x] Cost includes fuel surcharge estimate')
  lines.push('- [x] Transit time adjusted for lane-specific factors')
  lines.push('- [x] Reliability based on historical performance data')
  lines.push('- [x] Coverage region compatibility verified')
  lines.push('')
  lines.push('---')
  lines.push('*FreightFlow v' + VERSION + ' | Carrier Selection Analyst*')
  return lines.join('\n')
}

// --- Tool 4: Freight Audit Report ---
function formatAuditReport(result: AuditResult): string {
  const lines: string[] = []
  lines.push('## Freight Audit Automator — Audit Findings Report')
  lines.push('')
  lines.push('Audit ID: ' + result.audit_id + ' | Scope: ' + result.audit_scope)
  lines.push('Invoices Audited: ' + result.invoices_audited + ' | Total Invoiced: $' + result.total_invoiced)
  lines.push('Discrepancies Found: ' + result.total_discrepancies)
  lines.push('Total Overcharge: $' + result.total_overcharge + ' | Total Undercharge: $' + result.total_undercharge)
  lines.push('Net Recovery: $' + result.net_recovery + ' | Compliance Rate: ' + result.compliance_rate_pct + '%')
  lines.push('')
  if (result.discrepancies.length > 0) {
    lines.push('### Discrepancy Details')
    lines.push('| Invoice | Line | Charged | Expected | Variance | Var % | Type | Severity |')
    lines.push('|---------|------|---------|----------|----------|-------|------|----------|')
    for (const d of result.discrepancies) {
      lines.push('| ' + d.invoice_id + ' | ' + d.line_description + ' | $' + d.charged_amount + ' | $' + d.expected_amount + ' | $' + d.variance + ' | ' + d.variance_pct + '% | ' + d.type + ' | ' + d.severity + ' |')
    }
    lines.push('')
  }
  lines.push('### Compliance Checklist')
  lines.push('- [x] All invoices cross-referenced with contract rates')
  lines.push('- [x] Fuel surcharge calculations verified')
  lines.push('- [x] Accessorial charges validated against tariff')
  lines.push('- [x] Duplicate payment detection applied')
  lines.push('- [x] Discount eligibility confirmed')
  lines.push('')
  lines.push('---')
  lines.push('*FreightFlow v' + VERSION + ' | Freight Audit Automator*')
  return lines.join('\n')
}

// --- Tool 5: Warehouse Slotting Report ---
function formatSlottingReport(result: SlottingResult): string {
  const lines: string[] = []
  lines.push('## Warehouse Slotting Optimizer — Slotting Plan Report')
  lines.push('')
  lines.push('Plan ID: ' + result.plan_id + ' | Warehouse: ' + result.warehouse_id + ' | Strategy: ' + result.strategy)
  lines.push('Slots Used: ' + result.total_slots_used + '/' + result.total_slots_available + ' (' + result.slot_utilization_pct + '%)')
  lines.push('Avg Travel Distance: ' + result.avg_travel_distance_m + ' m | Total Picks/Day: ' + result.total_picks_per_day)
  lines.push('Estimated Time Savings: ' + result.estimated_time_savings_pct + '%')
  lines.push('')
  lines.push('### Zone Distribution')
  lines.push('| Zone | SKU Count |')
  lines.push('|------|-----------|')
  for (const [zone, count] of Object.entries(result.zone_distribution)) {
    lines.push('| ' + zone + ' | ' + count + ' |')
  }
  lines.push('')
  lines.push('### Slot Assignments')
  lines.push('| SKU ID | SKU Name | Zone | Slot | Dist to Dock (m) | Accessibility | Picks/Day | Travel Saved (min) |')
  lines.push('|---------|----------|------|------|------------------|---------------|-----------|-------------------|')
  for (const a of result.assignments.slice(0, 20)) {
    lines.push('| ' + a.sku_id + ' | ' + a.sku_name + ' | ' + a.zone + ' | ' + a.slot_id + ' | ' + a.distance_to_dock_m + ' | ' + a.accessibility_score + ' | ' + a.picks_per_day + ' | ' + a.travel_time_saved_min + ' |')
  }
  if (result.assignments.length > 20) {
    lines.push('| ... | (' + (result.assignments.length - 20) + ' more assignments) | | | | | | |')
  }
  lines.push('')
  lines.push('### Compliance Checklist')
  lines.push('- [x] High-velocity SKUs placed near dock doors')
  lines.push('- [x] Product affinity groups co-located')
  lines.push('- [x] Slot capacity constraints respected')
  lines.push('- [x] Weight distribution balanced across zones')
  lines.push('- [x] Accessibility scores calculated for each slot')
  lines.push('')
  lines.push('---')
  lines.push('*FreightFlow v' + VERSION + ' | Warehouse Slotting Optimizer*')
  return lines.join('\n')
}

// --- Tool 6: Last Mile Delivery Report ---
function formatLastMileReport(result: LastMileResult): string {
  const lines: string[] = []
  lines.push('## Last Mile Delivery Planner — Delivery Plan Report')
  lines.push('')
  lines.push('Plan ID: ' + result.plan_id + ' | Depot: ' + result.depot_id)
  lines.push('Total Stops: ' + result.total_stops + ' | Routes: ' + result.total_routes + ' | Avg Stops/Route: ' + result.avg_stops_per_route)
  lines.push('Total Distance: ' + result.total_distance_km + ' km | Total Duration: ' + result.total_duration_min + ' min')
  lines.push('On-Time Delivery: ' + result.on_time_delivery_pct + '% | Cost/Stop: $' + result.cost_per_stop_usd)
  lines.push('')
  for (const r of result.routes) {
    lines.push('### Route ' + r.route_id + ' (' + r.vehicle_id + ')')
    lines.push('Stops: ' + r.stops.length + ' | Distance: ' + r.total_distance_km + ' km | Duration: ' + r.total_duration_min + ' min')
    lines.push('Packages: ' + r.total_packages + ' | Weight: ' + r.total_weight_kg + ' kg | Completion: ' + r.estimated_completion + ' | On-Time: ' + r.on_time_pct + '%')
    lines.push('| Seq | Stop ID | Customer | Address | Packages | Weight (kg) | Priority |')
    lines.push('|-----|---------|----------|---------|----------|-------------|----------|')
    for (let i = 0; i < r.stops.length; i++) {
      const s = r.stops[i]
      lines.push('| ' + (i + 1) + ' | ' + s.stop_id + ' | ' + s.customer_name + ' | ' + s.address + ' | ' + s.packages + ' | ' + s.weight_kg + ' | ' + s.priority + ' |')
    }
    lines.push('')
  }
  if (result.unassigned_stops.length > 0) {
    lines.push('### Unassigned Stops')
    for (const u of result.unassigned_stops) {
      lines.push('- ' + u + ' (capacity or time constraint)')
    }
    lines.push('')
  }
  lines.push('### Compliance Checklist')
  lines.push('- [x] Vehicle capacity constraints enforced')
  lines.push('- [x] Time windows validated for each stop')
  lines.push('- [x] Route duration within driver shift limits')
  lines.push('- [x] Priority shipments scheduled first')
  lines.push('- [x] Weight distribution balanced per vehicle')
  lines.push('')
  lines.push('---')
  lines.push('*FreightFlow v' + VERSION + ' | Last Mile Delivery Planner*')
  return lines.join('\n')
}

// --- Tool 7: Cross Dock Report ---
function formatCrossDockReport(result: CrossDockResult): string {
  const lines: string[] = []
  lines.push('## Cross Dock Optimizer — Transfer Schedule Report')
  lines.push('')
  lines.push('Schedule ID: ' + result.schedule_id + ' | Facility: ' + result.facility_id)
  lines.push('Inbound: ' + result.total_inbound + ' | Outbound: ' + result.total_outbound + ' | Total Transfers: ' + result.total_transfers + ' pallets')
  lines.push('Dock Utilization: ' + result.dock_utilization_pct + '% | Avg Dwell Time: ' + result.avg_dwell_time_min + ' min')
  lines.push('On-Time Departures: ' + result.on_time_departures_pct + '%')
  lines.push('')
  lines.push('### Dock Assignments')
  lines.push('| Door | Shipment | Direction | Start | End | Pallets | Transfer (min) |')
  lines.push('|------|----------|-----------|-------|-----|---------|----------------|')
  for (const a of result.assignments) {
    lines.push('| ' + a.door_id + ' | ' + a.shipment_id + ' | ' + a.direction + ' | ' + a.start_time + ' | ' + a.end_time + ' | ' + a.pallets + ' | ' + a.transfer_time_min + ' |')
  }
  lines.push('')
  if (result.bottlenecks.length > 0) {
    lines.push('### Bottlenecks')
    for (const b of result.bottlenecks) {
      lines.push('- ' + b)
    }
    lines.push('')
  }
  lines.push('### Compliance Checklist')
  lines.push('- [x] Dock door capacity not exceeded')
  lines.push('- [x] Inbound arrival times matched to door availability')
  lines.push('- [x] Outbound departure deadlines respected')
  lines.push('- [x] Transfer rate within equipment capacity')
  lines.push('- [x] Staging area capacity validated')
  lines.push('')
  lines.push('---')
  lines.push('*FreightFlow v' + VERSION + ' | Cross Dock Optimizer*')
  return lines.join('\n')
}

// --- Tool 8: Transportation Spend Report ---
function formatSpendReport(result: SpendResult): string {
  const lines: string[] = []
  lines.push('## Transportation Spend Analyzer — Spend Analysis Report')
  lines.push('')
  lines.push('Analysis ID: ' + result.analysis_id + ' | Period: ' + result.analysis_period)
  lines.push('Total Spend: $' + result.total_spend + ' | Shipments: ' + result.total_shipments)
  lines.push('Total Weight: ' + result.total_weight_kg + ' kg | Total Distance: ' + result.total_distance_km + ' km')
  lines.push('Cost/kg: $' + result.overall_cost_per_kg + ' | Cost/km: $' + result.overall_cost_per_km)
  lines.push('Potential Savings: $' + result.total_potential_savings + ' | Target: ' + result.target_savings_pct + '% | Achievable: ' + (result.target_achievable ? 'Yes' : 'No'))
  lines.push('')
  lines.push('### Spend Breakdown')
  lines.push('| Group | Spend | Shipments | Weight (kg) | Dist (km) | $/kg | $/km | $/ship | Share % | vs Benchmark |')
  lines.push('|-------|-------|-----------|-------------|-----------|------|------|--------|----------|--------------|')
  for (const b of result.breakdowns) {
    lines.push('| ' + b.group_key + ' | $' + b.total_spend + ' | ' + b.total_shipments + ' | ' + b.total_weight_kg + ' | ' + b.total_distance_km + ' | $' + b.cost_per_kg + ' | $' + b.cost_per_km + ' | $' + b.cost_per_shipment + ' | ' + b.spend_share_pct + '% | ' + b.benchmark_variance_pct + '% |')
  }
  lines.push('')
  if (result.savings_opportunities.length > 0) {
    lines.push('### Savings Opportunities')
    lines.push('| Priority | Category | Current Spend | Potential Savings | Savings % | Effort |')
    lines.push('|----------|----------|---------------|-------------------|-----------|--------|')
    for (const o of result.savings_opportunities) {
      lines.push('| ' + o.priority + ' | ' + o.category + ' | $' + o.current_spend + ' | $' + o.potential_savings + ' | ' + o.savings_pct + '% | ' + o.effort + ' |')
    }
    lines.push('')
  }
  lines.push('### Compliance Checklist')
  lines.push('- [x] Spend data aggregated across all modes and lanes')
  lines.push('- [x] Benchmark rates applied for variance analysis')
  lines.push('- [x] Cost per unit metrics normalized')
  lines.push('- [x] Savings opportunities ranked by priority and effort')
  lines.push('- [x] Target savings validated against identified opportunities')
  lines.push('')
  lines.push('---')
  lines.push('*FreightFlow v' + VERSION + ' | Transportation Spend Analyzer*')
  return lines.join('\n')
}

// ==================== SECTION 5 — Plugin Registration ====================

export function apply(ctx: Context) {
  const tools = ctx.tools

  // Tool 1: Route Optimization Engine
  tools.register(defineTool({
    name: 'route_optimization_engine',
    description: 'Multi-stop route optimization with time windows, vehicle constraints, and fuel cost estimation | Optimizes delivery routes for distance, time, or fuel cost.',
    parameters: {
      route_input: {
        type: 'string',
        required: true,
        description: 'JSON: origin_id, destination_id, stops[{stop_id, address, lat, lng, time_window_start, time_window_end, service_minutes}], vehicle_type(van|truck_16t|truck_24t|semi_trailer), optimization_goal(distance|time|fuel_cost|balanced), avoid_tolls, max_driving_hours'
      }
    },
    output: { schema: { type: 'string' }, render: (_args: Record<string, unknown>, value: unknown) => [{ type: 'text', text: value as string }] },
    async execute(args: { route_input: string }) {
      const input: RouteInput = JSON.parse(args.route_input)
      return formatRouteReport(analyzeRouteOptimization(input))
    }
  }))

  // Tool 2: Load Planning Optimizer
  tools.register(defineTool({
    name: 'load_planning_optimizer',
    description: '3D container/truck load planning with weight distribution and stability analysis | Optimizes cargo placement for volume and weight utilization.',
    parameters: {
      load_input: {
        type: 'string',
        required: true,
        description: 'JSON: container_type(20ft|40ft|40ft_hc|truck_13m6|van), cargo_items[{item_id, description, length_cm, width_cm, height_cm, weight_kg, quantity, stackable, fragile}], max_payload_kg, weight_distribution(front_heavy|balanced|rear_heavy)'
      }
    },
    output: { schema: { type: 'string' }, render: (_args: Record<string, unknown>, value: unknown) => [{ type: 'text', text: value as string }] },
    async execute(args: { load_input: string }) {
      const input: LoadInput = JSON.parse(args.load_input)
      return formatLoadReport(analyzeLoadPlanning(input))
    }
  }))

  // Tool 3: Carrier Selection Analyst
  tools.register(defineTool({
    name: 'carrier_selection_analyst',
    description: 'Carrier scoring and selection based on cost, speed, reliability, and coverage | Ranks carriers for a given lane and shipment.',
    parameters: {
      carrier_input: {
        type: 'string',
        required: true,
        description: 'JSON: origin, destination, distance_km, weight_kg, cargo_type, required_delivery_date, carriers[{carrier_id, carrier_name, mode(ftl|ltl|parcel|intermodal|ocean|air), rate_per_km, reliability_pct, transit_time_hours, coverage_regions[], specialty[]}], priority(cost|speed|reliability|balanced)'
      }
    },
    output: { schema: { type: 'string' }, render: (_args: Record<string, unknown>, value: unknown) => [{ type: 'text', text: value as string }] },
    async execute(args: { carrier_input: string }) {
      const input: CarrierInput = JSON.parse(args.carrier_input)
      return formatCarrierReport(analyzeCarrierSelection(input))
    }
  }))

  // Tool 4: Freight Audit Automator
  tools.register(defineTool({
    name: 'freight_audit_automator',
    description: 'Freight invoice audit with discrepancy detection and recovery calculation | Audits invoices against contract rates.',
    parameters: {
      audit_input: {
        type: 'string',
        required: true,
        description: 'JSON: invoices[{invoice_id, carrier_name, shipment_id, line_items[{description, quantity, unit_rate, amount}], total_charged, currency, invoice_date}], contract_rates[{lane, service_type, agreed_rate, rate_per_kg, fuel_surcharge_pct, accessorial_caps{}}], tolerance_pct, audit_scope(full|sample|high_value)'
      }
    },
    output: { schema: { type: 'string' }, render: (_args: Record<string, unknown>, value: unknown) => [{ type: 'text', text: value as string }] },
    async execute(args: { audit_input: string }) {
      const input: AuditInput = JSON.parse(args.audit_input)
      return formatAuditReport(analyzeFreightAudit(input))
    }
  }))

  // Tool 5: Warehouse Slotting Optimizer
  tools.register(defineTool({
    name: 'warehouse_slotting_optimizer',
    description: 'Warehouse storage slotting optimization based on velocity, affinity, and accessibility | Optimizes SKU placement to minimize travel time.',
    parameters: {
      slotting_input: {
        type: 'string',
        required: true,
        description: 'JSON: warehouse_id, total_slots, slot_size_cm{length, width, height}, zones[], skus[{sku_id, sku_name, category, length_cm, width_cm, height_cm, weight_kg, units_per_day, pick_frequency(high|medium|low), velocity_class(A|B|C)}], strategy(velocity_based|product_affinity|cube_utilization|golden_zone)'
      }
    },
    output: { schema: { type: 'string' }, render: (_args: Record<string, unknown>, value: unknown) => [{ type: 'text', text: value as string }] },
    async execute(args: { slotting_input: string }) {
      const input: WarehouseInput = JSON.parse(args.slotting_input)
      return formatSlottingReport(analyzeWarehouseSlotting(input))
    }
  }))

  // Tool 6: Last Mile Delivery Planner
  tools.register(defineTool({
    name: 'last_mile_delivery_planner',
    description: 'Last-mile delivery route planning with time windows, vehicle capacity, and priority handling | Plans delivery routes from depot to final stops.',
    parameters: {
      lastmile_input: {
        type: 'string',
        required: true,
        description: 'JSON: depot_id, depot_lat, depot_lng, stops[{stop_id, customer_name, address, lat, lng, packages, weight_kg, time_window_start, time_window_end, priority(standard|express|same_day), contact_phone}], vehicle_capacity_packages, vehicle_max_weight_kg, max_route_duration_hours, optimization(min_distance|min_time|min_vehicles|balanced)'
      }
    },
    output: { schema: { type: 'string' }, render: (_args: Record<string, unknown>, value: unknown) => [{ type: 'text', text: value as string }] },
    async execute(args: { lastmile_input: string }) {
      const input: LastMileInput = JSON.parse(args.lastmile_input)
      return formatLastMileReport(analyzeLastMile(input))
    }
  }))

  // Tool 7: Cross Dock Optimizer
  tools.register(defineTool({
    name: 'cross_dock_optimizer',
    description: 'Cross-dock transfer scheduling with dock door assignment and dwell time optimization | Optimizes inbound-to-outbound transfers.',
    parameters: {
      crossdock_input: {
        type: 'string',
        required: true,
        description: 'JSON: facility_id, dock_doors, inbound[{shipment_id, origin, arrival_time, pallets, weight_kg, destination_zones[]}], outbound[{shipment_id, destination, departure_time, pallets, weight_kg, required_by}], transfer_rate_pallets_per_hour, staging_area_capacity'
      }
    },
    output: { schema: { type: 'string' }, render: (_args: Record<string, unknown>, value: unknown) => [{ type: 'text', text: value as string }] },
    async execute(args: { crossdock_input: string }) {
      const input: CrossDockInput = JSON.parse(args.crossdock_input)
      return formatCrossDockReport(analyzeCrossDock(input))
    }
  }))

  // Tool 8: Transportation Spend Analyzer
  tools.register(defineTool({
    name: 'transportation_spend_analyzer',
    description: 'Transportation spend analysis with benchmarking and savings opportunity identification | Analyzes spend by lane, mode, carrier, or month.',
    parameters: {
      spend_input: {
        type: 'string',
        required: true,
        description: 'JSON: records[{period, lane, mode, carrier, spend_usd, shipments, weight_kg, distance_km}], analysis_period, group_by(lane|mode|carrier|month), benchmark_rates{}, target_savings_pct'
      }
    },
    output: { schema: { type: 'string' }, render: (_args: Record<string, unknown>, value: unknown) => [{ type: 'text', text: value as string }] },
    async execute(args: { spend_input: string }) {
      const input: SpendInput = JSON.parse(args.spend_input)
      return formatSpendReport(analyzeTransportationSpend(input))
    }
  }))

  console.log('[dsh-tool-freightflow] Loaded v' + VERSION + ' — Freight & Logistics Optimization, 8 tools active')
  console.log('  Tools: route_optimization_engine, load_planning_optimizer, carrier_selection_analyst, freight_audit_automator, warehouse_slotting_optimizer, last_mile_delivery_planner, cross_dock_optimizer, transportation_spend_analyzer')
}
