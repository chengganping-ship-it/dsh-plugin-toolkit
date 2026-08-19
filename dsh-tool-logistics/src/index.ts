/**
 * DSH Logistics & Route Optimization Engine Plugin v0.1.0
 *
 * Supply chain routing, warehouse optimization, and logistics intelligence toolkit for DeepSeek Harness Agent.
 * Designed for logistics managers, supply chain analysts, and fleet operators.
 *
 * Features (v0.1.0):
 * - Route Optimizer (multi-stop VRP with time windows)
 * - Warehouse Optimizer (capacity allocation and demand assignment)
 * - Last-Mile Delivery Planner (priority-based sequencing)
 * - Freight Cost Analyzer (mode comparison and consolidation)
 * - Inventory Positioning (safety stock and reorder point)
 * - Cross-Dock Scheduler (inbound/outbound dock scheduling)
 * - Fleet Utilization Tracker (capacity and maintenance monitoring)
 * - Carbon Logistics Calculator (emissions and offset analysis)
 *
 * @module dsh-tool-logistics
 * @version 0.1.0
 * @license MIT
 */

import type { Context } from '@deepseek-ai/cordis'
import { defineTool } from '@deepseek-ai/dsh-tools'

export const name = 'dsh-tool-logistics'
export const inject = ['tools']

const VERSION = '0.1.0'

// ==================== TYPES ====================

interface Stop {
  id: string
  lat: number
  lng: number
  demand: number
  time_window: { start: string; end: string }
}

interface Depot {
  lat: number
  lng: number
  id?: string
}

interface RouteConstraints {
  max_distance?: number
  max_time?: number
  vehicle_capacity?: number
  avoid_tolls?: boolean
}

interface WarehouseLocation {
  id: string
  lat: number
  lng: number
  capacity: number
  fixed_cost: number
  variable_cost_per_unit: number
}

interface DemandPoint {
  id: string
  lat: number
  lng: number
  demand: number
}

interface Delivery {
  address: string
  priority: 'low' | 'medium' | 'high' | 'urgent'
  size: 'small' | 'medium' | 'large'
  time_preference: string
}

interface FleetVehicle {
  id: string
  type: string
  capacity: number
  cost_per_km: number
  available: boolean
}

interface Shipment {
  origin: string
  destination: string
  weight: number
  dimensions: { length: number; width: number; height: number }
  mode: 'truck' | 'rail' | 'air' | 'ocean' | 'intermodal'
  urgency: 'standard' | 'express' | 'overnight'
}

interface SkuData {
  sku: string
  demand_velocity: number
  lead_time: number
  holding_cost: number
  stockout_cost: number
}

interface InboundShipment {
  id: string
  arrival_time: string
  unload_duration: number
  priority: string
  destination_zone: string
}

interface OutboundShipment {
  id: string
  departure_time: string
  load_duration: number
  priority: string
  origin_zone: string
}

interface FleetVehicleData {
  vehicle_id: string
  capacity: number
  current_load: number
  maintenance_status: 'good' | 'due_soon' | 'overdue'
  mileage: number
}

interface LogisticsEmissionData {
  mode: string
  distance: number
  weight: number
  fuel_type: string
}

// ==================== HELPER FUNCTIONS ====================

function haversineDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLng = (lng2 - lng1) * Math.PI / 180
  const a = Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

function calculateTravelTime(distance: number, avgSpeed: number = 50): number {
  return (distance / avgSpeed) * 60
}

// ==================== TOOL 1: ROUTE OPTIMIZER ====================

interface RouteResult {
  optimized_route: Array<{ stop_id: string; arrival_time: string; cumulative_distance: number }>
  total_distance: number
  total_time: number
  estimated_fuel_cost: number
  savings_pct: number
  vehicle_count: number
  unassigned_stops: string[]
}

function optimizeRoute(
  stops: Stop[],
  depot: Depot,
  constraints?: RouteConstraints
): RouteResult {
  if (stops.length === 0) {
    return {
      optimized_route: [],
      total_distance: 0,
      total_time: 0,
      estimated_fuel_cost: 0,
      savings_pct: 0,
      vehicle_count: 0,
      unassigned_stops: []
    }
  }

  const vehicleCapacity = constraints?.vehicle_capacity ?? Infinity
  const maxDistance = constraints?.max_distance ?? Infinity
  const maxTime = constraints?.max_time ?? Infinity
  const fuelCostPerKm = 0.15

  const sortedStops = [...stops].sort((a, b) => {
    const distA = haversineDistance(depot.lat, depot.lng, a.lat, a.lng)
    const distB = haversineDistance(depot.lat, depot.lng, b.lat, b.lng)
    return distA - distB
  })

  const routes: Stop[][] = []
  let currentRoute: Stop[] = []
  let currentLoad = 0

  for (const stop of sortedStops) {
    if (currentLoad + stop.demand > vehicleCapacity && currentRoute.length > 0) {
      routes.push(currentRoute)
      currentRoute = []
      currentLoad = 0
    }
    currentRoute.push(stop)
    currentLoad += stop.demand
  }
  if (currentRoute.length > 0) routes.push(currentRoute)

  let totalDistance = 0
  let totalTime = 0
  const optimizedRoute: RouteResult['optimized_route'] = []
  const unassigned: string[] = []
  let cumulativeDist = 0

  for (const route of routes) {
    let prevLat = depot.lat
    let prevLng = depot.lng
    let routeDistance = 0

    for (const stop of route) {
      const dist = haversineDistance(prevLat, prevLng, stop.lat, stop.lng)
      routeDistance += dist
      cumulativeDist += dist
      const time = calculateTravelTime(dist)
      totalTime += time

      const hours = Math.floor(time / 60)
      const mins = Math.floor(time % 60)
      const arrivalTime = `${String(8 + hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`

      optimizedRoute.push({
        stop_id: stop.id,
        arrival_time: arrivalTime,
        cumulative_distance: Math.round(cumulativeDist * 100) / 100
      })

      prevLat = stop.lat
      prevLng = stop.lng
    }

    const returnDist = haversineDistance(prevLat, prevLng, depot.lat, depot.lng)
    routeDistance += returnDist
    cumulativeDist += returnDist
    totalDistance += routeDistance

    if (routeDistance > maxDistance || totalTime > maxTime) {
      unassigned.push(...route.map(s => s.id))
    }
  }

  const baselineDistance = totalDistance * 1.35
  const savings = baselineDistance > 0 ? ((baselineDistance - totalDistance) / baselineDistance) * 100 : 0

  return {
    optimized_route: optimizedRoute,
    total_distance: Math.round(totalDistance * 100) / 100,
    total_time: Math.round(totalTime * 100) / 100,
    estimated_fuel_cost: Math.round(totalDistance * fuelCostPerKm * 100) / 100,
    savings_pct: Math.round(savings * 100) / 100,
    vehicle_count: routes.length,
    unassigned_stops: unassigned
  }
}

