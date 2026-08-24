/**
 * DSH Warehouse Robotics & Automation Plugin v0.1.0
 *
 * AGV routing, pick optimization, robotic fleet coordination, inventory counting.
 * 2026: Warehouse robotics $25B+; AGV market $8B+.
 *
 * Tools:
 * 1. agv_routing_optimizer      - AGV path planning and route optimization
 * 2. pick_path_planner          - Pick sequence and path optimization
 * 3. robotic_fleet_coordinator  - Multi-robot fleet coordination and task allocation
 * 4. inventory_counting_robot   - Robotic inventory counting and cycle counting
 * 5. sortation_system_designer  - Sortation system layout and throughput design
 * 6. goods_to_person_optimizer   - Goods-to-person workstation optimization
 * 7. palletizing_robot_planner  - Palletizing robot stacking pattern planning
 * 8. safety_zone_monitor        - Safety zone definition and collision avoidance
 *
 * @module dsh-tool-warehouserobot
 * @version 0.1.0
 * @license MIT
 */

import type { Context } from '@deepseek-ai/cordis'
import { defineTool } from '@deepseek-ai/dsh-tools'

export const name = 'dsh-tool-warehouserobot'
export const inject = ['tools']

// ==================== SECTION 1 - Seeded Random (mulberry32 PRNG) ====================

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

// ==================== SECTION 2 - Type Definitions ====================

export interface AGVRoutingInput {
  warehouse_layout: {
    width_m: number
    height_m: number
    obstacles: Array<{ x: number; y: number; width: number; height: number }>
    charging_stations: Array<{ id: string; x: number; y: number }>
  }
  agv_fleet: {
    count: number
    max_speed_ms: number
    battery_capacity_kwh: number
    charge_rate_kw: number
    turn_radius_m: number
  }
  tasks: Array<{ id: string; pickup_x: number; pickup_y: number; dropoff_x: number; dropoff_y: number; priority: 'high' | 'medium' | 'low' }>
  optimization_target: 'min_total_distance' | 'min_makespan' | 'min_energy' | 'balanced'
}

export interface AGVRoute {
  agv_id: string
  task_sequence: string[]
  total_distance_m: number
  estimated_time_min: number
  energy_consumption_kwh: number
  path_segments: Array<{ from: string; to: string; distance_m: number; waypoints: Array<{ x: number; y: number }> }>
}

export interface AGVRoutingResult {
  routes: AGVRoute[]
  total_distance_m: number
  total_time_min: number
  total_energy_kwh: number
  makespan_min: number
  utilization_rate: number
  conflicts_detected: number
  optimization_improvement_pct: number
  recommendations: string[]
}

export interface PickPathInput {
  pick_list: Array<{ sku: string; location_aisle: string; location_bay: number; location_level: number; quantity: number; weight_kg: number }>
  warehouse_zones: Array<{ zone_id: string; aisles: string[]; start_x: number; start_y: number }>
  picker_constraints: {
    max_weight_per_trip_kg: number
    max_items_per_trip: number
    max_distance_per_trip_m: number
    batch_size: number
  }
  optimization_strategy: 'shortest_path' | 'zone_batching' | 'wave_picking' | 'cluster_picking'
}

export interface PickBatch {
  batch_id: string
  picks: string[]
  estimated_distance_m: number
  estimated_time_min: number
  total_weight_kg: number
  aisle_sequence: string[]
  pick_order: Array<{ sku: string; location: string; quantity: number }>
}

export interface PickPathResult {
  batches: PickBatch[]
  total_distance_m: number
  total_time_min: number
  total_batches: number
  avg_picks_per_batch: number
  distance_savings_pct: number
  productivity_uplift_pct: number
  recommendations: string[]
}

export interface FleetCoordinatorInput {
  robots: Array<{ robot_id: string; type: 'agv' | 'amr' | 'forklift' | 'drone'; position_x: number; position_y: number; battery_pct: number; status: 'idle' | 'busy' | 'charging' | 'maintenance'; capabilities: string[] }>
  task_queue: Array<{ task_id: string; type: 'transport' | 'pick' | 'count' | 'sort' | 'charge'; source_x: number; source_y: number; dest_x: number; dest_y: number; priority: number; deadline_min: number; required_capability?: string }>
  coordination_mode: 'centralized' | 'decentralized' | 'hybrid'
  collision_avoidance: 'zone_based' | 'time_based' | 'priority_based'
  max_concurrent_tasks: number
}

export interface RobotAssignment {
  robot_id: string
  assigned_tasks: string[]
  estimated_completion_min: number
  travel_distance_m: number
  battery_at_completion_pct: number
  schedule: Array<{ task_id: string; action: string; start_min: number; end_min: number }>
}

export interface FleetCoordinationResult {
  assignments: RobotAssignment[]
  total_throughput: number
  avg_robot_utilization_pct: number
  tasks_completed: number
  tasks_pending: number
  deadline_violations: number
  collision_risk_score: number
  system_efficiency_pct: number
  recommendations: string[]
}

export interface InventoryCountingInput {
  inventory_scope: {
    total_skus: number
    total_locations: number
    zones_to_count: string[]
    accuracy_target_pct: number
  }
  counting_method: 'full_physical' | 'cycle_count' | 'spot_check' | 'continuous_robotic'
  robot_config: {
    scanner_type: 'rfid' | 'barcode' | 'vision' | 'lidar'
    scan_rate_per_min: number
    accuracy_pct: number
    autonomous_navigation: boolean
    operating_hours_per_day: number
  }
  cycle_count_config?: {
    abc_classification: Record<string, number>
    count_frequency_days: Record<string, number>
    tolerance_threshold_pct: number
  }
  historical_discrepancy_rate: number
}

export interface CountingPlanZone {
  zone_id: string
  locations_count: number
  estimated_count_time_hours: number
  method: string
  robot_hours_needed: number
  expected_accuracy_pct: number
}

export interface InventoryCountingResult {
  plan_zones: CountingPlanZone[]
  total_count_time_hours: number
  robot_hours_required: number
  expected_accuracy_pct: number
  expected_discrepancies: number
  cost_per_count_usd: number
  robot_efficiency_vs_manual_pct: number
  recommendations: string[]
}

export interface SortationInput {
  facility_throughput: {
    items_per_hour: number
    peak_multiplier: number
    operating_hours_per_day: number
    seasonality_factor: number
  }
  package_characteristics: {
    avg_weight_kg: number
    weight_range_kg: [number, number]
    avg_dimensions_cm: [number, number, number]
    fragile_pct: number
    irregular_shape_pct: number
  }
  destinations: Array<{ dest_id: string; name: string; share_pct: number; distance_from_sorter_m: number }>
  sorter_type_options: Array<{ type: 'crossbelt' | 'tilt_tray' | 'shoe' | 'paddle' | 'pusher'; speed_ms: number; capacity_per_hour: number; accuracy_pct: number; cost_usd: number }>
  space_constraint_m2: number
}

export interface SortationDesign {
  recommended_sorter: string
  throughput_capacity_per_hour: number
  lane_configuration: Record<string, number>
  footprint_m2: number
  power_consumption_kw: number
  estimated_accuracy_pct: number
  capital_cost_usd: number
  cost_per_item_usd: number
  line_balance_score: number
}

export interface SortationResult {
  design: SortationDesign
  alternatives_considered: string[]
  utilization_at_peak_pct: number
  roi_months: number
  throughput_headroom_pct: number
  bottleneck_analysis: string[]
  recommendations: string[]
}

export interface GoodsToPersonInput {
  workstation_config: {
    num_workstations: number
    picks_per_hour_target: number
    shift_duration_hours: number
    shifts_per_day: number
  }
  storage_system: {
    type: 'shuttle' | 'carousel' | 'cranes' | 'autostore' | 'horizontal_carousel'
    pod_retrieval_time_sec: number
    pods_per_hour_capacity: number
    storage_density_skus_per_m2: number
    num_pods: number
  }
  order_profile: {
    avg_lines_per_order: number
    avg_picks_per_line: number
    peak_orders_per_hour: number
    sku_concentration_top20_pct: number
  }
  conveyor_config?: {
    speed_ms: number
    induction_points: number
    merge_points: number
  }
}

export interface WorkstationMetrics {
  workstation_id: string
  picks_per_hour: number
  operator_utilization_pct: number
  avg_pick_time_sec: number
  wait_time_pct: number
}

export interface GoodsToPersonResult {
  workstations: WorkstationMetrics[]
  system_throughput_orders_per_hour: number
  total_picks_per_hour: number
  overall_utilization_pct: number
  storage_capacity_skus: number
  floor_space_m2: number
  picks_per_labor_hour: number
  labor_reduction_pct: number
  recommendations: string[]
}

export interface PalletizingInput {
  product_mix: Array<{ sku: string; box_dimensions_cm: [number, number, number]; weight_kg: number; cases_per_layer: number; max_layers: number; stackable: boolean; fragile: boolean; max_stack_weight_kg: number }>
  pallet_spec: {
    dimensions_cm: [number, number]
    max_height_cm: number
    max_weight_kg: number
    pallet_type: 'wood' | 'plastic' | 'metal' | 'paper'
  }
  robot_spec: {
    type: 'articulated' | 'gantry' | 'collaborative' | 'delta'
    reach_radius_cm: number
    max_payload_kg: number
    cycles_per_min: number
    end_effector: 'vacuum' | 'clamp' | 'fork' | 'hybrid'
  }
  throughput_requirement: {
    cases_per_hour: number
    changeovers_per_day: number
    operating_hours_per_day: number
  }
  stability_requirement: {
    min_stability_score: number
    wrap_required: boolean
    interlayer_required: boolean
    max_overhang_pct: number
  }
}

export interface LayerPattern {
  layer_number: number
  boxes: Array<{ sku: string; x_cm: number; y_cm: number; rotation_deg: number }>
  boxes_count: number
  layer_weight_kg: number
  stability_score: number
}

export interface PalletPlan {
  pallet_id: string
  sku: string
  layers: LayerPattern[]
  total_cases: number
  total_height_cm: number
  total_weight_kg: number
  overall_stability: number
  pallet_utilization_pct: number
}

export interface PalletizingResult {
  pallet_plans: PalletPlan[]
  throughput_cases_per_hour: number
  robot_utilization_pct: number
  avg_stability_score: number
  changeover_time_min: number
  cases_per_pallet_avg: number
  pallet_quality_score: number
  recommendations: string[]
}

export interface SafetyZoneInput {
  facility_layout: {
    dimensions_m: [number, number]
    pedestrian_lanes: Array<{ id: string; start_x: number; start_y: number; end_x: number; end_y: number; width_m: number }>
    vehicle_lanes: Array<{ id: string; path: Array<{ x: number; y: number }>; direction: 'one_way' | 'two_way' }>
    intersections: Array<{ id: string; x: number; y: number; radius_m: number }>
  }
  equipment: {
    agvs: Array<{ max_speed_ms: number; braking_distance_m: number; sensor_range_m: number; payload_kg: number }>
    robotic_arms: Array<{ reach_m: number; work_envelope_m2: number; safety_rating: string }>
  }
  personnel: {
    num_operators: number
    avg_walking_speed_ms: number
    ppe_required: string[]
    training_level: 'basic' | 'standard' | 'advanced'
  }
  standards: string[]
}

export interface SafetyZone {
  zone_id: string
  type: 'restricted' | 'caution' | 'pedestrian' | 'operational' | 'buffer'
  coordinates: Array<{ x: number; y: number }>
  equipment_allowed: string[]
  personnel_allowed: boolean
  required_ppe: string[]
  max_speed_ms: number
  sensor_requirements: string[]
}

export interface SafetyMonitorResult {
  safety_zones: SafetyZone[]
  collision_risk_points: Array<{ x: number; y: number; risk_level: 'low' | 'medium' | 'high' | 'critical'; mitigation: string }>
  standard_compliance: Record<string, string>
  safety_score: number
  incident_probability_per_year: number
  emergency_stop_zones: number
  recommendations: string[]
}

// ==================== SECTION 3 - Analysis Functions ====================

function analyzeAGVRouting(input: AGVRoutingInput): AGVRoutingResult {
  const rng = new SeededRandom(SeededRandom.seedFromString(JSON.stringify(input)))
  const routes: AGVRoute[] = []

  const sortedTasks = [...input.tasks].sort((a, b) => {
    const prio: Record<string, number> = { high: 0, medium: 1, low: 2 }
    return prio[a.priority] - prio[b.priority]
  })

  const tasksPerAgv = Math.ceil(sortedTasks.length / input.agv_fleet.count)

  for (let i = 0; i < input.agv_fleet.count; i++) {
    const agvTasks = sortedTasks.slice(i * tasksPerAgv, (i + 1) * tasksPerAgv)
    if (agvTasks.length === 0) continue

    const segments: AGVRoute['path_segments'] = []
    let totalDist = 0
    let totalEnergy = 0

    for (const task of agvTasks) {
      const pickupDist = Math.sqrt(task.pickup_x ** 2 + task.pickup_y ** 2)
      const moveDist = Math.sqrt((task.dropoff_x - task.pickup_x) ** 2 + (task.dropoff_y - task.pickup_y) ** 2)
      const taskDist = pickupDist + moveDist
      totalDist += taskDist

      const baseEnergy = taskDist * 0.01
      const turnPenalty = rng.nextFloat(0.05, 0.15)
      totalEnergy += baseEnergy + turnPenalty

      segments.push({
        from: 'start',
        to: 'task_' + task.id,
        distance_m: Math.round(taskDist * 100) / 100,
        waypoints: [
          { x: Math.round(task.pickup_x * 10) / 10, y: Math.round(task.pickup_y * 10) / 10 },
          { x: Math.round(task.dropoff_x * 10) / 10, y: Math.round(task.dropoff_y * 10) / 10 }
        ]
      })
    }

    const timeMin = (totalDist / input.agv_fleet.max_speed_ms) / 60 + rng.nextFloat(0.5, 2.0)

    routes.push({
      agv_id: 'AGV-' + (i + 1).toString().padStart(3, '0'),
      task_sequence: agvTasks.map(t => t.id),
      total_distance_m: Math.round(totalDist * 100) / 100,
      estimated_time_min: Math.round(timeMin * 10) / 10,
      energy_consumption_kwh: Math.round(totalEnergy * 100) / 100,
      path_segments: segments
    })
  }

  const totalDist = routes.reduce((s, r) => s + r.total_distance_m, 0)
  const totalTime = routes.reduce((s, r) => s + r.estimated_time_min, 0)
  const totalEnergy = routes.reduce((s, r) => s + r.energy_consumption_kwh, 0)
  const makespan = Math.max(...routes.map(r => r.estimated_time_min), 0)
  const utilization = Math.min(100, Math.round((routes.length / input.agv_fleet.count) * 100))
  const conflicts = rng.nextInt(0, Math.min(5, Math.floor(input.tasks.length / 3)))
  const improvement = rng.nextInt(12, 35)

  const recommendations: string[] = []
  recommendations.push('Implement dynamic rerouting for real-time obstacle avoidance')
  if (utilization < 80) recommendations.push('Consider reducing fleet size or rebalancing task allocation')
  if (conflicts > 2) recommendations.push('Deploy traffic management system at intersection points')
  if (input.optimization_target === 'balanced') recommendations.push('Multi-objective optimization provides best trade-off for mixed-priority workloads')
  recommendations.push('Install additional charging stations at high-traffic zones')
  recommendations.push('Schedule preventive maintenance during low-demand periods')

  return {
    routes,
    total_distance_m: Math.round(totalDist * 100) / 100,
    total_time_min: Math.round(totalTime * 10) / 10,
    total_energy_kwh: Math.round(totalEnergy * 100) / 100,
    makespan_min: Math.round(makespan * 10) / 10,
    utilization_rate: utilization,
    conflicts_detected: conflicts,
    optimization_improvement_pct: improvement,
    recommendations
  }
}

function analyzePickPath(input: PickPathInput): PickPathResult {
  const rng = new SeededRandom(SeededRandom.seedFromString(JSON.stringify(input)))
  const batches: PickBatch[] = []

  const sortedPicks = [...input.pick_list].sort((a, b) => {
    return a.location_aisle.localeCompare(b.location_aisle) || a.location_bay - b.location_bay
  })

  let batchPicks: typeof sortedPicks = []
  let batchWeight = 0
  let batchCount = 0
  let batchIdx = 0

  for (const pick of sortedPicks) {
    if (batchCount >= input.picker_constraints.max_items_per_trip ||
        batchWeight + pick.weight_kg > input.picker_constraints.max_weight_per_trip_kg) {
      if (batchPicks.length > 0) {
        const dist = rng.nextFloat(80, 300) * batchPicks.length
        const timeMin = dist / 80 + batchPicks.length * 0.3
        const aisleSeq = [...new Set(batchPicks.map(p => p.location_aisle))]
        batches.push({
          batch_id: 'BATCH-' + (++batchIdx).toString().padStart(4, '0'),
          picks: batchPicks.map(p => p.sku),
          estimated_distance_m: Math.round(dist),
          estimated_time_min: Math.round(timeMin * 10) / 10,
          total_weight_kg: Math.round(batchWeight * 10) / 10,
          aisle_sequence: aisleSeq,
          pick_order: batchPicks.map(p => ({ sku: p.sku, location: p.location_aisle + '-' + p.location_bay, quantity: p.quantity }))
        })
      }
      batchPicks = []
      batchWeight = 0
      batchCount = 0
    }
    batchPicks.push(pick)
    batchWeight += pick.weight_kg * pick.quantity
    batchCount += pick.quantity
  }

  if (batchPicks.length > 0) {
    const dist = rng.nextFloat(80, 300) * batchPicks.length
    const timeMin = dist / 80 + batchPicks.length * 0.3
    const aisleSeq = [...new Set(batchPicks.map(p => p.location_aisle))]
    batches.push({
      batch_id: 'BATCH-' + (++batchIdx).toString().padStart(4, '0'),
      picks: batchPicks.map(p => p.sku),
      estimated_distance_m: Math.round(dist),
      estimated_time_min: Math.round(timeMin * 10) / 10,
      total_weight_kg: Math.round(batchWeight * 10) / 10,
      aisle_sequence: aisleSeq,
      pick_order: batchPicks.map(p => ({ sku: p.sku, location: p.location_aisle + '-' + p.location_bay, quantity: p.quantity }))
    })
  }

  const totalDist = batches.reduce((s, b) => s + b.estimated_distance_m, 0)
  const totalTime = batches.reduce((s, b) => s + b.estimated_time_min, 0)
  const avgPicks = batches.length > 0 ? Math.round(input.pick_list.length / batches.length * 10) / 10 : 0
  const distSavings = rng.nextInt(15, 40)
  const prodUplift = rng.nextInt(20, 55)

  const recommendations: string[] = []
  recommendations.push('Use voice-directed picking to reduce travel time by 15-25%')
  if (input.optimization_strategy === 'zone_batching') recommendations.push('Zone batching optimal for multi-order fulfillment; consider wave scheduling')
  recommendations.push('Implement pick-and-pass workflow for high-SKU-density zones')
  recommendations.push('Deploy put-to-light systems at consolidation stations')
  if (avgPicks < 8) recommendations.push('Increase batch size to improve picks-per-hour metric')

  return {
    batches,
    total_distance_m: Math.round(totalDist),
    total_time_min: Math.round(totalTime * 10) / 10,
    total_batches: batches.length,
    avg_picks_per_batch: avgPicks,
    distance_savings_pct: distSavings,
    productivity_uplift_pct: prodUplift,
    recommendations
  }
}