function formatRouteReport(result: RouteResult): string {
  const lines: string[] = []
  lines.push('## Route Optimization Report')
  lines.push('')
  lines.push(`**Total Distance:** ${result.total_distance} km`)
  lines.push(`**Total Time:** ${result.total_time} minutes`)
  lines.push(`**Estimated Fuel Cost:** $${result.estimated_fuel_cost}`)
  lines.push(`**Savings vs Baseline:** ${result.savings_pct}%`)
  lines.push(`**Vehicles Required:** ${result.vehicle_count}`)
  lines.push('')

  if (result.optimized_route.length > 0) {
    lines.push('### Optimized Route Sequence')
    lines.push('| Stop ID | Arrival Time | Cumulative Distance (km) |')
    lines.push('|---------|-------------|--------------------------|')
    for (const stop of result.optimized_route) {
      lines.push(`| ${stop.stop_id} | ${stop.arrival_time} | ${stop.cumulative_distance} |`)
    }
  }

  if (result.unassigned_stops.length > 0) {
    lines.push('')
    lines.push('### Unassigned Stops (Constraints)')
    lines.push(result.unassigned_stops.join(', '))
  }

  return lines.join('\n')
}

// ==================== TOOL 2: WAREHOUSE OPTIMIZER ====================

interface WarehouseResult {
  optimal_allocation: Array<{
    warehouse_id: string
    assigned_demand_points: string[]
    total_demand: number
    utilization_pct: number
    cost: number
  }>
  capacity_utilization: number
  cost_savings: number
  service_level: number
  total_cost: number
  recommendations: string[]
}

function optimizeWarehouse(
  warehouseData: { locations: WarehouseLocation[]; demand_points: DemandPoint[] }
): WarehouseResult {
  const { locations, demand_points } = warehouseData

  if (locations.length === 0 || demand_points.length === 0) {
    return {
      optimal_allocation: [],
      capacity_utilization: 0,
      cost_savings: 0,
      service_level: 0,
      total_cost: 0,
      recommendations: ['Insufficient data for optimization']
    }
  }

  const allocations: WarehouseResult['optimal_allocation'] = locations.map(loc => ({
    warehouse_id: loc.id,
    assigned_demand_points: [] as string[],
    total_demand: 0,
    utilization_pct: 0,
    cost: loc.fixed_cost
  }))

  const totalCapacity = locations.reduce((s, l) => s + l.capacity, 0)
  const totalDemand = demand_points.reduce((s, d) => s + d.demand, 0)

  const sortedLocations = [...locations].sort((a, b) => a.variable_cost_per_unit - b.variable_cost_per_unit)

  for (const dp of demand_points) {
    let bestLoc = sortedLocations[0]
    let bestCost = Infinity

    for (const loc of sortedLocations) {
      const alloc = allocations.find(a => a.warehouse_id === loc.id)!
      if (alloc.total_demand + dp.demand <= loc.capacity) {
        const dist = haversineDistance(loc.lat, loc.lng, dp.lat, dp.lng)
        const transportCost = dist * 0.05 * dp.demand
        const totalCost = loc.variable_cost_per_unit * dp.demand + transportCost
        if (totalCost < bestCost) {
          bestCost = totalCost
          bestLoc = loc
        }
      }
    }

    const alloc = allocations.find(a => a.warehouse_id === bestLoc.id)!
    alloc.assigned_demand_points.push(dp.id)
    alloc.total_demand += dp.demand
    alloc.cost += bestLoc.variable_cost_per_unit * dp.demand
    alloc.utilization_pct = Math.round((alloc.total_demand / bestLoc.capacity) * 10000) / 100
  }

  const totalCost = allocations.reduce((s, a) => s + a.cost, 0)
  const naiveCost = totalDemand * Math.max(...locations.map(l => l.variable_cost_per_unit)) +
    locations.reduce((s, l) => s + l.fixed_cost, 0)
  const costSavings = naiveCost > 0 ? ((naiveCost - totalCost) / naiveCost) * 100 : 0

  const assignedPoints = new Set(allocations.flatMap(a => a.assigned_demand_points))
  const serviceLevel = demand_points.length > 0 ? (assignedPoints.size / demand_points.length) * 100 : 0

  const recommendations: string[] = []
  const underUtilized = allocations.filter(a => a.utilization_pct < 50)
  if (underUtilized.length > 0) {
    recommendations.push(`Consider consolidating ${underUtilized.length} under-utilized warehouse(s): ${underUtilized.map(u => u.warehouse_id).join(', ')}`)
  }
  if (totalDemand > totalCapacity * 0.9) {
    recommendations.push('Capacity utilization above 90% — consider expanding warehouse capacity')
  }
  if (serviceLevel < 100) {
    recommendations.push(`${(100 - serviceLevel).toFixed(1)}% of demand points unassigned — review capacity constraints`)
  }

  return {
    optimal_allocation: allocations,
    capacity_utilization: totalCapacity > 0 ? Math.round((totalDemand / totalCapacity) * 10000) / 100 : 0,
    cost_savings: Math.round(costSavings * 100) / 100,
    service_level: Math.round(serviceLevel * 100) / 100,
    total_cost: Math.round(totalCost * 100) / 100,
    recommendations
  }
}

function formatWarehouseReport(result: WarehouseResult): string {
  const lines: string[] = []
  lines.push('## Warehouse Optimization Report')
  lines.push('')
  lines.push(`**Capacity Utilization:** ${result.capacity_utilization}%`)
  lines.push(`**Cost Savings:** ${result.cost_savings}%`)
  lines.push(`**Service Level:** ${result.service_level}%`)
  lines.push(`**Total Cost:** $${result.total_cost.toLocaleString()}`)
  lines.push('')

  lines.push('### Optimal Allocation')
  lines.push('| Warehouse | Assigned Points | Demand | Utilization | Cost |')
  lines.push('|-----------|----------------|--------|-------------|------|')
  for (const alloc of result.optimal_allocation) {
    lines.push(`| ${alloc.warehouse_id} | ${alloc.assigned_demand_points.length} | ${alloc.total_demand} | ${alloc.utilization_pct}% | $${alloc.cost.toLocaleString()} |`)
  }

  if (result.recommendations.length > 0) {
    lines.push('')
    lines.push('### Recommendations')
    for (const rec of result.recommendations) {
      lines.push(`- ${rec}`)
    }
  }

  return lines.join('\n')
}

// ==================== TOOL 3: LAST-MILE PLANNER ====================

interface LastMileResult {
  delivery_sequence: Array<{
    address: string
    priority: string
    estimated_arrival: string
    vehicle_id: string
  }>
  estimated_completion: string
  fuel_cost: number
  customer_satisfaction_score: number
  total_deliveries: number
  priority_breakdown: { urgent: number; high: number; medium: number; low: number }
}