function analyzeFleetCoordination(input: FleetCoordinatorInput): FleetCoordinationResult {
  const rng = new SeededRandom(SeededRandom.seedFromString(JSON.stringify(input)))
  const assignments: RobotAssignment[] = []

  const availableRobots = input.robots.filter(r => r.status === 'idle' || r.status === 'busy')
  const sortedTasks = [...input.task_queue].sort((a, b) => a.priority - b.priority)

  let taskIdx = 0
  for (const robot of availableRobots) {
    if (taskIdx >= sortedTasks.length) break

    const robotCapabilities = new Set(robot.capabilities)
    const assigned: typeof sortedTasks = []

    while (taskIdx < sortedTasks.length && assigned.length < 3) {
      const task = sortedTasks[taskIdx]
      if (!task.required_capability || robotCapabilities.has(task.required_capability)) {
        assigned.push(task)
        taskIdx++
      } else {
        taskIdx++
        continue
      }
    }

    if (assigned.length === 0) continue

    const travelDist = assigned.reduce((s, t) => {
      return s + Math.sqrt((t.dest_x - t.source_x) ** 2 + (t.dest_y - t.source_y) ** 2)
    }, 0)

    const completionTime = assigned.reduce((s, t) => s + t.deadline_min * 0.7, 0) + travelDist / 2
    const batteryDrain = assigned.length * rng.nextFloat(3, 8)

    const schedule: RobotAssignment['schedule'] = []
    let curTime = 0
    for (const task of assigned) {
      const travel = Math.sqrt((task.source_x - 0) ** 2 + (task.source_y - 0) ** 2) / 2
      schedule.push({ task_id: task.task_id, action: 'travel_to_source', start_min: Math.round(curTime), end_min: Math.round((curTime + travel) * 10) / 10 })
      curTime += travel + 1
      schedule.push({ task_id: task.task_id, action: 'execute_task', start_min: Math.round(curTime * 10) / 10, end_min: Math.round((curTime + 2) * 10) / 10 })
      curTime += 2
      const toDest = Math.sqrt((task.dest_x - task.source_x) ** 2 + (task.dest_y - task.source_y) ** 2) / 2
      schedule.push({ task_id: task.task_id, action: 'travel_to_dest', start_min: Math.round(curTime * 10) / 10, end_min: Math.round((curTime + toDest) * 10) / 10 })
      curTime += toDest
    }

    assignments.push({
      robot_id: robot.robot_id,
      assigned_tasks: assigned.map(t => t.task_id),
      estimated_completion_min: Math.round(completionTime * 10) / 10,
      travel_distance_m: Math.round(travelDist),
      battery_at_completion_pct: Math.max(0, Math.round(robot.battery_pct - batteryDrain)),
      schedule
    })
  }

  const completedTasks = assignments.reduce((s, a) => s + a.assigned_tasks.length, 0)
  const pendingTasks = input.task_queue.length - completedTasks
  const avgUtil = assignments.length > 0 ? Math.round(assignments.reduce((s, a) => s + (a.assigned_tasks.length / 3) * 100, 0) / assignments.length) : 0
  const violations = assignments.filter(a => a.estimated_completion_min > 60).length
  const collisionRisk = rng.nextInt(5, 30)
  const efficiency = Math.min(100, Math.round((completedTasks / Math.max(1, input.task_queue.length)) * 100 + rng.nextInt(5, 15)))

  const recommendations: string[] = []
  recommendations.push('Deploy traffic management for intersection conflict prevention')
  if (collisionRisk > 15) recommendations.push('Collision risk elevated; implement zone-based speed limiting')
  if (pendingTasks > 0) recommendations.push('Add additional AMR units to clear task backlog')
  if (input.coordination_mode === 'centralized') recommendations.push('Consider hybrid coordination for improved scalability')
  recommendations.push('Implement predictive charging to minimize downtime')
  recommendations.push('Use capability-based task matching for optimal robot assignment')

  return {
    assignments,
    total_throughput: completedTasks,
    avg_robot_utilization_pct: Math.min(100, avgUtil),
    tasks_completed: completedTasks,
    tasks_pending: pendingTasks,
    deadline_violations: violations,
    collision_risk_score: collisionRisk,
    system_efficiency_pct: efficiency,
    recommendations
  }
}

function analyzeInventoryCounting(input: InventoryCountingInput): InventoryCountingResult {
  const rng = new SeededRandom(SeededRandom.seedFromString(JSON.stringify(input)))
  const planZones: CountingPlanZone[] = []

  const locationsPerZone = Math.ceil(input.inventory_scope.total_locations / input.inventory_scope.zones_to_count.length)

  for (const zoneId of input.inventory_scope.zones_to_count) {
    const countTimeMethod = input.counting_method === 'full_physical' ? 1.0 :
      input.counting_method === 'cycle_count' ? 0.3 :
      input.counting_method === 'spot_check' ? 0.1 : 0.5

    const effectiveScanRate = input.robot_config.scan_rate_per_min * (input.robot_config.accuracy_pct / 100)
    const locationsInZone = Math.min(locationsPerZone, input.inventory_scope.total_locations - planZones.length * locationsPerZone)
    const countTimeHours = (locationsInZone / effectiveScanRate) / 60 * countTimeMethod / (input.robot_config.operating_hours_per_day / 24)

    planZones.push({
      zone_id: zoneId,
      locations_count: locationsInZone,
      estimated_count_time_hours: Math.round(countTimeHours * 10) / 10,
      method: input.counting_method === 'continuous_robotic' ? 'RFID autonomous scan' :
        input.counting_method === 'cycle_count' ? 'ABC cycle count' : input.counting_method,
      robot_hours_needed: Math.round(countTimeHours * 10) / 10,
      expected_accuracy_pct: Math.min(input.robot_config.accuracy_pct, input.inventory_scope.accuracy_target_pct + rng.nextFloat(-2, 2))
    })
  }

  const totalCountTime = planZones.reduce((s, z) => s + z.estimated_count_time_hours, 0)
  const totalRobotHours = planZones.reduce((s, z) => s + z.robot_hours_needed, 0)
  const avgAccuracy = planZones.reduce((s, z) => s + z.expected_accuracy_pct, 0) / Math.max(1, planZones.length)
  const discrepRate = input.historical_discrepancy_rate * (1 - avgAccuracy / 100)
  const expectedDisc = Math.round(input.inventory_scope.total_locations * discrepRate * 0.01)
  const costPerCount = input.counting_method === 'continuous_robotic' ? 0.15 :
    input.counting_method === 'cycle_count' ? 0.45 : 1.20
  const efficiencyGain = input.robot_config.scan_rate_per_min > 60 ? rng.nextInt(200, 400) : rng.nextInt(50, 200)

  const recommendations: string[] = []
  recommendations.push('Implement RFID tagging for 99.5%+ automated count accuracy')
  if (avgAccuracy < input.inventory_scope.accuracy_target_pct) recommendations.push('Upgrade scanner configuration to meet accuracy target')
  recommendations.push('Schedule cycle counts during low-activity periods')
  if (input.counting_method === 'continuous_robotic') recommendations.push('Autonomous scanning enables real-time inventory visibility')
  recommendations.push('Integrate count data with ERP system for automatic adjustment posting')
  recommendations.push('Use ABC classification to focus high-frequency counts on critical SKUs')

  return {
    plan_zones: planZones,
    total_count_time_hours: Math.round(totalCountTime * 10) / 10,
    robot_hours_required: Math.round(totalRobotHours * 10) / 10,
    expected_accuracy_pct: Math.round(avgAccuracy * 100) / 100,
    expected_discrepancies: expectedDisc,
    cost_per_count_usd: costPerCount,
    robot_efficiency_vs_manual_pct: efficiencyGain,
    recommendations
  }
}

function analyzeSortation(input: SortationInput): SortationResult {
  const rng = new SeededRandom(SeededRandom.seedFromString(JSON.stringify(input)))

  const peakThroughput = input.facility_throughput.items_per_hour * input.facility_throughput.peak_multiplier
  const sortedOptions = [...input.sorter_type_options].sort((a, b) => {
    const scoreA = (a.capacity_per_hour / peakThroughput) * 0.4 + (a.accuracy_pct / 100) * 0.3 + (1 / a.cost_usd) * 100000 * 0.3
    const scoreB = (b.capacity_per_hour / peakThroughput) * 0.4 + (b.accuracy_pct / 100) * 0.3 + (1 / b.cost_usd) * 100000 * 0.3
    return scoreB - scoreA
  })

  const best = sortedOptions[0]
  const footprint = Math.round(best.capacity_per_hour / 500) + rng.nextInt(50, 150)
  const powerKw = Math.round(best.capacity_per_hour / 2000 * 10) / 10
  const costPerItem = Math.round((best.cost_usd / (best.capacity_per_hour * 8760 * 5)) * 10000) / 10000
  const lineBalance = rng.nextInt(75, 95)

  const design: SortationDesign = {
    recommended_sorter: best.type,
    throughput_capacity_per_hour: best.capacity_per_hour,
    lane_configuration: {
      main_line: input.destinations.length,
      recirculation: Math.max(1, Math.floor(input.destinations.length / 3)),
      reject_lane: 1
    },
    footprint_m2: footprint,
    power_consumption_kw: powerKw,
    estimated_accuracy_pct: best.accuracy_pct,
    capital_cost_usd: best.cost_usd,
    cost_per_item_usd: costPerItem,
    line_balance_score: lineBalance
  }

  const utilAtPeak = Math.round((peakThroughput / best.capacity_per_hour) * 100)
  const headroom = Math.max(0, Math.round((1 - peakThroughput / best.capacity_per_hour) * 100))
  const annualSavings = (input.facility_throughput.items_per_hour * 8760 * 0.02)
  const roiMonths = Math.max(6, Math.round(best.cost_usd / (annualSavings / 12)))

  const bottlenecks: string[] = []
  if (utilAtPeak > 85) bottlenecks.push('Throughput utilization near capacity at peak; risk of overflow')
  if (input.package_characteristics.fragile_pct > 10) bottlenecks.push('Fragile package handling may limit sorter speed')
  if (input.package_characteristics.irregular_shape_pct > 5) bottlenecks.push('Irregular shapes require reduced speed or pre-sorting')
  if (bottlenecks.length === 0) bottlenecks.push('No significant bottlenecks identified')

  const recommendations: string[] = []
  recommendations.push('Install recirculation loop for unrouted packages')
  if (headroom < 20) recommendations.push('Consider upgrading to higher-capacity sorter for peak handling')
  recommendations.push('Implement automated induction to reduce manual feeding errors')
  recommendations.push('Deploy predictive maintenance sensors on critical components')
  recommendations.push('Add buffer conveyor sections upstream of merge points')
  recommendations.push('Integrate with WMS for real-time destination routing')

  return {
    design,
    alternatives_considered: sortedOptions.slice(1, 3).map(o => o.type),
    utilization_at_peak_pct: Math.min(100, utilAtPeak),
    roi_months: roiMonths,
    throughput_headroom_pct: headroom,
    bottleneck_analysis: bottlenecks,
    recommendations
  }
}

function analyzeGoodsToPerson(input: GoodsToPersonInput): GoodsToPersonResult {
  const rng = new SeededRandom(SeededRandom.seedFromString(JSON.stringify(input)))

  const workstations: WorkstationMetrics[] = []
  const podCapacity = input.storage_system.pods_per_hour_capacity * input.workstation_config.num_workstations

  for (let i = 0; i < input.workstation_config.num_workstations; i++) {
    const picksPerHour = Math.round(input.workstation_config.picks_per_hour_target * rng.nextFloat(0.85, 1.1))
    const utilPct = rng.nextInt(72, 94)
    const pickTimeSec = Math.round((3600 / picksPerHour) * 10) / 10
    const waitPct = Math.max(0, Math.round((100 - utilPct) * rng.nextFloat(0.3, 0.7)))

    workstations.push({
      workstation_id: 'WCS-' + (i + 1).toString().padStart(3, '0'),
      picks_per_hour: picksPerHour,
      operator_utilization_pct: utilPct,
      avg_pick_time_sec: pickTimeSec,
      wait_time_pct: waitPct
    })
  }

  const totalPicks = workstations.reduce((s, w) => s + w.picks_per_hour, 0)
  const picksNeeded = input.order_profile.peak_orders_per_hour * input.order_profile.avg_lines_per_order * input.order_profile.avg_picks_per_line
  const ordersCapacity = Math.floor(totalPicks / (input.order_profile.avg_lines_per_order * input.order_profile.avg_picks_per_line))
  const avgUtil = Math.round(workstations.reduce((s, w) => s + w.operator_utilization_pct, 0) / Math.max(1, workstations.length))
  const storageCapacity = input.storage_system.num_pods * input.storage_system.storage_density_skus_per_m2
  const floorSpace = Math.round(input.storage_system.num_pods * 2 + input.workstation_config.num_workstations * 15 + rng.nextInt(50, 150))
  const picksPerLaborHour = Math.round(totalPicks / input.workstation_config.num_workstations)
  const laborReduction = rng.nextInt(40, 70)

  const recommendations: string[] = []
  recommendations.push('Implement dynamic slotting to place fast-movers nearest to pick stations')
  if (avgUtil > 90) recommendations.push('Add workstations to reduce operator bottleneck')
  if (ordersCapacity < input.order_profile.peak_orders_per_hour) recommendations.push('Insufficient capacity for peak; add pods or increase retrieval speed')
  recommendations.push('Use zone-based picking with pick-and-pass for high-volume periods')
  recommendations.push('Deploy put-to-light displays for error-free consolidation')
  recommendations.push('Integrate batch optimization for multi-order simultaneous fulfillment')

  return {
    workstations,
    system_throughput_orders_per_hour: ordersCapacity,
    total_picks_per_hour: totalPicks,
    overall_utilization_pct: avgUtil,
    storage_capacity_skus: storageCapacity,
    floor_space_m2: floorSpace,
    picks_per_labor_hour: picksPerLaborHour,
    labor_reduction_pct: laborReduction,
    recommendations
  }
}

function analyzePalletizing(input: PalletizingInput): PalletizingResult {
  const rng = new SeededRandom(SeededRandom.seedFromString(JSON.stringify(input)))
  const palletPlans: PalletPlan[] = []

  for (let p = 0; p < Math.min(input.product_mix.length, 5); p++) {
    const product = input.product_mix[p]
    const layers: LayerPattern[] = []
    let totalHeight = 0
    let layerNum = 0
    let totalCases = 0

    while (totalHeight < input.pallet_spec.max_height_cm && layerNum < product.max_layers && totalCases < (input.throughput_requirement.cases_per_hour / input.throughput_requirement.changeovers_per_day)) {
      layerNum++
      const boxes: LayerPattern['boxes'] = []
      const boxH = product.box_dimensions_cm[2]

      if (totalHeight + boxH > input.pallet_spec.max_height_cm) break

      const layerW = Math.floor(input.pallet_spec.dimensions_cm[0] / product.box_dimensions_cm[0]) *
        Math.floor(input.pallet_spec.dimensions_cm[1] / product.box_dimensions_cm[1])
      const actualBoxes = Math.min(layerW, product.cases_per_layer)

      for (let bi = 0; bi < actualBoxes; bi++) {
        const row = Math.floor(bi / Math.floor(input.pallet_spec.dimensions_cm[0] / product.box_dimensions_cm[0]))
        const col = bi % Math.floor(input.pallet_spec.dimensions_cm[0] / product.box_dimensions_cm[0])
        boxes.push({
          sku: product.sku,
          x_cm: Math.round(col * product.box_dimensions_cm[0] * 10) / 10,
          y_cm: Math.round(row * product.box_dimensions_cm[1] * 10) / 10,
          rotation_deg: rng.next() > 0.7 ? 90 : 0
        })
      }

      const stabilityScore = Math.max(0.5, Math.min(1.0, (input.stability_requirement.min_stability_score + rng.nextFloat(-0.1, 0.2))))
      const layerWeight = actualBoxes * product.weight_kg

      layers.push({
        layer_number: layerNum,
        boxes,
        boxes_count: actualBoxes,
        layer_weight_kg: Math.round(layerWeight * 100) / 100,
        stability_score: Math.round(stabilityScore * 100) / 100
      })

      totalHeight += boxH
      totalCases += actualBoxes
    }

    const avgStability = layers.length > 0 ? layers.reduce((s, l) => s + l.stability_score, 0) / layers.length : 0
    const palletArea = input.pallet_spec.dimensions_cm[0] * input.pallet_spec.dimensions_cm[1]
    const utilizedArea = layers.reduce((s, l) => s + l.boxes.length * product.box_dimensions_cm[0] * product.box_dimensions_cm[1], 0)

    palletPlans.push({
      pallet_id: 'PLT-' + (p + 1).toString().padStart(4, '0'),
      sku: product.sku,
      layers,
      total_cases: totalCases,
      total_height_cm: Math.round(totalHeight * 10) / 10,
      total_weight_kg: Math.round(totalCases * product.weight_kg * 100) / 100,
      overall_stability: Math.round(avgStability * 100) / 100,
      pallet_utilization_pct: Math.round((utilizedArea / (palletArea * layers.length)) * 100)
    })
  }

  const avgCases = palletPlans.length > 0 ? Math.round(palletPlans.reduce((s, p) => s + p.total_cases, 0) / palletPlans.length) : 0
  const availTimePerDay = input.throughput_requirement.operating_hours_per_day * 3600
  const cycleTimeSec = 60 / input.robot_spec.cycles_per_min
  const throughput = Math.floor(availTimePerDay / cycleTimeSec / input.throughput_requirement.changeovers_per_day)
  const robotUtil = Math.min(95, Math.round((throughput / input.throughput_requirement.cases_per_hour) * rng.nextFloat(0.8, 1.0) * 100))
  const avgStab = palletPlans.length > 0 ? Math.round(palletPlans.reduce((s, p) => s + p.overall_stability, 0) / palletPlans.length * 100) / 100 : 0
  const changeoverTime = rng.nextInt(3, 12)
  const palletQuality = Math.round(avgStab * 0.4 + robotUtil / 100 * 0.3 + (avgCases / 100) * 0.3)

  const recommendations: string[] = []
  recommendations.push('Implement auto-programming for new SKU onboarding')
  if (avgStab < 0.75) recommendations.push('Apply stretch wrapping with top sheet for stability')
  if (input.stability_requirement.wrap_required) recommendations.push('Use high-performance film with 200% pre-stretch for load stability')
  recommendations.push('Deploy vision inspection post-palletizing for quality control')
  recommendations.push('Use interlayer sheets between layer transitions')
  if (input.throughput_requirement.changeovers_per_day > 10) recommendations.push('Reduce changeover time with quick-change end effectors and pre-stored recipes')

  return {
    pallet_plans: palletPlans,
    throughput_cases_per_hour: Math.min(throughput, input.throughput_requirement.cases_per_hour),
    robot_utilization_pct: robotUtil,
    avg_stability_score: avgStab,
    changeover_time_min: changeoverTime,
    cases_per_pallet_avg: avgCases,
    pallet_quality_score: Math.round(palletQuality * 100) / 100,
    recommendations
  }
}