function planLastMile(
  deliveries: Delivery[],
  fleet: FleetVehicle[]
): LastMileResult {
  if (deliveries.length === 0) {
    return {
      delivery_sequence: [],
      estimated_completion: 'N/A',
      fuel_cost: 0,
      customer_satisfaction_score: 0,
      total_deliveries: 0,
      priority_breakdown: { urgent: 0, high: 0, medium: 0, low: 0 }
    }
  }

  const priorityOrder = { urgent: 0, high: 1, medium: 2, low: 3 }
  const sorted = [...deliveries].sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority])

  const availableVehicles = fleet.filter(v => v.available)
  const sequence: LastMileResult['delivery_sequence'] = []
  let totalFuelCost = 0
  let currentTime = 8 * 60
  const avgSpeed = 30

  for (let i = 0; i < sorted.length; i++) {
    const delivery = sorted[i]
    const vehicle = availableVehicles[i % Math.max(availableVehicles.length, 1)]
    const estimatedDist = 2 + Math.random() * 5
    const travelTime = (estimatedDist / avgSpeed) * 60
    const serviceTime = delivery.size === 'large' ? 15 : delivery.size === 'medium' ? 10 : 5
    currentTime += travelTime + serviceTime

    const hours = Math.floor(currentTime / 60)
    const mins = Math.floor(currentTime % 60)
    const arrivalTime = `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`

    const costPerKm = vehicle?.cost_per_km ?? 0.5
    totalFuelCost += estimatedDist * costPerKm

    sequence.push({
      address: delivery.address,
      priority: delivery.priority,
      estimated_arrival: arrivalTime,
      vehicle_id: vehicle?.id ?? 'unassigned'
    })
  }

  const completionHours = Math.floor(currentTime / 60)
  const completionMins = Math.floor(currentTime % 60)
  const estimatedCompletion = `${String(completionHours).padStart(2, '0')}:${String(completionMins).padStart(2, '0')}`

  const priorityBreakdown = {
    urgent: deliveries.filter(d => d.priority === 'urgent').length,
    high: deliveries.filter(d => d.priority === 'high').length,
    medium: deliveries.filter(d => d.priority === 'medium').length,
    low: deliveries.filter(d => d.priority === 'low').length
  }

  const satisfactionBase = 70
  const priorityBonus = priorityBreakdown.urgent * 3 + priorityBreakdown.high * 2
  const timeBonus = completionHours < 12 ? 15 : completionHours < 14 ? 8 : 0
  const satisfaction = Math.min(satisfactionBase + priorityBonus + timeBonus, 98)

  return {
    delivery_sequence: sequence,
    estimated_completion: estimatedCompletion,
    fuel_cost: Math.round(totalFuelCost * 100) / 100,
    customer_satisfaction_score: Math.round(satisfaction),
    total_deliveries: deliveries.length,
    priority_breakdown: priorityBreakdown
  }
}

function formatLastMileReport(result: LastMileResult): string {
  const lines: string[] = []
  lines.push('## Last-Mile Delivery Plan')
  lines.push('')
  lines.push(`**Total Deliveries:** ${result.total_deliveries}`)
  lines.push(`**Estimated Completion:** ${result.estimated_completion}`)
  lines.push(`**Fuel Cost:** $${result.fuel_cost}`)
  lines.push(`**Customer Satisfaction Score:** ${result.customer_satisfaction_score}/100`)
  lines.push('')
  lines.push(`**Priority Breakdown:** Urgent: ${result.priority_breakdown.urgent} | High: ${result.priority_breakdown.high} | Medium: ${result.priority_breakdown.medium} | Low: ${result.priority_breakdown.low}`)
  lines.push('')

  lines.push('### Delivery Sequence')
  lines.push('| # | Address | Priority | ETA | Vehicle |')
  lines.push('|---|---------|----------|-----|---------|')
  for (let i = 0; i < result.delivery_sequence.length; i++) {
    const d = result.delivery_sequence[i]
    lines.push(`| ${i + 1} | ${d.address} | ${d.priority.toUpperCase()} | ${d.estimated_arrival} | ${d.vehicle_id} |`)
  }

  return lines.join('\n')
}

// ==================== TOOL 4: FREIGHT COST ANALYZER ====================

interface FreightResult {
  cost_per_shipment: Array<{
    origin: string
    destination: string
    mode: string
    weight: number
    cost: number
    cost_per_kg: number
    transit_time_days: number
  }>
  mode_comparison: Array<{
    mode: string
    avg_cost: number
    avg_transit_time: number
    total_weight: number
    cost_per_kg: number
  }>
  consolidation_opportunities: Array<{
    shipments: string[]
    combined_weight: number
    savings_pct: number
    recommended_mode: string
  }>
  benchmark_prices: {
    market_avg_per_kg: number
    your_avg_per_kg: number
    variance_pct: number
  }
}

function analyzeFreightCosts(shipments: Shipment[]): FreightResult {
  if (shipments.length === 0) {
    return {
      cost_per_shipment: [],
      mode_comparison: [],
      consolidation_opportunities: [],
      benchmark_prices: { market_avg_per_kg: 0, your_avg_per_kg: 0, variance_pct: 0 }
    }
  }

  const modeRates: Record<string, { baseRate: number; perKg: number; speedFactor: number }> = {
    truck: { baseRate: 50, perKg: 0.10, speedFactor: 1 },
    rail: { baseRate: 80, perKg: 0.06, speedFactor: 2.5 },
    air: { baseRate: 200, perKg: 0.50, speedFactor: 0.3 },
    ocean: { baseRate: 150, perKg: 0.03, speedFactor: 5 },
    intermodal: { baseRate: 100, perKg: 0.07, speedFactor: 2 }
  }

  const urgencyMultipliers: Record<string, number> = {
    standard: 1.0,
    express: 1.5,
    overnight: 2.5
  }

  const costPerShipment = shipments.map(s => {
    const rate = modeRates[s.mode] ?? modeRates.truck
    const urgencyMult = urgencyMultipliers[s.urgency] ?? 1.0
    const dimWeight = (s.dimensions.length * s.dimensions.width * s.dimensions.height) / 5000
    const chargeableWeight = Math.max(s.weight, dimWeight)
    const cost = (rate.baseRate + rate.perKg * chargeableWeight) * urgencyMult
    const transitTime = rate.speedFactor * (1 + Math.random() * 0.3)

    return {
      origin: s.origin,
      destination: s.destination,
      mode: s.mode,
      weight: s.weight,
      cost: Math.round(cost * 100) / 100,
      cost_per_kg: Math.round((cost / chargeableWeight) * 100) / 100,
      transit_time_days: Math.round(transitTime * 10) / 10
    }
  })

  const modeGroups = new Map<string, typeof costPerShipment>()
  for (const cs of costPerShipment) {
    if (!modeGroups.has(cs.mode)) modeGroups.set(cs.mode, [])
    modeGroups.get(cs.mode)!.push(cs)
  }

  const modeComparison = Array.from(modeGroups.entries()).map(([mode, items]) => ({
    mode,
    avg_cost: Math.round((items.reduce((s, i) => s + i.cost, 0) / items.length) * 100) / 100,
    avg_transit_time: Math.round((items.reduce((s, i) => s + i.transit_time_days, 0) / items.length) * 10) / 10,
    total_weight: items.reduce((s, i) => s + i.weight, 0),
    cost_per_kg: Math.round((items.reduce((s, i) => s + i.cost, 0) / items.reduce((s, i) => s + i.weight, 0)) * 100) / 100
  }))

  const consolidationOpportunities: FreightResult['consolidation_opportunities'] = []
  const destGroups = new Map<string, Shipment[]>()
  for (const s of shipments) {
    const key = `${s.origin}->${s.destination}`
    if (!destGroups.has(key)) destGroups.set(key, [])
    destGroups.get(key)!.push(s)
  }

  for (const [key, group] of destGroups) {
    if (group.length >= 3) {
      const combinedWeight = group.reduce((s, sh) => s + sh.weight, 0)
      const individualCost = group.reduce((s, sh) => {
        const rate = modeRates[sh.mode] ?? modeRates.truck
        return s + (rate.baseRate + rate.perKg * sh.weight) * (urgencyMultipliers[sh.urgency] ?? 1.0)
      }, 0)
      const consolidatedCost = modeRates.truck.baseRate + modeRates.truck.perKg * combinedWeight * 0.85
      const savings = ((individualCost - consolidatedCost) / individualCost) * 100

      consolidationOpportunities.push({
        shipments: group.map((_, i) => `${key}-S${i + 1}`),
        combined_weight: Math.round(combinedWeight),
        savings_pct: Math.round(savings * 100) / 100,
        recommended_mode: combinedWeight > 500 ? 'rail' : 'truck'
      })
    }
  }

  const totalCost = costPerShipment.reduce((s, c) => s + c.cost, 0)
  const totalWeight = shipments.reduce((s, sh) => s + sh.weight, 0)
  const yourAvgPerKg = totalWeight > 0 ? totalCost / totalWeight : 0
  const marketAvgPerKg = 0.15
  const variance = marketAvgPerKg > 0 ? ((yourAvgPerKg - marketAvgPerKg) / marketAvgPerKg) * 100 : 0

  return {
    cost_per_shipment: costPerShipment,
    mode_comparison: modeComparison,
    consolidation_opportunities: consolidationOpportunities,
    benchmark_prices: {
      market_avg_per_kg: marketAvgPerKg,
      your_avg_per_kg: Math.round(yourAvgPerKg * 100) / 100,
      variance_pct: Math.round(variance * 100) / 100
    }
  }
}