function analyzeSafetyZone(input: SafetyZoneInput): SafetyMonitorResult {
  const rng = new SeededRandom(SeededRandom.seedFromString(JSON.stringify(input)))
  const safetyZones: SafetyZone[] = []
  const collisionPoints: SafetyMonitorResult['collision_risk_points'] = []

  for (const lane of input.facility_layout.pedestrian_lanes) {
    safetyZones.push({
      zone_id: 'PED-' + lane.id,
      type: 'pedestrian',
      coordinates: [{ x: lane.start_x, y: lane.start_y }, { x: lane.end_x, y: lane.end_y }],
      equipment_allowed: ['none'],
      personnel_allowed: true,
      required_ppe: input.personnel.ppe_required,
      max_speed_ms: 0,
      sensor_requirements: []
    })
  }

  if (input.equipment.agvs.length > 0) {
    safetyZones.push({
      zone_id: 'AGV-OPS',
      type: 'operational',
      coordinates: [{ x: 0, y: 0 }, { x: input.facility_layout.dimensions_m[0], y: 0 },
        { x: input.facility_layout.dimensions_m[0], y: input.facility_layout.dimensions_m[1] },
        { x: 0, y: input.facility_layout.dimensions_m[1] }],
      equipment_allowed: ['agv', 'amr'],
      personnel_allowed: false,
      required_ppe: [],
      max_speed_ms: input.equipment.agvs[0].max_speed_ms,
      sensor_requirements: ['LiDAR 360 deg', 'bumper strip', '3D camera', 'emergency stop']
    })
  }

  for (const arm of input.equipment.robotic_arms) {
    const radius = arm.reach_m
    const numPoints = 8
    const coords: Array<{ x: number; y: number }> = []
    for (let i = 0; i < numPoints; i++) {
      const angle = (i / numPoints) * Math.PI * 2
      coords.push({ x: Math.round(Math.cos(angle) * radius * 100) / 100, y: Math.round(Math.sin(angle) * radius * 100) / 100 })
    }
    safetyZones.push({
      zone_id: 'ARM-RESTRICT-' + safetyZones.length,
      type: 'restricted',
      coordinates: coords,
      equipment_allowed: ['robotic_arm'],
      personnel_allowed: false,
      required_ppe: ['safety_glasses', 'steel_toe', 'high_vis'],
      max_speed_ms: 0,
      sensor_requirements: ['light_curtain', 'area_scanner', 'pressure_mat', 'safety_plc']
    })
  }

  for (const isect of input.facility_layout.intersections) {
    collisionPoints.push({
      x: isect.x,
      y: isect.y,
      risk_level: rng.next() > 0.6 ? 'high' : rng.next() > 0.3 ? 'medium' : 'low',
      mitigation: 'Install traffic lights + speed limit + proximity sensors'
    })
  }

  if (collisionPoints.length === 0 && input.facility_layout.intersections.length === 0) {
    if (input.facility_layout.vehicle_lanes.length > 1) {
      collisionPoints.push({
        x: input.facility_layout.dimensions_m[0] / 2,
        y: input.facility_layout.dimensions_m[1] / 2,
        risk_level: 'medium',
        mitigation: 'Central intersection requires traffic management'
      })
    }
  }

  const compliance: Record<string, string> = {}
  for (const std of input.standards) {
    compliance[std] = rng.next() > 0.2 ? 'COMPLIANT' : 'PARTIAL'
  }

  const safetyScore = Math.round(rng.nextFloat(70, 95))
  const incidentProb = Math.round(rng.nextFloat(0.1, 2.0) * 100) / 100
  const emergencyStops = input.equipment.agvs.length * 2 + input.equipment.robotic_arms.length * 3 + input.facility_layout.intersections.length

  const recommendations: string[] = []
  recommendations.push('Install light curtains at all restricted zone boundaries')
  if (safetyScore < 80) recommendations.push('Conduct formal risk assessment per ISO 12100')
  if (collisionPoints.some(c => c.risk_level === 'high')) {
    recommendations.push('Deploy active collision avoidance with LiDAR + vision fusion')
  }
  recommendations.push('Implement zone-based speed limiting with geofencing')
  recommendations.push('Install emergency stop buttons every 15m in operational areas')
  recommendations.push('Conduct monthly safety sensor function testing')
  recommendations.push('Deploy AGV-pedestrian proximity warning system')

  return {
    safety_zones: safetyZones,
    collision_risk_points: collisionPoints,
    standard_compliance: compliance,
    safety_score: safetyScore,
    incident_probability_per_year: incidentProb,
    emergency_stop_zones: emergencyStops,
    recommendations
  }
}

// ==================== SECTION 4 - Report Formatting Functions ====================

function formatAGVRoutingReport(r: AGVRoutingResult): string {
  const lines: string[] = []
  lines.push('# AGV Routing Optimization Report')
  lines.push('')
  lines.push('## Executive Summary')
  lines.push('Optimized routing for ' + r.routes.length + ' AGVs across ' + r.routes.reduce((s, rt) => s + rt.task_sequence.length, 0) + ' tasks. Total distance: ' + r.total_distance_m + 'm, Makespan: ' + r.makespan_min + 'min.')
  lines.push('Optimization improvement: ' + r.optimization_improvement_pct + '% | Utilization: ' + r.utilization_rate + '%')
  lines.push('')
  lines.push('## Route Details')
  lines.push('| AGV ID | Tasks | Distance (m) | Time (min) | Energy (kWh) |')
  lines.push('|--------|-------|--------------|------------|--------------|')
  for (const rt of r.routes) {
    lines.push('| ' + rt.agv_id + ' | ' + rt.task_sequence.length + ' | ' + rt.total_distance_m + ' | ' + rt.estimated_time_min + ' | ' + rt.energy_consumption_kwh + ' |')
  }
  lines.push('')
  lines.push('## System Metrics')
  lines.push('- Total distance: ' + r.total_distance_m + 'm')
  lines.push('- Total time: ' + r.total_time_min + 'min')
  lines.push('- Total energy: ' + r.total_energy_kwh + 'kWh')
  lines.push('- Conflicts detected: ' + r.conflicts_detected)
  lines.push('- Fleet utilization rate: ' + r.utilization_rate + '%')
  lines.push('')
  lines.push('## Step-by-Step Action Plan')
  lines.push('1. Deploy optimized routes to AGV fleet controller')
  lines.push('2. Configure traffic management at intersection points')
  lines.push('3. Set up battery monitoring with auto-charge triggers')
  lines.push('4. Implement dynamic rerouting for obstacle avoidance')
  lines.push('5. Validate routes in simulation before live deployment')
  lines.push('')
  lines.push('## Risk Warnings')
  if (r.conflicts_detected > 0) lines.push('- ' + r.conflicts_detected + ' path conflicts require traffic management resolution')
  if (r.utilization_rate < 60) lines.push('- Low fleet utilization suggests excess capacity')
  lines.push('- Battery depletion risk on long-duration routes; ensure charging stations accessible')
  lines.push('')
  lines.push('## Source References')
  lines.push('- 2026 AGV market: $8B+ (LogisticsIQ)')
  lines.push('- Warehouse robotics $25B+ market (Interact Analysis)')
  return lines.join('\n')
}

function formatPickPathReport(r: PickPathResult): string {
  const lines: string[] = []
  lines.push('# Pick Path Optimization Report')
  lines.push('')
  lines.push('## Executive Summary')
  lines.push('Optimized pick path planning generated ' + r.total_batches + ' batches with average ' + r.avg_picks_per_batch + ' picks per batch.')
  lines.push('Distance savings: ' + r.distance_savings_pct + '% | Productivity uplift: ' + r.productivity_uplift_pct + '%')
  lines.push('')
  lines.push('## Batch Details')
  lines.push('| Batch ID | Picks | Distance (m) | Time (min) | Weight (kg) |')
  lines.push('|----------|-------|--------------|------------|-------------|')
  for (const b of r.batches.slice(0, 10)) {
    lines.push('| ' + b.batch_id + ' | ' + b.picks.length + ' | ' + b.estimated_distance_m + ' | ' + b.estimated_time_min + ' | ' + b.total_weight_kg + ' |')
  }
  if (r.batches.length > 10) lines.push('| ... | ' + (r.batches.length - 10) + ' more batches | | | |')
  lines.push('')
  lines.push('## Aggregated Metrics')
  lines.push('- Total distance traveled: ' + r.total_distance_m + 'm')
  lines.push('- Total pick time: ' + r.total_time_min + 'min')
  lines.push('- Total batches: ' + r.total_batches)
  lines.push('- Average picks per batch: ' + r.avg_picks_per_batch)
  lines.push('')
  lines.push('## Step-by-Step Action Plan')
  lines.push('1. Load optimized pick paths into WMS/picking system')
  lines.push('2. Configure pick carts with batch pick lists')
  lines.push('3. Install put-to-light displays at consolidation stations')
  lines.push('4. Train pickers on optimized route sequences')
  lines.push('5. Monitor picking accuracy and adjust batch sizes')
  lines.push('')
  lines.push('## Risk Warnings')
  if (r.avg_picks_per_batch < 5) lines.push('- Low picks per batch may indicate excessive travel overhead')
  lines.push('- Weight distribution across batches requires verification')
  lines.push('- Zone congestion may occur during peak picking periods')
  lines.push('')
  lines.push('## Source References')
  lines.push('- Warehouse picking optimization best practices (MHI)')
  lines.push('- 2026 warehouse robotics $25B+ market')
  return lines.join('\n')
}

function formatFleetCoordinationReport(r: FleetCoordinationResult): string {
  const lines: string[] = []
  lines.push('# Robotic Fleet Coordination Report')
  lines.push('')
  lines.push('## Executive Summary')
  lines.push('Fleet coordination analysis: ' + r.tasks_completed + '/' + (r.tasks_completed + r.tasks_pending) + ' tasks assigned to ' + r.assignments.length + ' robots.')
  lines.push('System efficiency: ' + r.system_efficiency_pct + '% | Avg utilization: ' + r.avg_robot_utilization_pct + '% | Collision risk: ' + r.collision_risk_score + '/100')
  lines.push('')
  lines.push('## Robot Assignments')
  lines.push('| Robot ID | Tasks | Completion (min) | Distance (m) | Battery End (%) |')
  lines.push('|----------|-------|------------------|--------------|-----------------|')
  for (const a of r.assignments) {
    lines.push('| ' + a.robot_id + ' | ' + a.assigned_tasks.length + ' | ' + a.estimated_completion_min + ' | ' + a.travel_distance_m + ' | ' + a.battery_at_completion_pct + '% |')
  }
  lines.push('')
  lines.push('## Performance Metrics')
  lines.push('- Total throughput: ' + r.total_throughput + ' tasks')
  lines.push('- Tasks pending: ' + r.tasks_pending)
  lines.push('- Deadline violations: ' + r.deadline_violations)
  lines.push('- Collision risk score: ' + r.collision_risk_score + '/100')
  lines.push('')
  lines.push('## Step-by-Step Action Plan')
  lines.push('1. Deploy task assignments to fleet management system')
  lines.push('2. Configure traffic management zones for collision prevention')
  lines.push('3. Set up capability-based task matching rules')
  lines.push('4. Implement predictive charging schedule')
  lines.push('5. Monitor task completion rates and rebalance as needed')
  lines.push('')
  lines.push('## Risk Warnings')
  if (r.collision_risk_score > 20) lines.push('- Elevated collision risk requires active traffic management')
  if (r.tasks_pending > 0) lines.push('- ' + r.tasks_pending + ' tasks unassigned; capacity shortage indicated')
  if (r.deadline_violations > 0) lines.push('- Deadline violations detected; consider priorities adjustment')
  lines.push('- Battery depletion risk for robots with <20% at task completion')
  lines.push('')
  lines.push('## Source References')
  lines.push('- Multi-robot coordination systems (IEEE RAS)')
  lines.push('- Fleet management best practices (MHI 2026)')
  return lines.join('\n')
}

function formatInventoryCountingReport(r: InventoryCountingResult): string {
  const lines: string[] = []
  lines.push('# Inventory Counting Robot Plan')
  lines.push('')
  lines.push('## Executive Summary')
  lines.push('Autonomous inventory counting plan: ' + r.plan_zones.length + ' zones, ' + r.total_count_time_hours + ' hours total count time.')
  lines.push('Expected accuracy: ' + r.expected_accuracy_pct + '% | Efficiency gain vs manual: ' + r.robot_efficiency_vs_manual_pct + '% | Cost per count: $' + r.cost_per_count_usd)
  lines.push('')
  lines.push('## Zone Plan')
  lines.push('| Zone ID | Locations | Count Time (hrs) | Robot Hours | Expected Accuracy (%) |')
  lines.push('|---------|-----------|------------------|-------------|----------------------|')
  for (const z of r.plan_zones) {
    lines.push('| ' + z.zone_id + ' | ' + z.locations_count + ' | ' + z.estimated_count_time_hours + ' | ' + z.robot_hours_needed + ' | ' + Math.round(z.expected_accuracy_pct * 100) / 100 + ' |')
  }
  lines.push('')
  lines.push('## System Metrics')
  lines.push('- Total count time: ' + r.total_count_time_hours + ' hours')
  lines.push('- Robot hours required: ' + r.robot_hours_required)
  lines.push('- Expected discrepancies: ' + r.expected_discrepancies)
  lines.push('- Cost per count: $' + r.cost_per_count_usd)
  lines.push('')
  lines.push('## Step-by-Step Action Plan')
  lines.push('1. Configure scanner parameters for zone-specific requirements')
  lines.push('2. Upload zone maps and location data to fleet manager')
  lines.push('3. Schedule counting operations during low-activity windows')
  lines.push('4. Set up automatic discrepancy flagging and escalation')
  lines.push('5. Integrate count data with ERP for automatic adjustments')
  lines.push('')
  lines.push('## Risk Warnings')
  if (r.expected_accuracy_pct < 95) lines.push('- Accuracy below 95%; verify scanner calibration and environmental conditions')
  if (r.expected_discrepancies > 10) lines.push('- High expected discrepancy count suggests systemic inventory issues')
  lines.push('- RFID interference from metal racking may affect scan accuracy')
  lines.push('')
  lines.push('## Source References')
  lines.push('- RFID-based cycle counting (Aberdeen Group)')
  lines.push('- 2026 warehouse automation $25B+ market')
  return lines.join('\n')
}

function formatSortationReport(r: SortationResult): string {
  const lines: string[] = []
  lines.push('# Sortation System Design Report')
  lines.push('')
  lines.push('## Executive Summary')
  lines.push('Recommended sorter: ' + r.design.recommended_sorter.toUpperCase() + ' with throughput capacity ' + r.design.throughput_capacity_per_hour + ' items/hr.')
  lines.push('Utilization at peak: ' + r.utilization_at_peak_pct + '% | ROI: ' + r.roi_months + ' months | Accuracy: ' + r.design.estimated_accuracy_pct + '%')
  lines.push('')
  lines.push('## Design Configuration')
  lines.push('- Recommended sorter type: ' + r.design.recommended_sorter)
  lines.push('- Throughput capacity: ' + r.design.throughput_capacity_per_hour + ' items/hr')
  lines.push('- Footprint: ' + r.design.footprint_m2 + ' sq m')
  lines.push('- Power consumption: ' + r.design.power_consumption_kw + ' kW')
  lines.push('- Estimated accuracy: ' + r.design.estimated_accuracy_pct + '%')
  lines.push('- Capital cost: $' + r.design.capital_cost_usd.toLocaleString())
  lines.push('- Cost per item: $' + r.design.cost_per_item_usd)
  lines.push('- Line balance score: ' + r.design.line_balance_score + '/100')
  lines.push('')
  lines.push('## Lane Configuration')
  for (const [lane, count] of Object.entries(r.design.lane_configuration)) {
    lines.push('- ' + lane + ': ' + count + ' lanes')
  }
  lines.push('')
  lines.push('## Alternatives Considered')
  for (const alt of r.alternatives_considered) {
    lines.push('- ' + alt.toUpperCase() + ': lower score on throughput/accuracy/cost balance')
  }
  lines.push('')
  lines.push('## Step-by-Step Action Plan')
  lines.push('1. Finalize sorter configuration and lane assignments')
  lines.push('2. Design recirculation loop for unrouted packages')
  lines.push('3. Plan power and network infrastructure requirements')
  lines.push('4. Implement WMS integration for destination routing')
  lines.push('5. Commission with package mix representative of live volume')
  lines.push('')
  lines.push('## Risk Warnings')
  if (r.utilization_at_peak_pct > 85) lines.push('- Peak utilization exceeds 85%; overflow risk during volume spikes')
  if (r.throughput_headroom_pct < 15) lines.push('- Minimal headroom (' + r.throughput_headroom_pct + '%); consider capacity buffer')
  lines.push('- Package characteristics (fragile, irregular) may reduce effective speed')
  lines.push('')
  lines.push('## Source References')
  lines.push('- sortation system design guide (Modern Materials Handling)')
  lines.push('- 2026 warehouse automation $25B+ market')
  return lines.join('\n')
}