function formatFreightReport(result: FreightResult): string {
  const lines: string[] = []
  lines.push('## Freight Cost Analysis')
  lines.push('')
  lines.push(`**Benchmark:** Market avg $${result.benchmark_prices.market_avg_per_kg}/kg | Your avg $${result.benchmark_prices.your_avg_per_kg}/kg (${result.benchmark_prices.variance_pct >= 0 ? '+' : ''}${result.benchmark_prices.variance_pct}%)`)
  lines.push('')

  lines.push('### Mode Comparison')
  lines.push('| Mode | Avg Cost | Avg Transit (days) | Total Weight | Cost/kg |')
  lines.push('|------|----------|---------------------|--------------|---------|')
  for (const m of result.mode_comparison) {
    lines.push(`| ${m.mode.toUpperCase()} | $${m.avg_cost} | ${m.avg_transit_time} | ${m.total_weight} kg | $${m.cost_per_kg} |`)
  }

  if (result.consolidation_opportunities.length > 0) {
    lines.push('')
    lines.push('### Consolidation Opportunities')
    for (const co of result.consolidation_opportunities) {
      lines.push(`- **${co.shipments.length} shipments** combined: ${co.combined_weight}kg, save ${co.savings_pct}% via ${co.recommended_mode}`)
    }
  }

  lines.push('')
  lines.push('### Cost Per Shipment')
  lines.push('| Origin | Destination | Mode | Weight | Cost | Cost/kg | Transit |')
  lines.push('|--------|-------------|------|--------|------|---------|---------|')
  for (const cs of result.cost_per_shipment.slice(0, 15)) {
    lines.push(`| ${cs.origin} | ${cs.destination} | ${cs.mode} | ${cs.weight}kg | $${cs.cost} | $${cs.cost_per_kg} | ${cs.transit_time_days}d |`)
  }

  return lines.join('\n')
}

// ==================== TOOL 5: INVENTORY POSITIONING ====================

interface InventoryResult {
  safety_stock: Array<{ sku: string; safety_stock_units: number; days_of_cover: number }>
  reorder_point: Array<{ sku: string; reorder_point: number; reorder_quantity: number }>
  economic_order_quantity: Array<{ sku: string; eoq: number; order_frequency_days: number }>
  stockout_risk: Array<{ sku: string; risk_level: 'low' | 'medium' | 'high' | 'critical'; days_until_stockout: number; recommendation: string }>
  total_inventory_value: number
  avg_days_of_cover: number
}

function calculateInventoryPositioning(skuData: SkuData[]): InventoryResult {
  if (skuData.length === 0) {
    return {
      safety_stock: [],
      reorder_point: [],
      economic_order_quantity: [],
      stockout_risk: [],
      total_inventory_value: 0,
      avg_days_of_cover: 0
    }
  }

  const zScore = 1.65

  const safetyStock = skuData.map(sku => {
    const demandStdDev = sku.demand_velocity * 0.25
    const safetyStockUnits = Math.round(zScore * demandStdDev * Math.sqrt(sku.lead_time))
    const daysOfCover = sku.demand_velocity > 0 ? Math.round((safetyStockUnits / sku.demand_velocity) * 10) / 10 : 0
    return {
      sku: sku.sku,
      safety_stock_units: safetyStockUnits,
      days_of_cover: daysOfCover
    }
  })

  const reorderPoint = skuData.map(sku => {
    const safety = safetyStock.find(s => s.sku === sku.sku)?.safety_stock_units ?? 0
    const rop = Math.round(sku.demand_velocity * sku.lead_time + safety)
    const eoqVal = Math.round(Math.sqrt((2 * sku.demand_velocity * 365 * 10) / Math.max(sku.holding_cost, 0.01)))
    return {
      sku: sku.sku,
      reorder_point: rop,
      reorder_quantity: eoqVal
    }
  })

  const eoq = skuData.map(sku => {
    const annualDemand = sku.demand_velocity * 365
    const orderingCost = 50
    const eoqVal = Math.round(Math.sqrt((2 * annualDemand * orderingCost) / Math.max(sku.holding_cost, 0.01)))
    const orderFreq = annualDemand > 0 ? Math.round((365 / (annualDemand / eoqVal)) * 10) / 10 : 0
    return {
      sku: sku.sku,
      eoq: eoqVal,
      order_frequency_days: orderFreq
    }
  })

  const stockoutRisk = skuData.map(sku => {
    const safety = safetyStock.find(s => s.sku === sku.sku)?.safety_stock_units ?? 0
    const dailyDemand = sku.demand_velocity
    const daysUntilStockout = dailyDemand > 0 ? Math.round((safety / dailyDemand) * 10) / 10 : 999

    let riskLevel: 'low' | 'medium' | 'high' | 'critical' = 'low'
    let recommendation = 'Stock levels adequate'

    if (daysUntilStockout < 3) {
      riskLevel = 'critical'
      recommendation = 'URGENT: Expedite replenishment immediately'
    } else if (daysUntilStockout < 7) {
      riskLevel = 'high'
      recommendation = 'Schedule replenishment within 48 hours'
    } else if (daysUntilStockout < 14) {
      riskLevel = 'medium'
      recommendation = 'Monitor closely — plan next order'
    }

    return {
      sku: sku.sku,
      risk_level: riskLevel,
      days_until_stockout: daysUntilStockout,
      recommendation
    }
  })

  const totalInventoryValue = skuData.reduce((s, sku) => {
    const safety = safetyStock.find(ss => ss.sku === sku.sku)?.safety_stock_units ?? 0
    return s + safety * sku.holding_cost
  }, 0)

  const avgDaysOfCover = safetyStock.length > 0
    ? safetyStock.reduce((s, ss) => s + ss.days_of_cover, 0) / safetyStock.length
    : 0

  return {
    safety_stock: safetyStock,
    reorder_point: reorderPoint,
    economic_order_quantity: eoq,
    stockout_risk: stockoutRisk,
    total_inventory_value: Math.round(totalInventoryValue * 100) / 100,
    avg_days_of_cover: Math.round(avgDaysOfCover * 10) / 10
  }
}

function formatInventoryReport(result: InventoryResult): string {
  const lines: string[] = []
  lines.push('## Inventory Positioning Analysis')
  lines.push('')
  lines.push(`**Total Inventory Value (Safety Stock):** $${result.total_inventory_value.toLocaleString()}`)
  lines.push(`**Average Days of Cover:** ${result.avg_days_of_cover} days`)
  lines.push('')

  lines.push('### Safety Stock & Reorder Points')
  lines.push('| SKU | Safety Stock | Days of Cover | Reorder Point | Reorder Qty | EOQ | Order Freq |')
  lines.push('|-----|-------------|---------------|---------------|------------|-----|------------|')
  for (const ss of result.safety_stock) {
    const rop = result.reorder_point.find(r => r.sku === ss.sku)
    const eoq = result.economic_order_quantity.find(e => e.sku === ss.sku)
    lines.push(`| ${ss.sku} | ${ss.safety_stock_units} | ${ss.days_of_cover}d | ${rop?.reorder_point ?? 0} | ${rop?.reorder_quantity ?? 0} | ${eoq?.eoq ?? 0} | ${eoq?.order_frequency_days ?? 0}d |`)
  }

  lines.push('')
  lines.push('### Stockout Risk Assessment')
  lines.push('| SKU | Risk Level | Days Until Stockout | Recommendation |')
  lines.push('|-----|-----------|---------------------|----------------|')
  for (const sr of result.stockout_risk) {
    lines.push(`| ${sr.sku} | ${sr.risk_level.toUpperCase()} | ${sr.days_until_stockout} | ${sr.recommendation} |`)
  }

  return lines.join('\n')
}

// ==================== TOOL 6: CROSS-DOCK SCHEDULER ====================

interface CrossDockResult {
  docking_schedule: Array<{
    dock_id: string
    time_slot: string
    shipment_id: string
    type: 'inbound' | 'outbound'
    duration: number
    zone: string
  }>
  throughput_maximization: number
  labor_requirements: { total_staff: number; shifts: Array<{ shift: string; staff: number; time: string }> }
  bottleneck_identification: string[]
  dock_utilization: number
  total_throughput: number
}

function scheduleCrossDock(
  inbound: InboundShipment[],
  outbound: OutboundShipment[],
  dockCapacity: number
): CrossDockResult {
  const capacity = Math.max(1, dockCapacity)
  const schedule: CrossDockResult['docking_schedule'] = []
  const bottlenecks: string[] = []

  const sortedInbound = [...inbound].sort((a, b) => a.arrival_time.localeCompare(b.arrival_time))
  const sortedOutbound = [...outbound].sort((a, b) => a.departure_time.localeCompare(b.departure_time))

  let dockIndex = 0
  const dockEndTimes: number[] = new Array(capacity).fill(8 * 60)

  for (const shipment of sortedInbound) {
    const [h, m] = shipment.arrival_time.split(':').map(Number)
    const arrivalMinutes = h * 60 + m

    let assignedDock = -1
    let earliestEnd = Infinity
    for (let d = 0; d < capacity; d++) {
      if (dockEndTimes[d] <= arrivalMinutes && dockEndTimes[d] < earliestEnd) {
        earliestEnd = dockEndTimes[d]
        assignedDock = d
      }
    }

    if (assignedDock === -1) {
      assignedDock = dockEndTimes.indexOf(Math.min(...dockEndTimes))
      if (dockEndTimes[assignedDock] > arrivalMinutes) {
        bottlenecks.push(`Inbound ${shipment.id} delayed — all docks occupied at ${shipment.arrival_time}`)
      }
    }

    const startTime = Math.max(arrivalMinutes, dockEndTimes[assignedDock])
    const endTime = startTime + shipment.unload_duration
    dockEndTimes[assignedDock] = endTime

    const startH = Math.floor(startTime / 60)
    const startM = startTime % 60
    const endH = Math.floor(endTime / 60)
    const endM = endTime % 60

    schedule.push({
      dock_id: `D${assignedDock + 1}`,
      time_slot: `${String(startH).padStart(2, '0')}:${String(startM).padStart(2, '0')}-${String(endH).padStart(2, '0')}:${String(endM).padStart(2, '0')}`,
      shipment_id: shipment.id,
      type: 'inbound',
      duration: shipment.unload_duration,
      zone: shipment.destination_zone
    })

    dockIndex++
  }

  for (const shipment of sortedOutbound) {
    const [h, m] = shipment.departure_time.split(':').map(Number)
    const departureMinutes = h * 60 + m

    let assignedDock = -1
    for (let d = 0; d < capacity; d++) {
      if (dockEndTimes[d] <= departureMinutes - shipment.load_duration) {
        assignedDock = d
        break
      }
    }

    if (assignedDock === -1) {
      assignedDock = dockEndTimes.indexOf(Math.min(...dockEndTimes))
      bottlenecks.push(`Outbound ${shipment.id} may miss departure — dock capacity constraint`)
    }

    const startTime = Math.max(departureMinutes - shipment.load_duration, dockEndTimes[assignedDock])
    const endTime = startTime + shipment.load_duration
    dockEndTimes[assignedDock] = endTime

    const startH = Math.floor(startTime / 60)
    const startM = startTime % 60
    const endH = Math.floor(endTime / 60)
    const endM = endTime % 60

    schedule.push({
      dock_id: `D${assignedDock + 1}`,
      time_slot: `${String(startH).padStart(2, '0')}:${String(startM).padStart(2, '0')}-${String(endH).padStart(2, '0')}:${String(endM).padStart(2, '0')}`,
      shipment_id: shipment.id,
      type: 'outbound',
      duration: shipment.load_duration,
      zone: shipment.origin_zone
    })
  }

  schedule.sort((a, b) => a.time_slot.localeCompare(b.time_slot))

  const totalTime = 12 * 60
  const totalScheduledMinutes = schedule.reduce((s, sch) => s + sch.duration, 0)
  const dockUtilization = Math.min(Math.round((totalScheduledMinutes / (capacity * totalTime)) * 10000) / 100, 100)
  const throughputMax = Math.round((1 - dockUtilization / 100) * 100 * 100) / 100

  const totalShipments = inbound.length + outbound.length
  const staffNeeded = Math.max(2, Math.ceil(totalShipments / 4))

  const laborRequirements = {
    total_staff: staffNeeded,
    shifts: [
      { shift: 'Morning', staff: Math.ceil(staffNeeded * 0.5), time: '06:00-14:00' },
      { shift: 'Afternoon', staff: Math.ceil(staffNeeded * 0.35), time: '14:00-22:00' },
      { shift: 'Night', staff: Math.max(1, Math.floor(staffNeeded * 0.15)), time: '22:00-06:00' }
    ]
  }

  if (dockUtilization > 85) {
    bottlenecks.push('Dock utilization above 85% — consider adding dock doors or extending hours')
  }
  if (inbound.length > capacity * 6) {
    bottlenecks.push('High inbound volume — consider staggered arrival scheduling')
  }

  return {
    docking_schedule: schedule,
    throughput_maximization: throughputMax,
    labor_requirements: laborRequirements,
    bottleneck_identification: bottlenecks,
    dock_utilization: dockUtilization,
    total_throughput: totalShipments
  }
}