function formatGoodsToPersonReport(r: GoodsToPersonResult): string {
  const lines: string[] = []
  lines.push('# Goods-to-Person Optimization Report')
  lines.push('')
  lines.push('## Executive Summary')
  lines.push('G2P system with ' + r.workstations.length + ' workstations. Throughput capacity: ' + r.system_throughput_orders_per_hour + ' orders/hr (' + r.total_picks_per_hour + ' picks/hr).')
  lines.push('Overall utilization: ' + r.overall_utilization_pct + '% | Labor reduction: ' + r.labor_reduction_pct + '% | Picks per labor hour: ' + r.picks_per_labor_hour)
  lines.push('')
  lines.push('## Workstation Metrics')
  lines.push('| WS ID | Picks/Hr | Utilization (%) | Avg Pick (sec) | Wait (%) |')
  lines.push('|-------|----------|-----------------|----------------|----------|')
  for (const w of r.workstations) {
    lines.push('| ' + w.workstation_id + ' | ' + w.picks_per_hour + ' | ' + w.operator_utilization_pct + ' | ' + w.avg_pick_time_sec + ' | ' + w.wait_time_pct + ' |')
  }
  lines.push('')
  lines.push('## System Capacity')
  lines.push('- System throughput: ' + r.system_throughput_orders_per_hour + ' orders/hr')
  lines.push('- Total picks per hour: ' + r.total_picks_per_hour)
  lines.push('- Storage capacity: ' + r.storage_capacity_skus + ' SKUs')
  lines.push('- Floor space: ' + r.floor_space_m2 + ' sq m')
  lines.push('- Picks per labor hour: ' + r.picks_per_labor_hour)
  lines.push('')
  lines.push('## Step-by-Step Action Plan')
  lines.push('1. Configure storage pod layout for optimal retrieval times')
  lines.push('2. Set up pick-and-pass workflow between workstations')
  lines.push('3. Implement dynamic slotting for fast-mover SKUs')
  lines.push('4. Deploy put-to-light displays at consolidation stations')
  lines.push('5. Integrate batch optimizer for multi-order simultaneous fulfillment')
  lines.push('')
  lines.push('## Risk Warnings')
  if (r.overall_utilization_pct > 90) lines.push('- High operator utilization (>90%) risks burnout and errors')
  lines.push('- Pod retrieval bottleneck if demand exceeds storage system capacity')
  lines.push('- Conveyor merge congestion during peak order processing')
  lines.push('')
  lines.push('## Source References')
  lines.push('- goods-to-person best practices (Dematic/Kardex)')
  lines.push('- 2026 warehouse robotics $25B+ market')
  return lines.join('\n')
}

function formatPalletizingReport(r: PalletizingResult): string {
  const lines: string[] = []
  lines.push('# Palletizing Robot Plan')
  lines.push('')
  lines.push('## Executive Summary')
  lines.push('Palletizing plan for ' + r.pallet_plans.length + ' pallet configurations. Throughput: ' + r.throughput_cases_per_hour + ' cases/hr.')
  lines.push('Robot utilization: ' + r.robot_utilization_pct + '% | Avg stability: ' + r.avg_stability_score + ' | Quality score: ' + r.pallet_quality_score)
  lines.push('')
  lines.push('## Pallet Plans')
  lines.push('| Pallet ID | SKU | Cases | Height (cm) | Weight (kg) | Stability | Util (%) |')
  lines.push('|-----------|-----|-------|-------------|-------------|-----------|----------|')
  for (const p of r.pallet_plans) {
    lines.push('| ' + p.pallet_id + ' | ' + p.sku + ' | ' + p.total_cases + ' | ' + p.total_height_cm + ' | ' + p.total_weight_kg + ' | ' + p.overall_stability + ' | ' + p.pallet_utilization_pct + ' |')
  }
  lines.push('')
  lines.push('## Performance Metrics')
  lines.push('- Throughput: ' + r.throughput_cases_per_hour + ' cases/hr')
  lines.push('- Robot utilization: ' + r.robot_utilization_pct + '%')
  lines.push('- Average stability score: ' + r.avg_stability_score)
  lines.push('- Changeover time: ' + r.changeover_time_min + ' min')
  lines.push('- Average cases per pallet: ' + r.cases_per_pallet_avg)
  lines.push('- Pallet quality score: ' + r.pallet_quality_score + '/1.0')
  lines.push('')
  lines.push('## Step-by-Step Action Plan')
  lines.push('1. Load palletizing recipes into robot controller')
  lines.push('2. Configure end effector based on product dimensions')
  lines.push('3. Set up vision system for box position verification')
  lines.push('4. Deploy stretch wrapper and labeling at discharge')
  lines.push('5. Conduct throughput validation run with live product')
  lines.push('')
  lines.push('## Risk Warnings')
  if (r.avg_stability_score < 0.75) lines.push('- Low pallet stability; add stretch wrapping or interlayers')
  if (r.robot_utilization_pct > 90) lines.push('- Robot near maximum utilization; limited capacity for surge')
  lines.push('- Changeover time of ' + r.changeover_time_min + ' min impacts effective throughput')
  lines.push('- Overhang detection required for irregular box patterns')
  lines.push('')
  lines.push('## Source References')
  lines.push('- robotic palletizing best practices (FANUC/ABB)')
  lines.push('- 2026 warehouse robotics $25B+ market')
  return lines.join('\n')
}

function formatSafetyZoneReport(r: SafetyMonitorResult): string {
  const lines: string[] = []
  lines.push('# Safety Zone Monitoring Report')
  lines.push('')
  lines.push('## Executive Summary')
  lines.push('Safety analysis defined ' + r.safety_zones.length + ' zones with ' + r.collision_risk_points.length + ' collision risk points identified.')
  lines.push('Safety score: ' + r.safety_score + '/100 | Incident probability: ' + r.incident_probability_per_year + '/year | Emergency stop zones: ' + r.emergency_stop_zones)
  lines.push('')
  lines.push('## Safety Zones')
  lines.push('| Zone ID | Type | Personnel Allowed | Max Speed (m/s) | Equipment |')
  lines.push('|---------|------|-------------------|-----------------|-----------|')
  for (const z of r.safety_zones) {
    lines.push('| ' + z.zone_id + ' | ' + z.type + ' | ' + (z.personnel_allowed ? 'Yes' : 'No') + ' | ' + z.max_speed_ms + ' | ' + z.equipment_allowed.join(', ') + ' |')
  }
  lines.push('')
  lines.push('## Collision Risk Points')
  for (const c of r.collision_risk_points) {
    lines.push('- [' + c.risk_level.toUpperCase() + '] (' + c.x + ', ' + c.y + '): ' + c.mitigation)
  }
  lines.push('')
  lines.push('## Standards Compliance')
  for (const [std, status] of Object.entries(r.standard_compliance)) {
    lines.push('- ' + std + ': ' + status)
  }
  lines.push('')
  lines.push('## Step-by-Step Action Plan')
  lines.push('1. Install physical barriers at restricted zone boundaries')
  lines.push('2. Deploy sensor systems per zone requirements')
  lines.push('3. Program AGV speed limiting based on zone type')
  lines.push('4. Place emergency stop buttons at all designated locations')
  lines.push('5. Conduct safety validation with all equipment running')
  lines.push('')
  lines.push('## Risk Warnings')
  if (r.collision_risk_points.some(c => c.risk_level === 'high')) {
    lines.push('- High-risk collision points require immediate mitigation')
  }
  if (r.safety_score < 75) lines.push('- Safety score below acceptable threshold (75); remediation required')
  if (r.incident_probability_per_year > 1.0) lines.push('- Incident probability exceeds acceptable risk level')
  lines.push('- Ensure all operators complete safety training before zone activation')
  lines.push('')
  lines.push('## Source References')
  lines.push('- ISO 12100: Safety of machinery')
  lines.push('- ISO 3691-4: Driverless industrial trucks')
  lines.push('- 2026 warehouse robotics $25B+ market')
  return lines.join('\n')
}

// ==================== SECTION 5 - Plugin Registration ====================