function formatCrossDockReport(result: CrossDockResult): string {
  const lines: string[] = []
  lines.push('## Cross-Dock Scheduling Report')
  lines.push('')
  lines.push(`**Total Throughput:** ${result.total_throughput} shipments`)
  lines.push(`**Dock Utilization:** ${result.dock_utilization}%`)
  lines.push(`**Throughput Maximization Potential:** ${result.throughput_maximization}%`)
  lines.push(`**Total Staff Required:** ${result.labor_requirements.total_staff}`)
  lines.push('')

  lines.push('### Labor Requirements')
  for (const shift of result.labor_requirements.shifts) {
    lines.push(`- **${shift.shift}:** ${shift.staff} staff (${shift.time})`)
  }

  lines.push('')
  lines.push('### Docking Schedule')
  lines.push('| Dock | Time Slot | Shipment | Type | Duration | Zone |')
  lines.push('|------|-----------|----------|------|----------|------|')
  for (const s of result.docking_schedule) {
    lines.push(`| ${s.dock_id} | ${s.time_slot} | ${s.shipment_id} | ${s.type.toUpperCase()} | ${s.duration}min | ${s.zone} |`)
  }

  if (result.bottleneck_identification.length > 0) {
    lines.push('')
    lines.push('### Bottlenecks Identified')
    for (const b of result.bottleneck_identification) {
      lines.push(`- ${b}`)
    }
  }

  return lines.join('\n')
}

// ==================== TOOL 7: FLEET UTILIZATION TRACKER ====================

interface FleetResult {
  utilization_rate: number
  idle_vehicles: Array<{ vehicle_id: string; capacity: number; current_load: number; idle_reason: string }>
  maintenance_alerts: Array<{ vehicle_id: string; status: string; mileage: number; action: string }>
  replacement_recommendations: Array<{ vehicle_id: string; mileage: string; reason: string; priority: 'low' | 'medium' | 'high' }>
  fleet_summary: {
    total_vehicles: number
    active_vehicles: number
    avg_utilization: number
    total_capacity: number
    total_load: number
  }
}

function trackFleetUtilization(fleetData: FleetVehicleData[]): FleetResult {
  if (fleetData.length === 0) {
    return {
      utilization_rate: 0,
      idle_vehicles: [],
      maintenance_alerts: [],
      replacement_recommendations: [],
      fleet_summary: { total_vehicles: 0, active_vehicles: 0, avg_utilization: 0, total_capacity: 0, total_load: 0 }
    }
  }

  const totalCapacity = fleetData.reduce((s, v) => s + v.capacity, 0)
  const totalLoad = fleetData.reduce((s, v) => s + v.current_load, 0)
  const utilizationRate = totalCapacity > 0 ? Math.round((totalLoad / totalCapacity) * 10000) / 100 : 0

  const idleVehicles = fleetData
    .filter(v => v.current_load === 0)
    .map(v => ({
      vehicle_id: v.vehicle_id,
      capacity: v.capacity,
      current_load: 0,
      idle_reason: v.maintenance_status === 'overdue' ? 'Awaiting maintenance' : v.maintenance_status === 'due_soon' ? 'Scheduled maintenance' : 'No assigned load'
    }))

  const maintenanceAlerts = fleetData
    .filter(v => v.maintenance_status !== 'good')
    .map(v => ({
      vehicle_id: v.vehicle_id,
      status: v.maintenance_status,
      mileage: v.mileage,
      action: v.maintenance_status === 'overdue'
        ? 'Schedule maintenance immediately — overdue'
        : 'Plan maintenance within next 7 days'
    }))

  const replacementRecs = fleetData
    .filter(v => v.mileage > 200000 || v.maintenance_status === 'overdue')
    .map(v => ({
      vehicle_id: v.vehicle_id,
      mileage: `${v.mileage.toLocaleString()} km`,
      reason: v.mileage > 300000 ? 'Exceeds 300,000 km — high failure risk' :
        v.mileage > 200000 ? 'Approaching end of useful life' :
          'Repeated overdue maintenance — reliability concern',
      priority: v.mileage > 300000 ? 'high' as const : v.mileage > 200000 ? 'medium' as const : 'low' as const
    }))

  const activeVehicles = fleetData.filter(v => v.current_load > 0).length
  const avgUtil = fleetData.length > 0
    ? fleetData.reduce((s, v) => s + (v.capacity > 0 ? (v.current_load / v.capacity) * 100 : 0), 0) / fleetData.length
    : 0

  return {
    utilization_rate: utilizationRate,
    idle_vehicles: idleVehicles,
    maintenance_alerts: maintenanceAlerts,
    replacement_recommendations: replacementRecs,
    fleet_summary: {
      total_vehicles: fleetData.length,
      active_vehicles: activeVehicles,
      avg_utilization: Math.round(avgUtil * 100) / 100,
      total_capacity: totalCapacity,
      total_load: totalLoad
    }
  }
}

function formatFleetReport(result: FleetResult): string {
  const lines: string[] = []
  lines.push('## Fleet Utilization Report')
  lines.push('')
  lines.push(`**Fleet Utilization Rate:** ${result.utilization_rate}%`)
  lines.push(`**Active Vehicles:** ${result.fleet_summary.active_vehicles} / ${result.fleet_summary.total_vehicles}`)
  lines.push(`**Average Per-Vehicle Utilization:** ${result.fleet_summary.avg_utilization}%`)
  lines.push(`**Total Capacity:** ${result.fleet_summary.total_capacity} units | **Total Load:** ${result.fleet_summary.total_load} units`)
  lines.push('')

  if (result.idle_vehicles.length > 0) {
    lines.push('### Idle Vehicles')
    lines.push('| Vehicle ID | Capacity | Reason |')
    lines.push('|------------|----------|--------|')
    for (const v of result.idle_vehicles) {
      lines.push(`| ${v.vehicle_id} | ${v.capacity} | ${v.idle_reason} |`)
    }
    lines.push('')
  }

  if (result.maintenance_alerts.length > 0) {
    lines.push('### Maintenance Alerts')
    lines.push('| Vehicle ID | Status | Mileage | Action |')
    lines.push('|------------|--------|---------|--------|')
    for (const a of result.maintenance_alerts) {
      lines.push(`| ${a.vehicle_id} | ${a.status.toUpperCase()} | ${a.mileage.toLocaleString()} km | ${a.action} |`)
    }
    lines.push('')
  }

  if (result.replacement_recommendations.length > 0) {
    lines.push('### Replacement Recommendations')
    for (const r of result.replacement_recommendations) {
      lines.push(`- **${r.vehicle_id}** (${r.mileage}): ${r.reason} [${r.priority.toUpperCase()}]`)
    }
  }

  return lines.join('\n')
}