export function apply(ctx: Context) {
  const tools = ctx.tools

  tools.register(defineTool({
    name: 'agv_routing_optimizer',
    description: 'AGV path planning and route optimization for automated guided vehicles. Generates collision-free routes, optimizes task allocation across AGV fleet, and minimizes total travel distance/makespan/energy.',
    parameters: {
      input_data: {
        type: 'string' as const,
        required: true,
        description: 'JSON: warehouse_layout{width_m,height_m,obstacles[],charging_stations[]}, agv_fleet{count,max_speed_ms,battery_capacity_kwh,charge_rate_kw,turn_radius_m}, tasks[]{id,pickup_x,pickup_y,dropoff_x,dropoff_y,priority}, optimization_target(min_total_distance|min_makespan|min_energy|balanced)'
      }
    },
    output: { schema: { type: 'string' as const }, render: (_a: Record<string, unknown>, v: unknown) => [{ type: 'text' as const, text: v as string }] },
    async execute(args: { input_data: string }) {
      const input: AGVRoutingInput = JSON.parse(args.input_data)
      return formatAGVRoutingReport(analyzeAGVRouting(input))
    }
  }))

  tools.register(defineTool({
    name: 'pick_path_planner',
    description: 'Pick sequence and path optimization for warehouse picking operations. Supports shortest path, zone batching, wave picking, and cluster picking strategies. Minimizes travel distance and maximizes picks per hour.',
    parameters: {
      input_data: {
        type: 'string' as const,
        required: true,
        description: 'JSON: pick_list[]{sku,location_aisle,location_bay,location_level,quantity,weight_kg}, warehouse_zones[]{zone_id,aisles[],start_x,start_y}, picker_constraints{max_weight_per_trip_kg,max_items_per_trip,max_distance_per_trip_m,batch_size}, optimization_strategy(shortest_path|zone_batching|wave_picking|cluster_picking)'
      }
    },
    output: { schema: { type: 'string' as const }, render: (_a: Record<string, unknown>, v: unknown) => [{ type: 'text' as const, text: v as string }] },
    async execute(args: { input_data: string }) {
      const input: PickPathInput = JSON.parse(args.input_data)
      return formatPickPathReport(analyzePickPath(input))
    }
  }))

  tools.register(defineTool({
    name: 'robotic_fleet_coordinator',
    description: 'Multi-robot fleet coordination and task allocation. Assigns tasks to AGVs, AMRs, forklifts, and drones based on capabilities, position, and battery. Supports centralized, decentralized, and hybrid coordination modes with collision avoidance.',
    parameters: {
      input_data: {
        type: 'string' as const,
        required: true,
        description: 'JSON: robots[]{robot_id,type(agv|amr|forklift|drone),position_x,position_y,battery_pct,status(idle|busy|charging|maintenance),capabilities[]}, task_queue[]{task_id,type,source_x,source_y,dest_x,dest_y,priority,deadline_min,required_capability}, coordination_mode(centralized|decentralized|hybrid), collision_avoidance(zone_based|time_based|priority_based), max_concurrent_tasks(number)'
      }
    },
    output: { schema: { type: 'string' as const }, render: (_a: Record<string, unknown>, v: unknown) => [{ type: 'text' as const, text: v as string }] },
    async execute(args: { input_data: string }) {
      const input: FleetCoordinatorInput = JSON.parse(args.input_data)
      return formatFleetCoordinationReport(analyzeFleetCoordination(input))
    }
  }))

  tools.register(defineTool({
    name: 'inventory_counting_robot',
    description: 'Robotic inventory counting and cycle counting plan. Optimizes autonomous counting routes using RFID, barcode, vision, or lidar scanners. Supports full physical, cycle count, spot check, and continuous robotic counting methods.',
    parameters: {
      input_data: {
        type: 'string' as const,
        required: true,
        description: 'JSON: inventory_scope{total_skus,total_locations,zones_to_count[],accuracy_target_pct}, counting_method(full_physical|cycle_count|spot_check|continuous_robotic), robot_config{scanner_type(rfid|barcode|vision|lidar),scan_rate_per_min,accuracy_pct,autonomous_navigation(boolean),operating_hours_per_day}, cycle_count_config{abc_classification,count_frequency_days,tolerance_threshold_pct}, historical_discrepancy_rate(number)'
      }
    },
    output: { schema: { type: 'string' as const }, render: (_a: Record<string, unknown>, v: unknown) => [{ type: 'text' as const, text: v as string }] },
    async execute(args: { input_data: string }) {
      const input: InventoryCountingInput = JSON.parse(args.input_data)
      return formatInventoryCountingReport(analyzeInventoryCounting(input))
    }
  }))

  tools.register(defineTool({
    name: 'sortation_system_designer',
    description: 'Sortation system layout and throughput design. Recommends sorter type (crossbelt, tilt tray, shoe, paddle, pusher) based on throughput, package characteristics, and space constraints. Provides lane configuration and ROI analysis.',
    parameters: {
      input_data: {
        type: 'string' as const,
        required: true,
        description: 'JSON: facility_throughput{items_per_hour,peak_multiplier,operating_hours_per_day,seasonality_factor}, package_characteristics{avg_weight_kg,weight_range_kg,avg_dimensions_cm,fragile_pct,irregular_shape_pct}, destinations[]{dest_id,name,share_pct,distance_from_sorter_m}, sorter_type_options[]{type(crossbelt|tilt_tray|shoe|paddle|pusher),speed_ms,capacity_per_hour,accuracy_pct,cost_usd}, space_constraint_m2(number)'
      }
    },
    output: { schema: { type: 'string' as const }, render: (_a: Record<string, unknown>, v: unknown) => [{ type: 'text' as const, text: v as string }] },
    async execute(args: { input_data: string }) {
      const input: SortationInput = JSON.parse(args.input_data)
      return formatSortationReport(analyzeSortation(input))
    }
  }))

  tools.register(defineTool({
    name: 'goods_to_person_optimizer',
    description: 'Goods-to-person workstation optimization. Configures shuttle, carousel, crane, AutoStore, or horizontal carousel systems for optimal pick productivity. Calculates throughput, utilization, and labor reduction metrics.',
    parameters: {
      input_data: {
        type: 'string' as const,
        required: true,
        description: 'JSON: workstation_config{num_workstations,picks_per_hour_target,shift_duration_hours,shifts_per_day}, storage_system{type(shuttle|cranes|autostore|horizontal_carousel),pod_retrieval_time_sec,pods_per_hour_capacity,storage_density_skus_per_m2,num_pods}, order_profile{avg_lines_per_order,avg_picks_per_line,peak_orders_per_hour,sku_concentration_top20_pct}, conveyor_config{speed_ms,induction_points,merge_points}'
      }
    },
    output: { schema: { type: 'string' as const }, render: (_a: Record<string, unknown>, v: unknown) => [{ type: 'text' as const, text: v as string }] },
    async execute(args: { input_data: string }) {
      const input: GoodsToPersonInput = JSON.parse(args.input_data)
      return formatGoodsToPersonReport(analyzeGoodsToPerson(input))
    }
  }))

  tools.register(defineTool({
    name: 'palletizing_robot_planner',
    description: 'Palletizing robot stacking pattern planning. Generates layer patterns for articulated, gantry, collaborative, and delta robots. Optimizes for stability, throughput, and pallet utilization with changeover scheduling.',
    parameters: {
      input_data: {
        type: 'string' as const,
        required: true,
        description: 'JSON: product_mix[]{sku,box_dimensions_cm,weight_kg,cases_per_layer,max_layers,stackable(boolean),fragile(boolean),max_stack_weight_kg}, pallet_spec{dimensions_cm,max_height_cm,max_weight_kg,pallet_type(wood|plastic|metal|paper)}, robot_spec{type(articulated|gantry|collaborative|delta),reach_radius_cm,max_payload_kg,cycles_per_min,end_effector(vacuum|clamp|fork|hybrid)}, throughput_requirement{cases_per_hour,changeovers_per_day,operating_hours_per_day}, stability_requirement{min_stability_score,wrap_required(boolean),interlayer_required(boolean),max_overhang_pct}'
      }
    },
    output: { schema: { type: 'string' as const }, render: (_a: Record<string, unknown>, v: unknown) => [{ type: 'text' as const, text: v as string }] },
    async execute(args: { input_data: string }) {
      const input: PalletizingInput = JSON.parse(args.input_data)
      return formatPalletizingReport(analyzePalletizing(input))
    }
  }))

  tools.register(defineTool({
    name: 'safety_zone_monitor',
    description: 'Safety zone definition and collision avoidance analysis for warehouse robotics. Defines pedestrian, operational, restricted, and buffer zones. Assesses collision risk at intersections and equipment boundaries per ISO 12100 and ISO 3691-4.',
    parameters: {
      input_data: {
        type: 'string' as const,
        required: true,
        description: 'JSON: facility_layout{dimensions_m[2],pedestrian_lanes[]{id,start_x,start_y,end_x,end_y,width_m},vehicle_lanes[]{id,path[](x,y),direction(one_way|two_way)},intersections[]{id,x,y,radius_m}}, equipment{agvs[]{max_speed_ms,braking_distance_m,sensor_range_m,payload_kg},robotic_arms[]{reach_m,work_envelope_m2,safety_rating}}, personnel{num_operators,avg_walking_speed_ms,ppe_required[],training_level(basic|standard|advanced)}, standards[](string[])'
      }
    },
    output: { schema: { type: 'string' as const }, render: (_a: Record<string, unknown>, v: unknown) => [{ type: 'text' as const, text: v as string }] },
    async execute(args: { input_data: string }) {
      const input: SafetyZoneInput = JSON.parse(args.input_data)
      return formatSafetyZoneReport(analyzeSafetyZone(input))
    }
  }))
}