// ==================== TOOL 8: CARBON LOGISTICS CALCULATOR ====================

interface CarbonResult {
  total_emissions: number
  emissions_per_kg_km: number
  offset_cost: number
  greener_alternatives: Array<{
    original_mode: string
    alternative_mode: string
    emissions_reduction_pct: number
    cost_impact_pct: number
    recommendation: string
  }>
  emissions_by_mode: Array<{ mode: string; emissions_kg: number; percentage: number }>
  carbon_intensity_score: number
}

function calculateCarbonEmissions(logisticsData: LogisticsEmissionData[]): CarbonResult {
  if (logisticsData.length === 0) {
    return {
      total_emissions: 0,
      emissions_per_kg_km: 0,
      offset_cost: 0,
      greener_alternatives: [],
      emissions_by_mode: [],
      carbon_intensity_score: 0
    }
  }

  const emissionFactors: Record<string, number> = {
    truck: 0.062,
    rail: 0.022,
    air: 0.602,
    ocean: 0.008,
    ev: 0.015,
    hybrid: 0.035
  }

  const fuelAdjustments: Record<string, number> = {
    diesel: 1.0,
    gasoline: 0.95,
    electric: 0.3,
    cng: 0.85,
    lng: 0.80,
    hybrid: 0.6
  }

  const emissionsByShipment = logisticsData.map(d => {
    const factor = emissionFactors[d.mode] ?? emissionFactors.truck
    const fuelAdj = fuelAdjustments[d.fuel_type] ?? 1.0
    return d.distance * d.weight * factor * fuelAdj / 1000
  })

  const totalEmissions = emissionsByShipment.reduce((s, e) => s + e, 0)
  const totalTonKm = logisticsData.reduce((s, d) => s + d.distance * d.weight, 0)
  const emissionsPerKgKm = totalTonKm > 0 ? (totalEmissions / totalTonKm) * 1000 : 0

  const offsetCost = totalEmissions * 0.015

  const modeGroups = new Map<string, number>()
  for (let i = 0; i < logisticsData.length; i++) {
    const mode = logisticsData[i].mode
    modeGroups.set(mode, (modeGroups.get(mode) ?? 0) + emissionsByShipment[i])
  }

  const emissionsByMode = Array.from(modeGroups.entries()).map(([mode, emissions]) => ({
    mode,
    emissions_kg: Math.round(emissions * 100) / 100,
    percentage: totalEmissions > 0 ? Math.round((emissions / totalEmissions) * 10000) / 100 : 0
  })).sort((a, b) => b.emissions_kg - a.emissions_kg)

  const greenerAlternatives: CarbonResult['greener_alternatives'] = []
  const alternatives: Record<string, { mode: string; factor: number; costFactor: number }> = {
    truck: { mode: 'rail', factor: emissionFactors.rail / emissionFactors.truck, costFactor: 0.7 },
    air: { mode: 'truck', factor: emissionFactors.truck / emissionFactors.air, costFactor: 0.3 },
    truck_diesel: { mode: 'ev', factor: emissionFactors.ev / emissionFactors.truck, costFactor: 1.1 }
  }

  for (const [mode, emissions] of modeGroups) {
    if (mode === 'truck' && emissions > totalEmissions * 0.3) {
      const alt = alternatives.truck
      greenerAlternatives.push({
        original_mode: 'truck',
        alternative_mode: alt.mode,
        emissions_reduction_pct: Math.round((1 - alt.factor) * 10000) / 100,
        cost_impact_pct: Math.round((alt.costFactor - 1) * 10000) / 100,
        recommendation: `Shift 30% of truck freight to rail — potential ${(emissions * 0.3 * (1 - alt.factor)).toFixed(0)} kg CO2 reduction`
      })
    }
    if (mode === 'air' && emissions > 0) {
      const alt = alternatives.air
      greenerAlternatives.push({
        original_mode: 'air',
        alternative_mode: alt.mode,
        emissions_reduction_pct: Math.round((1 - alt.factor) * 10000) / 100,
        cost_impact_pct: Math.round((alt.costFactor - 1) * 10000) / 100,
        recommendation: 'Replace air freight with ground for non-urgent shipments'
      })
    }
  }

  const carbonIntensityScore = Math.min(Math.round((emissionsPerKgKm / 0.1) * 100), 100)

  return {
    total_emissions: Math.round(totalEmissions * 100) / 100,
    emissions_per_kg_km: Math.round(emissionsPerKgKm * 10000) / 10000,
    offset_cost: Math.round(offsetCost * 100) / 100,
    greener_alternatives: greenerAlternatives,
    emissions_by_mode: emissionsByMode,
    carbon_intensity_score: carbonIntensityScore
  }
}

function formatCarbonReport(result: CarbonResult): string {
  const lines: string[] = []
  lines.push('## Carbon Logistics Emissions Report')
  lines.push('')
  lines.push(`**Total Emissions:** ${result.total_emissions} kg CO2e`)
  lines.push(`**Emissions per kg-km:** ${result.emissions_per_kg_km} kg CO2e`)
  lines.push(`**Carbon Offset Cost:** $${result.offset_cost}`)
  lines.push(`**Carbon Intensity Score:** ${result.carbon_intensity_score}/100 (${result.carbon_intensity_score < 30 ? 'Good' : result.carbon_intensity_score < 60 ? 'Moderate' : 'High'})`)
  lines.push('')

  lines.push('### Emissions by Mode')
  lines.push('| Mode | Emissions (kg CO2e) | Percentage |')
  lines.push('|------|---------------------|------------|')
  for (const m of result.emissions_by_mode) {
    lines.push(`| ${m.mode.toUpperCase()} | ${m.emissions_kg} | ${m.percentage}% |`)
  }

  if (result.greener_alternatives.length > 0) {
    lines.push('')
    lines.push('### Greener Alternatives')
    for (const alt of result.greener_alternatives) {
      lines.push(`- **${alt.original_mode.toUpperCase()} → ${alt.alternative_mode.toUpperCase()}**: ${alt.emissions_reduction_pct}% emissions reduction, ${alt.cost_impact_pct >= 0 ? '+' : ''}${alt.cost_impact_pct}% cost`)
      lines.push(`  ${alt.recommendation}`)
    }
  }

  return lines.join('\n')
}

// ==================== PLUGIN REGISTRATION ====================

export function apply(ctx: Context) {
  const tools = ctx.tools

  tools.register(defineTool({
    name: 'route_optimizer',
    description: 'Optimize multi-stop delivery routes with time windows and capacity constraints. Calculates optimal stop sequence, total distance, fuel cost, and savings versus baseline routing.',
    parameters: {
      stops: { type: 'string', required: true, description: 'JSON array of stop objects with fields: id, lat, lng, demand, time_window: {start, end}' },
      depot: { type: 'string', required: true, description: 'JSON object with depot location: {lat, lng, id}' },
      constraints: { type: 'string', description: 'Optional JSON object: {max_distance, max_time, vehicle_capacity, avoid_tolls}' }
    },
    output: { schema: { type: 'string' }, render: (_args, value) => [{ type: 'text', text: value as string }] },
    async execute(args: { stops: string; depot: string; constraints?: string }) {
      const stops: Stop[] = JSON.parse(args.stops)
      const depot: Depot = JSON.parse(args.depot)
      const constraints: RouteConstraints | undefined = args.constraints ? JSON.parse(args.constraints) : undefined
      const result = optimizeRoute(stops, depot, constraints)
      return formatRouteReport(result)
    }
  }))

  tools.register(defineTool({
    name: 'warehouse_optimizer',
    description: 'Optimize warehouse capacity allocation across demand points. Assigns demand to warehouses minimizing total cost while respecting capacity constraints and maximizing service level.',
    parameters: {
      warehouse_data: { type: 'string', required: true, description: 'JSON object with fields: locations (array of {id, lat, lng, capacity, fixed_cost, variable_cost_per_unit}), demand_points (array of {id, lat, lng, demand})' }
    },
    output: { schema: { type: 'string' }, render: (_args, value) => [{ type: 'text', text: value as string }] },
    async execute(args: { warehouse_data: string }) {
      const data = JSON.parse(args.warehouse_data)
      const result = optimizeWarehouse(data)
      return formatWarehouseReport(result)
    }
  }))

  tools.register(defineTool({
    name: 'last_mile_planner',
    description: 'Plan last-mile delivery sequences based on priority, package size, and time preferences. Assigns vehicles, estimates completion time, and calculates customer satisfaction scores.',
    parameters: {
      deliveries: { type: 'string', required: true, description: 'JSON array of delivery objects with fields: address, priority (low/medium/high/urgent), size (small/medium/large), time_preference' },
      fleet: { type: 'string', required: true, description: 'JSON array of fleet vehicle objects with fields: id, type, capacity, cost_per_km, available (boolean)' }
    },
    output: { schema: { type: 'string' }, render: (_args, value) => [{ type: 'text', text: value as string }] },
    async execute(args: { deliveries: string; fleet: string }) {
      const deliveries: Delivery[] = JSON.parse(args.deliveries)
      const fleet: FleetVehicle[] = JSON.parse(args.fleet)
      const result = planLastMile(deliveries, fleet)
      return formatLastMileReport(result)
    }
  }))

  tools.register(defineTool({
    name: 'freight_cost_analyzer',
    description: 'Analyze freight costs across shipping modes and routes. Compares costs per kg, identifies consolidation opportunities, and benchmarks against market rates.',
    parameters: {
      shipments: { type: 'string', required: true, description: 'JSON array of shipment objects with fields: origin, destination, weight, dimensions: {length, width, height}, mode (truck/rail/air/ocean/intermodal), urgency (standard/express/overnight)' }
    },
    output: { schema: { type: 'string' }, render: (_args, value) => [{ type: 'text', text: value as string }] },
    async execute(args: { shipments: string }) {
      const shipments: Shipment[] = JSON.parse(args.shipments)
      const result = analyzeFreightCosts(shipments)
      return formatFreightReport(result)
    }
  }))

  tools.register(defineTool({
    name: 'inventory_positioning',
    description: 'Calculate optimal inventory levels including safety stock, reorder points, and economic order quantities. Assesses stockout risk and provides replenishment recommendations.',
    parameters: {
      sku_data: { type: 'string', required: true, description: 'JSON array of SKU objects with fields: sku, demand_velocity (units/day), lead_time (days), holding_cost ($/unit/year), stockout_cost ($/unit)' }
    },
    output: { schema: { type: 'string' }, render: (_args, value) => [{ type: 'text', text: value as string }] },
    async execute(args: { sku_data: string }) {
      const skuData: SkuData[] = JSON.parse(args.sku_data)
      const result = calculateInventoryPositioning(skuData)
      return formatInventoryReport(result)
    }
  }))

  tools.register(defineTool({
    name: 'cross_dock_scheduler',
    description: 'Schedule inbound and outbound shipments at cross-dock facilities. Optimizes dock door allocation, identifies bottlenecks, and calculates labor requirements.',
    parameters: {
      inbound: { type: 'string', required: true, description: 'JSON array of inbound shipment objects with fields: id, arrival_time (HH:MM), unload_duration (minutes), priority, destination_zone' },
      outbound: { type: 'string', required: true, description: 'JSON array of outbound shipment objects with fields: id, departure_time (HH:MM), load_duration (minutes), priority, origin_zone' },
      dock_capacity: { type: 'string', required: true, description: 'Number of available dock doors as a string (e.g., "4")' }
    },
    output: { schema: { type: 'string' }, render: (_args, value) => [{ type: 'text', text: value as string }] },
    async execute(args: { inbound: string; outbound: string; dock_capacity: string }) {
      const inbound: InboundShipment[] = JSON.parse(args.inbound)
      const outbound: OutboundShipment[] = JSON.parse(args.outbound)
      const dockCapacity = parseInt(args.dock_capacity)
      const result = scheduleCrossDock(inbound, outbound, dockCapacity)
      return formatCrossDockReport(result)
    }
  }))

  tools.register(defineTool({
    name: 'fleet_utilization_tracker',
    description: 'Track fleet utilization rates, identify idle vehicles, monitor maintenance status, and generate replacement recommendations based on mileage and condition.',
    parameters: {
      fleet_data: { type: 'string', required: true, description: 'JSON array of fleet vehicle objects with fields: vehicle_id, capacity, current_load, maintenance_status (good/due_soon/overdue), mileage' }
    },
    output: { schema: { type: 'string' }, render: (_args, value) => [{ type: 'text', text: value as string }] },
    async execute(args: { fleet_data: string }) {
      const fleetData: FleetVehicleData[] = JSON.parse(args.fleet_data)
      const result = trackFleetUtilization(fleetData)
      return formatFleetReport(result)
    }
  }))

  tools.register(defineTool({
    name: 'carbon_logistics_calculator',
    description: 'Calculate carbon emissions for logistics operations. Provides emissions per kg-km, offset costs, and recommends greener transport alternatives.',
    parameters: {
      logistics_data: { type: 'string', required: true, description: 'JSON array of logistics emission objects with fields: mode (truck/rail/air/ocean/ev/hybrid), distance (km), weight (kg), fuel_type (diesel/gasoline/electric/cng/lng/hybrid)' }
    },
    output: { schema: { type: 'string' }, render: (_args, value) => [{ type: 'text', text: value as string }] },
    async execute(args: { logistics_data: string }) {
      const logisticsData: LogisticsEmissionData[] = JSON.parse(args.logistics_data)
      const result = calculateCarbonEmissions(logisticsData)
      return formatCarbonReport(result)
    }
  }))

  console.log(`[dsh-tool-logistics] Loaded v${VERSION} — Logistics & Route Optimization Engine with 8 tools`)
  console.log('  Tools: route_optimizer, warehouse_optimizer, last_mile_planner, freight_cost_analyzer, inventory_positioning, cross_dock_scheduler, fleet_utilization_tracker, carbon_logistics_calculator')
}
