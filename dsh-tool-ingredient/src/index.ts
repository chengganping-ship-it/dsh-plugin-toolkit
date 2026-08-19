/**
 * DSH Ingredient Compliance Scanner Plugin v0.1.0
 *
 * Comprehensive ingredient parsing, regulatory compliance checking, allergen detection,
 * nutrition analysis, cosmetic safety scoring, label auditing, and alternative finding
 * for DeepSeek Harness Agent. Designed for food scientists, cosmetic formulators,
 * regulatory affairs specialists, and compliance officers.
 *
 * Features (v0.1.0):
 * - Ingredient Parser (INCI names, CAS numbers, classifications)
 * - Regulatory Compliance Checker (multi-market violation detection)
 * - Allergen Scanner (match detection with severity assessment)
 * - Banned Substance Detector (restricted substance identification)
 * - Nutrition Analyzer (daily value computation and grading)
 * - Cosmetic Safety Scorer (irritation and comedogenic potential)
 * - Label Compliance Audit (market-specific label requirement checking)
 * - Alternative Ingredient Finder (ranked substitute recommendations)
 *
 * @module dsh-tool-ingredient
 * @version 0.1.0
 * @license MIT
 */

import type { Context } from '@deepseek-ai/cordis'
import { defineTool } from '@deepseek-ai/dsh-tools'

export const name = 'dsh-tool-ingredient'
export const inject = ['tools']

/* ============================================================================
   KNOWLEDGE BASES
   ============================================================================ */

const COMMON_ALLERGENS: Record<string, { severity: 'high' | 'medium' | 'low'; sources: string[]; label_required: boolean }> = {
  milk: { severity: 'high', sources: ['whey', 'casein', 'lactose', 'milk powder', 'butter', 'cream'], label_required: true },
  eggs: { severity: 'high', sources: ['albumin', 'lysozyme', 'lecithin (egg)', 'ovalbumin'], label_required: true },
  peanuts: { severity: 'high', sources: ['arachis oil', 'peanut butter', 'peanut protein'], label_required: true },
  'tree nuts': { severity: 'high', sources: ['almond', 'cashew', 'walnut', 'hazelnut', 'macadamia', 'pecan', 'pistachio', 'shea butter'], label_required: true },
  wheat: { severity: 'high', sources: ['gluten', 'wheat flour', 'wheat germ', 'bran', 'seitan', 'triticum'], label_required: true },
  soy: { severity: 'medium', sources: ['soy lecithin', 'soy protein', 'glycine soja', 'soybean oil', 'edamame'], label_required: true },
  fish: { severity: 'high', sources: ['fish oil', 'omega-3 (fish)', 'cod', 'salmon', 'tilapia'], label_required: true },
  shellfish: { severity: 'high', sources: ['chitosan', 'glucosamine', 'shrimp', 'crab', 'lobster'], label_required: true },
  sesame: { severity: 'medium', sources: ['sesame oil', 'sesamum indicum', 'tahini'], label_required: true },
  sulfites: { severity: 'low', sources: ['sodium bisulfite', 'potassium metabisulfite', 'sulfur dioxide'], label_required: true },
  lupin: { severity: 'medium', sources: ['lupin flour', 'lupinus'], label_required: true },
  mustard: { severity: 'medium', sources: ['mustard seed', 'brassica juncea'], label_required: true },
  celery: { severity: 'low', sources: ['celery seed', 'apium graveolens'], label_required: true },
  molluscs: { severity: 'low', sources: ['mussel', 'oyster', 'squid', 'octopus'], label_required: false }
};

const COSMETIC_BANNED_EU: Array<{ substance: string; regulation: string; reason: string; alternatives?: string[] }> = [
  { substance: 'hydroquinone', regulation: 'EU Regulation 1223/2009 Annex II', reason: 'Carcinogenic and mutagenic', alternatives: ['arbutin', 'kojic acid', 'azelaic acid', 'tranexamic acid'] },
  { substance: 'tretinoin', regulation: 'EU Regulation 1223/2009 Annex II', reason: 'Prescription drug' },
  { substance: 'mercury compounds', regulation: 'EU Regulation 1223/2009 Annex II', reason: 'Neurotoxic' },
  { substance: 'formaldehyde (>0.001% rinse-off)', regulation: 'EU Regulation 1223/2009 Annex V', reason: 'Carcinogenic', alternatives: ['DMDM hydantoin-free alternatives', 'sodium hydroxymethylglycinate'] },
  { substance: 'triclosan (cosmetic leave-on)', regulation: 'EU Regulation 1223/2009 Annex V', reason: 'Endocrine disruptor' },
  { substance: 'methylisothiazolinone (leave-on)', regulation: 'EU Commission Regulation 2016/1198', reason: 'Strong sensitizer' },
  { substance: 'butylated hydroxyanisole (BHA) >0.15%', regulation: 'EU Restricted', reason: 'Endocrine disruption concerns' }
];

const FOOD_BANNED_ADDITIVES_US: Array<{ substance: string; regulation: string; reason: string; alternatives?: string[] }> = [
  { substance: 'red dye #2', regulation: 'FDA 21 CFR 74', reason: 'Banned since 1976 - carcinogenic' },
  { substance: 'brominated vegetable oil (BVO)', regulation: 'FDA 21 CFR 73.45', reason: 'Banned 2024 - neurological risk', alternatives: ['glycerol ester of wood rosin', 'damar gum'] },
  { substance: 'potassium bromate', regulation: 'FDA Not GRAS', reason: 'Possible carcinogen - ban pending', alternatives: ['ascorbic acid', 'glucose oxidase'] },
  { substance: 'propylparaben in foods', regulation: 'CA AB 418', reason: 'Endocrine disruptor - banned in California' }
];

const SUPPLEMENT_BANNED_US: Array<{ substance: string; regulation: string; reason: string; alternatives?: string[] }> = [
  { substance: 'ephedra', regulation: 'FDA 21 CFR 119', reason: 'Cardiovascular risk - banned 2004' },
  { substance: 'kava kava (unapproved)', regulation: 'FDA Warning 2002', reason: 'Hepatotoxicity' },
  { substance: 'comfrey', regulation: 'FDA Letter 2001', reason: 'Pyrrolizidine alkaloids - hepatotoxic' },
  { substance: 'aristolochic acid', regulation: 'FDA Guidance', reason: 'Nephrotoxic and carcinogenic' }
];

const IRRITATION_DB: Record<string, { score: number; concern: string; comedogenic: number }> = {
  'sodium lauryl sulfate': { score: 6, concern: 'Skin irritant, may cause dryness', comedogenic: 0 },
  'sodium laureth sulfate': { score: 4, concern: 'Mild irritant', comedogenic: 0 },
  'cocamidopropyl betaine': { score: 3, concern: 'Contact dermatitis potential', comedogenic: 0 },
  dimethicone: { score: 2, concern: 'Occlusive, may trap debris', comedogenic: 1 },
  'parfum (fragrance)': { score: 5, concern: 'Common allergen, sensitization', comedogenic: 0 },
  limonene: { score: 4, concern: 'Phototoxic, oxidation allergen', comedogenic: 0 },
  linalool: { score: 3, concern: 'Oxidation allergen', comedogenic: 0 },
  retinol: { score: 7, concern: 'Irritation, photosensitivity, peeling, teratogenic risk', comedogenic: 1 },
  'salicylic acid': { score: 4, concern: 'Dryness at high concentrations', comedogenic: 0 },
  'glycolic acid': { score: 5, concern: 'Exfoliation irritation, photosensitivity', comedogenic: 0 },
  'alcohol denat': { score: 6, concern: 'Barrier disruption, dryness', comedogenic: 0 },
  niacinamide: { score: 1, concern: 'Generally well tolerated', comedogenic: 0 },
  'hyaluronic acid': { score: 0, concern: 'No irritation potential', comedogenic: 0 },
  glycerin: { score: 0, concern: 'No irritation potential', comedogenic: 0 },
  phenoxyethanol: { score: 2, concern: 'Preservative sensitivity rare', comedogenic: 0 },
  methylparaben: { score: 3, concern: 'Concern about endocrine disruption', comedogenic: 0 },
  propylparaben: { score: 3, concern: 'Concern about endocrine disruption', comedogenic: 0 },
  'retinyl palmitate': { score: 5, concern: 'Phototoxicity concern', comedogenic: 2 },
  oxybenzone: { score: 5, concern: 'Endocrine disruption, coral harm', comedogenic: 0 },
  'zinc oxide': { score: 0, concern: 'No irritation potential', comedogenic: 0 },
  'titanium dioxide': { score: 0, concern: 'No irritation potential', comedogenic: 0 }
};

const ALTERNATIVE_DB: Record<string, Array<{ name: string; inci_name: string; score: number; function: string; pros: string[]; cons: string[]; estimated_cost_factor: number }>> = {
  parabens: [
    { name: 'Phenoxyethanol', inci_name: 'Phenoxyethanol', score: 85, function: 'preservative', pros: ['Broad spectrum', 'Low irritation'], cons: ['Less effective against yeast'], estimated_cost_factor: 1.2 },
    { name: 'Benzyl Alcohol', inci_name: 'Benzyl Alcohol (and) Ethylhexylglycerin', score: 80, function: 'preservative', pros: ['Natural origin', 'Mild'], cons: ['Requires co-preservative'], estimated_cost_factor: 1.1 },
    { name: 'Potassium Sorbate', inci_name: 'Potassium Sorbate', score: 75, function: 'preservative', pros: ['Natural', 'Well-tolerated'], cons: ['Weak alone, needs pairing'], estimated_cost_factor: 0.8 },
    { name: 'Rosemary Extract', inci_name: 'Rosmarinus Officinalis Leaf Extract', score: 70, function: 'antioxidant/preservative', pros: ['Natural', 'Multifunctional'], cons: ['Weak preservative alone', 'Color/odor impact'], estimated_cost_factor: 1.5 }
  ],
  sulfates: [
    { name: 'Sodium Coco-Sulfate', inci_name: 'Sodium Coco-Sulfate', score: 88, function: 'surfactant', pros: ['Sulfate-free marketing', 'Good foam'], cons: ['Still an irritant for some'], estimated_cost_factor: 1.3 },
    { name: 'Cocamidopropyl Betaine', inci_name: 'Cocamidopropyl Betaine', score: 85, function: 'surfactant', pros: ['Very mild', 'Good foam booster'], cons: ['Allergen potential'], estimated_cost_factor: 1.0 },
    { name: 'Sodium Cocoyl Isethionate', inci_name: 'Sodium Cocoyl Isethionate', score: 80, function: 'surfactant', pros: ['Extremely mild', 'Luxurious feel'], cons: ['Lower foam', 'Higher cost'], estimated_cost_factor: 2.0 }
  ],
  silicones: [
    { name: 'Hemisqualane', inci_name: 'Hemisqualane', score: 90, function: 'emollient', pros: ['Bio-identical feel', 'Sustainable'], cons: ['Higher cost'], estimated_cost_factor: 2.0 },
    { name: 'Squalane', inci_name: 'Squalane', score: 88, function: 'emollient', pros: ['Natural', 'Lightweight', 'Non-comedogenic'], cons: ['Olive-derived cost varies'], estimated_cost_factor: 1.8 },
    { name: 'Caprylic/Capric Triglyceride', inci_name: 'Caprylic/Capric Triglyceride', score: 82, function: 'emollient', pros: ['Lightweight', 'Natural', 'Inexpensive'], cons: ['Less slip than silicones'], estimated_cost_factor: 0.9 }
  ],
  oxybenzone: [
    { name: 'Zinc Oxide', inci_name: 'Zinc Oxide', score: 88, function: 'sunscreen', pros: ['Broad spectrum', 'Reef safe', 'Non-irritating'], cons: ['White cast', 'Thicker texture'], estimated_cost_factor: 1.0 },
    { name: 'Titanium Dioxide', inci_name: 'Titanium Dioxide', score: 85, function: 'sunscreen', pros: ['Reef safe', 'Photostable'], cons: ['White cast', 'Less UVA protection'], estimated_cost_factor: 0.9 },
    { name: 'Tinosorb S', inci_name: 'Bis-Ethylhexyloxyphenol Methoxyphenyl Triazine', score: 92, function: 'sunscreen', pros: ['Photostable', 'Broad spectrum', 'Cosmetic elegance'], cons: ['Restricted in US', 'Higher cost'], estimated_cost_factor: 2.5 }
  ],
  petrolatum: [
    { name: 'Shea Butter', inci_name: 'Butyrospermum Parkii Butter', score: 82, function: 'emollient', pros: ['Natural', 'Nourishing', 'Vitamin rich'], cons: ['Heavier texture', 'Allergen potential'], estimated_cost_factor: 1.1 },
    { name: 'Beeswax', inci_name: 'Cera Alba', score: 75, function: 'barrier/emulsifier', pros: ['Natural', 'Barrier protection'], cons: ['Not vegan', 'Thicker texture'], estimated_cost_factor: 1.3 }
  ],
  phenoxyethanol: [
    { name: 'Benzyl Alcohol + Ethylhexylglycerin', inci_name: 'Benzyl Alcohol (and) Ethylhexylglycerin', score: 80, function: 'preservative', pros: ['Paraben-free', 'Effective'], cons: ['Slight odor'], estimated_cost_factor: 1.2 }
  ]
};

/* ============================================================================
   HELPER FUNCTIONS
   ============================================================================ */

function detectProductType (raw: string): string {
  const lower = raw.toLowerCase();
  const cosmeticIndicators = ['water', 'glycerin', 'niacinamide', 'dimethicone', 'caprylic', 'phenoxyethanol', 'carbomer', 'cetyl alcohol'];
  const supplementIndicators = ['mcg', 'iu', 'capsule', 'extract', 'vitamin', 'mineral', 'probiotic'];
  const foodIndicators = ['flour', 'sugar', 'salt', 'yeast', 'enzyme', 'starch'];

  const cosmeticScore = cosmeticIndicators.filter(i => lower.includes(i)).length;
  const supplementScore = supplementIndicators.filter(i => lower.includes(i)).length;
  const foodScore = foodIndicators.filter(i => lower.includes(i)).length;

  if (cosmeticScore >= 2 && cosmeticScore > supplementScore) return 'cosmetic';
  if (supplementScore >= 2 && supplementScore > foodScore) return 'supplement';
  if (foodScore >= 2) return 'food';
  return 'food';
}

function inferINCI (name: string): string {
  const inciMap: Record<string, string> = {
    water: 'Aqua', glycerin: 'Glycerin', 'sodium chloride': 'Sodium Chloride',
    'citric acid': 'Citric Acid', 'sodium benzoate': 'Sodium Benzoate',
    'potassium sorbate': 'Potassium Sorbate', 'sodium hydroxide': 'Sodium hydroxide',
    'cocamidopropyl betaine': 'Cocamidopropyl Betaine', dimethicone: 'Dimethicone',
    niacinamide: 'Niacinamide', tocopherol: 'Tocopherol', retinol: 'Retinol',
    'hyaluronic acid': 'Sodium Hyaluronate', 'zinc oxide': 'Zinc Oxide',
    'salicylic acid': 'Salicylic Acid', 'ascorbic acid': 'Ascorbic Acid',
    phenoxyethanol: 'Phenoxyethanol', 'cetyl alcohol': 'Cetyl Alcohol',
    'stearic acid': 'Stearic Acid', 'glyceryl stearate': 'Glyceryl Stearate',
    carbomer: 'Carbomer', 'xanthan gum': 'Xanthan Gum',
    'sodium lauryl sulfate': 'Sodium Lauryl Sulfate',
    'sodium laureth sulfate': 'Sodium Laureth Sulfate',
    'cetearyl alcohol': 'Cetearyl Alcohol',
    'caprylic/capric triglyceride': 'Caprylic/Capric Triglyceride',
    'butyrospermum parkii': 'Butyrospermum Parkii (Shea) Butter',
    'simmondsia chinensis': 'Simmondsia Chinensis (Jojoba) Seed Oil',
    'aloe barbadensis': 'Aloe Barbadensis Leaf Juice',
    'helianthus annuus': 'Helianthus Annuus (Sunflower) Seed Oil',
    'tocopheryl acetate': 'Tocopheryl Acetate', panthenol: 'Panthenol',
    allantoin: 'Allantoin', bisabolol: 'Bisabolol',
    squalane: 'Squalane', ceramide: 'Ceramide NP',
    caffeine: 'Caffeine', 'benzyl alcohol': 'Benzyl Alcohol',
    'ethylhexylglycerin': 'Ethylhexylglycerin', parfum: 'Parfum (Fragrance)',
    fragrance: 'Parfum', 'propylene glycol': 'Propylene Glycol',
    'butylene glycol': 'Butylene Glycol', menthol: 'Menthol', camphor: 'Camphor'
  };
  return inciMap[name.toLowerCase()] || name.charAt(0).toUpperCase() + name.slice(1);
}

function inferCAS (name: string): string {
  const casMap: Record<string, string> = {
    water: '7732-18-5', glycerin: '56-81-5', 'sodium chloride': '7647-14-5',
    'citric acid': '77-92-9', 'sodium benzoate': '532-32-1', 'potassium sorbate': '24634-61-5',
    'sodium hydroxide': '1310-73-2', dimethicone: '9006-65-9', niacinamide: '98-92-0',
    tocopherol: '59-02-9', retinol: '68-26-8', 'ascorbic acid': '50-81-7',
    phenoxyethanol: '122-99-6', 'cetyl alcohol': '36653-82-4', 'stearic acid': '57-11-4',
    carbomer: '9003-01-4', 'xanthan gum': '11138-66-2', 'zinc oxide': '1314-13-2',
    'salicylic acid': '69-72-7', 'hyaluronic acid': '9004-61-9', caffeine: '58-08-2',
    alcohol: '64-17-5', 'benzyl alcohol': '100-51-6', menthol: '89-78-1',
    parfum: 'N/A'
  };
  return casMap[name.toLowerCase()] || 'N/A - Unknown';
}

function classifyIngredient (name: string): string {
  const naturalIngredients = ['aloe', 'oil', 'butter', 'extract', 'juice', 'wax', 'honey', 'protein', 'flour', 'herb', 'root', 'seed', 'flower', 'leaf', 'fruit', 'berry'];
  const syntheticIngredients = ['polymer', 'petrolatum', 'paraben', 'sulfate', 'phosphate', 'dimethicone', 'PEG-', 'oxybenzone'];

  for (const s of syntheticIngredients) {
    if (name.toLowerCase().includes(s)) return 'synthetic';
  }
  for (const n of naturalIngredients) {
    if (name.toLowerCase().includes(n)) return 'natural';
  }
  return 'semi-synthetic';
}

function inferFunction (name: string): string {
  const lower = name.toLowerCase();
  if (lower.includes('benzoate') || lower.includes('sorbate') || lower.includes('phenoxyethanol') || lower.includes('paraben')) return 'preservative';
  if (lower.includes('sulfate') || lower.includes('betaine')) return 'surfactant';
  if (lower.includes('glycerin') || lower.includes('hyaluronic') || lower.includes('squalane')) return 'humectant';
  if (lower.includes('niacinamide') || lower.includes('retinol') || lower.includes('acid') || lower.includes('vitamin') || lower.includes('peptide') || lower.includes('caffeine')) return 'active';
  if (lower.includes('alcohol') || lower.includes('cetyl') || lower.includes('cetearyl')) return 'emulsifier';
  if (lower.includes('dimethicone') || lower.includes('silicone')) return 'emollient';
  if (lower.includes('oil') || lower.includes('butter') || lower.includes('wax')) return 'emollient';
  if (lower.includes('oxide') || lower.includes('titanium')) return 'colorant/sunscreen';
  if (lower.includes('xanthan') || lower.includes('carbomer') || lower.includes('cellulose')) return 'thickener';
  if (lower.includes('parfum') || lower.includes('fragrance') || lower.includes('essential')) return 'fragrance';
  if (lower.includes('water') || lower.includes('aqua')) return 'solvent';
  return 'other';
}

function extractConcentration (item: string): string | undefined {
  const match = item.match(/\(([^%]+%[^)]*)\)/) || item.match(/(\d+\.?\d*%)/);
  return match ? match[1] : undefined;
}

function checkMarketViolations (ingredient: string, productType: string, market: string, concentration?: string): { violations: Array<{ ingredient: string; rule: string; severity: string; regulation_ref: string }>; warnings: string[] } {
  const violations: Array<{ ingredient: string; rule: string; severity: string; regulation_ref: string }> = [];
  const warnings: string[] = [];

  if (market === 'EU' || market === 'UK') {
    if (ingredient.includes('methylisothiazolinone') && productType === 'cosmetic') {
      const conc = parseFloat(concentration || '0');
      if (conc > 0.0015 || (concentration?.includes('leave-on'))) {
        violations.push({ ingredient, rule: 'MI banned in leave-on cosmetics', severity: 'critical', regulation_ref: 'EU Regulation 2016/1198' });
      }
    }
    if (ingredient.includes('titanium dioxide') && productType === 'food') {
      violations.push({ ingredient, rule: 'E171 banned as food additive in EU', severity: 'critical', regulation_ref: 'EU Regulation 2022/63' });
    }
    if (ingredient.includes('microplastic') || ingredient.includes('polyethylene') || ingredient.includes('polypropylene')) {
      violations.push({ ingredient, rule: 'Intentionally added microplastics restricted', severity: 'critical', regulation_ref: 'EU REACH Restriction' });
    }
  }

  if (market === 'US') {
    if (ingredient.includes('triclosan') && productType === 'food') {
      violations.push({ ingredient, rule: 'Triclosan banned in antiseptic washes', severity: 'critical', regulation_ref: 'FDA 21 CFR 310.545' });
    }
  }

  return { violations, warnings };
}

function fuzzyMatch (a: string, b: string, threshold: number): boolean {
  const wordsA = a.split(/\s+/);
  const wordsB = b.split(/\s+/);
  let matches = 0;
  for (const wa of wordsA) {
    if (wordsB.some((wb: string) => wa.includes(wb) || wb.includes(wa))) matches++;
  }
  return matches / Math.max(wordsA.length, 1) >= threshold;
}

function findClosestIngredient (name: string): { score: number; concern: string; comedogenic: number } | null {
  let bestMatch: { score: number; concern: string; comedogenic: number } | null = null;
  let bestScore = 0;

  for (const [key, value] of Object.entries(IRRITATION_DB)) {
    if (name.includes(key) || key.includes(name)) {
      const similarity = Math.min(name.length, key.length) / Math.max(name.length, key.length);
      if (similarity > bestScore && similarity > 0.6) {
        bestScore = similarity;
        bestMatch = value;
      }
    }
  }
  return bestMatch;
}

function getDefaultAlternatives (substance: string): string[] {
  const altMap: Record<string, string[]> = {
    hydroquinone: ['arbutin', 'kojic acid', 'azelaic acid', 'tranexamic acid'],
    formaldehyde: ['DMDM hydantoin-free alternatives', 'sodium hydroxymethylglycinate'],
    parabens: ['phenoxyethanol', 'benzyl alcohol', 'ethylhexylglycerin', 'potassium sorbate'],
    sulfates: ['sodium cocoyl isethionate', 'cocamidopropyl betaine', 'sodium coco-sulfate'],
    oxybenzone: ['zinc oxide', 'titanium dioxide', 'avobenzone', 'tinosorb'],
    silicones: ['hemisqualane', 'squalane', 'caprylic/capric triglyceride'],
    petrolatum: ['shea butter', 'cocoa butter', 'beeswax', 'plant oils']
  };
  for (const [key, alts] of Object.entries(altMap)) {
    if (substance.toLowerCase().includes(key)) return alts;
  }
  return ['Consult formulator for suitable alternative'];
}

function generateNutritionWarnings (data: Record<string, number>): string[] {
  const warnings: string[] = [];
  if (data.sodium && (data.sodium / 2300) * 100 > 25) warnings.push('High sodium content (>25% DV)');
  if (data.sugar && (data.sugar / 50) * 100 > 25) warnings.push('High sugar content (>25% DV)');
  if (data.saturated_fat && (data.saturated_fat / 20) * 100 > 25) warnings.push('High saturated fat (>25% DV)');
  if (data.fiber && (data.fiber / 28) * 100 < 5 && data.fiber > 0) warnings.push('Low fiber content (<5% DV)');
  if (data.protein && (data.protein / 50) * 100 > 30) warnings.push('High protein content - excellent for satiety');
  return warnings;
}

function findAlternatives (target: string, cons: { must_avoid: string[]; desired_properties: string[]; natural_only?: boolean; budget_level?: string }): Array<{ name: string; inci_name: string; score: number; function: string; pros: string[]; cons: string[]; estimated_cost_factor: number }> {
  let candidates = ALTERNATIVE_DB[target] || [];

  if (candidates.length === 0) {
    for (const [key, alts] of Object.entries(ALTERNATIVE_DB)) {
      if (target.includes(key) || key.includes(target)) {
        candidates = alts;
        break;
      }
    }
  }

  if (candidates.length === 0) {
    candidates = [
      { name: `Plant-Based Alternative`, inci_name: `Natural ${target} Replacement`, score: 60, function: 'alternative', pros: ['Natural origin'], cons: ['May require reformulation'], estimated_cost_factor: 1.5 },
      { name: `Bio-Engineered Substitute`, inci_name: `Fermented Alternative`, score: 55, function: 'alternative', pros: ['Sustainable', 'Innovative'], cons: ['Higher cost', 'Limited supply'], estimated_cost_factor: 2.0 }
    ];
  }

  let filtered = candidates;

  if (cons.must_avoid && cons.must_avoid.length > 0) {
    filtered = filtered.filter(alt =>
      !cons.must_avoid.some(avoid =>
        alt.name.toLowerCase().includes(avoid.toLowerCase()) ||
        alt.inci_name.toLowerCase().includes(avoid.toLowerCase())
      )
    );
  }

  if (cons.natural_only) {
    filtered = filtered.filter(alt => {
      const prosText = alt.pros.join(' ').toLowerCase();
      return prosText.includes('natural') || prosText.includes('plant') || prosText.includes('bio');
    });
  }

  if (cons.budget_level === 'low') {
    filtered = filtered.filter(alt => alt.estimated_cost_factor <= 1.2);
  }

  if (cons.desired_properties && cons.desired_properties.length > 0) {
    filtered = filtered.map(alt => {
      const propertyMatches = cons.desired_properties.filter(prop =>
        alt.pros.join(' ').toLowerCase().includes(prop.toLowerCase()) ||
        alt.function.toLowerCase().includes(prop.toLowerCase())
      ).length;
      return { ...alt, score: Math.min(100, alt.score + propertyMatches * 5) };
    });
  }

  return filtered.sort((a, b) => b.score - a.score);
}

function validateClaims (claims: string[], productType: string, _market: string): string[] {
  const warnings: string[] = [];
  const absoluteClaims = ['100% natural', 'chemical-free', 'guaranteed', 'miracle', 'instant results', 'clinically proven'];

  for (const claim of claims) {
    const claimLower = claim.toLowerCase();
    for (const abs of absoluteClaims) {
      if (claimLower.includes(abs)) {
        warnings.push(`Unsubstantiated absolute claim: "${claim}"`);
      }
    }
    if (productType === 'cosmetic' && claimLower.includes('dermatologically tested')) {
      warnings.push(`"Dermatologically tested" should specify test parameters in target market`);
    }
  }
  return warnings;
}

/* ============================================================================
   TOOL EXECUTORS
   ============================================================================ */

function executeIngredientParser (rawIngredients: string, productType?: string): string {
  const items = rawIngredients.split(/[,;\n]+/).map(s => s.trim()).filter(Boolean);
  const detectedType = productType || detectProductType(rawIngredients);

  const parsed = items.map(item => {
    const cleaned = item.replace(/\(.*?\)/g, '').trim().toLowerCase();
    return {
      inci_name: inferINCI(cleaned),
      cas_number: inferCAS(cleaned),
      classification: classifyIngredient(cleaned),
      function: inferFunction(cleaned),
      concentration: extractConcentration(item)
    };
  });

  const result = {
    product_type: detectedType,
    total_ingredients: parsed.length,
    ingredients: parsed,
    summary: {
      natural_count: parsed.filter(i => i.classification === 'natural').length,
      synthetic_count: parsed.filter(i => i.classification === 'synthetic').length,
      preservative_count: parsed.filter(i => i.function === 'preservative').length,
      active_count: parsed.filter(i => i.function === 'active').length
    }
  };

  return JSON.stringify(result, null, 2);
}

function executeRegulatoryCompliance (ingredientsJson: string, marketsJson: string, productType: string): string {
  let ingredientList: Array<{ name: string; cas?: string; concentration?: string }>;
  let markets: string[];

  try {
    ingredientList = JSON.parse(ingredientsJson);
  } catch {
    return JSON.stringify({ error: 'Invalid ingredients JSON format' });
  }

  try {
    markets = JSON.parse(marketsJson);
  } catch {
    return JSON.stringify({ error: 'Invalid target_markets JSON format' });
  }

  const results = markets.map(market => {
    const allViolations: Array<{ ingredient: string; rule: string; severity: string; regulation_ref: string }> = [];
    const allWarnings: string[] = [];

    for (const ing of ingredientList) {
      const ingName = ing.name.toLowerCase().trim();
      const checkResult = checkMarketViolations(ingName, productType, market, ing.concentration);
      allViolations.push(...checkResult.violations);
      allWarnings.push(...checkResult.warnings);
    }

    const marketNames: Record<string, string> = {
      US: 'United States (FDA)', EU: 'European Union', UK: 'United Kingdom',
      JP: 'Japan (PMDA)', CN: 'China (NMPA)', KR: 'South Korea (MFDS)',
      AU: 'Australia (TGA)', CA: 'Canada (Health Canada)', BR: 'Brazil (ANVISA)'
    };

    return {
      market,
      market_name: marketNames[market] || market,
      is_compliant: allViolations.filter(v => v.severity === 'critical').length === 0,
      violations: allViolations,
      warnings: allWarnings
    };
  });

  const summary = {
    total_markets: results.length,
    fully_compliant: results.filter(r => r.is_compliant && r.violations.length === 0).length,
    compliant_with_warnings: results.filter(r => r.is_compliant && r.violations.length > 0).length,
    non_compliant: results.filter(r => !r.is_compliant).length,
    critical_violations: results.reduce((sum, r) => sum + r.violations.filter(v => v.severity === 'critical').length, 0)
  };

  return JSON.stringify({ product_type: productType, results, summary }, null, 2);
}

function executeAllergenScanner (ingredientsJson: string, targetAllergensJson?: string): string {
  let ingredientList: string[];
  let allergensToCheck = Object.keys(COMMON_ALLERGENS);

  try {
    const parsed = JSON.parse(ingredientsJson);
    ingredientList = parsed.map((i: any) => typeof i === 'string' ? i : i.name || i.inci_name || '');
  } catch {
    return JSON.stringify({ error: 'Invalid ingredients JSON format' });
  }

  if (targetAllergensJson) {
    try {
      allergensToCheck = JSON.parse(targetAllergensJson);
    } catch {
      return JSON.stringify({ error: 'Invalid target_allergens JSON format' });
    }
  }

  const matches: Array<{ allergen: string; source_ingredient: string; severity: string; label_required: boolean; notes: string }> = [];

  for (const ingredient of ingredientList) {
    const ingLower = ingredient.toLowerCase().trim();

    for (const allergen of allergensToCheck) {
      const allergenData = COMMON_ALLERGENS[allergen];
      if (!allergenData) continue;

      if (ingLower.includes(allergen.toLowerCase()) || allergen.toLowerCase().includes(ingLower)) {
        matches.push({
          allergen,
          source_ingredient: ingredient,
          severity: allergenData.severity,
          label_required: allergenData.label_required,
          notes: `Direct match: "${ingredient}" contains or is "${allergen}"`
        });
        continue;
      }

      for (const source of allergenData.sources) {
        if (ingLower.includes(source) || source.includes(ingLower)) {
          matches.push({
            allergen,
            source_ingredient: ingredient,
            severity: allergenData.severity,
            label_required: allergenData.label_required,
            notes: `Hidden source: "${ingredient}" is a known source of "${allergen}" (matched: "${source}")`
          });
          break;
        }
      }
    }
  }

  const summary = {
    total_ingredients_scanned: ingredientList.length,
    allergens_checked: allergensToCheck.length,
    total_matches: matches.length,
    high_severity: matches.filter(m => m.severity === 'high').length,
    medium_severity: matches.filter(m => m.severity === 'medium').length,
    low_severity: matches.filter(m => m.severity === 'low').length,
    labeling_required: matches.filter(m => m.label_required).length,
    allergens_detected: [...new Set(matches.map(m => m.allergen))]
  };

  return JSON.stringify({ matches, summary }, null, 2);
}

function executeBannedSubstanceDetector (ingredientsJson: string, productType: string, region: string): string {
  let ingredientList: string[];

  try {
    ingredientList = JSON.parse(ingredientsJson);
  } catch {
    return JSON.stringify({ error: 'Invalid ingredients JSON format' });
  }

  let bannedDb: Array<{ substance: string; regulation: string; reason: string; alternatives?: string[] }> = [];

  if (productType === 'cosmetic') {
    bannedDb = [...COSMETIC_BANNED_EU];
    if (region === 'US') {
      bannedDb.push(
        { substance: 'formaldehyde donors (DMDM hydantoin) in cosmetics', regulation: 'FDA Advisory', reason: 'Formaldehyde release - safety concern' },
        { substance: 'methylene glycol', regulation: 'FDA Restricted', reason: 'Formaldehyde equivalent' }
      );
    }
  } else if (productType === 'food') {
    bannedDb = [...FOOD_BANNED_ADDITIVES_US];
    if (region === 'EU') {
      bannedDb.push(
        { substance: 'titanium dioxide (E171)', regulation: 'EU 2022/63', reason: 'Banned as food additive - genotoxicity concerns', alternatives: ['calcium carbonate', 'starch-based whiteners'] },
        { substance: 'potassium bromate', regulation: 'EU Not Authorized', reason: 'Banned - carcinogenic risk', alternatives: ['ascorbic acid', 'glucose oxidase'] }
      );
    }
  } else if (productType === 'supplement') {
    bannedDb = [...SUPPLEMENT_BANNED_US];
  }

  if (region === 'CN') {
    bannedDb.push(
      { substance: 'si wu he yi (certain TCM combos)', regulation: 'China CFDA', reason: 'Toxicity concerns' }
    );
  }

  const matches: Array<{ ingredient: string; substance: string; regulation: string; reason: string; alternatives: string[] }> = [];

  for (const ingredient of ingredientList) {
    const ingLower = ingredient.toLowerCase().trim();

    for (const banned of bannedDb) {
      const bannedLower = banned.substance.toLowerCase();
      if (ingLower.includes(bannedLower) || bannedLower.includes(ingLower) || fuzzyMatch(ingLower, bannedLower, 0.7)) {
        matches.push({
          ingredient,
          substance: banned.substance,
          regulation: banned.regulation,
          reason: banned.reason,
          alternatives: banned.alternatives || getDefaultAlternatives(banned.substance)
        });
      }
    }
  }

  const summary = {
    total_checked: ingredientList.length,
    banned_matches: matches.length,
    status: matches.length === 0 ? 'CLEAN' : 'BANNED_SUBSTANCES_FOUND',
    regions_covered: [region],
    market_impact: matches.length > 0 ? 'REQUIRES_REFORMULATION' : 'MARKET_READY'
  };

  return JSON.stringify({ region, product_type: productType, matches, summary }, null, 2);
}

function executeNutritionAnalyzer (nutritionDataJson: string, servingSize: string): string {
  let data: Record<string, number>;
  try {
    data = JSON.parse(nutritionDataJson);
  } catch {
    return JSON.stringify({ error: 'Invalid nutrition_data JSON format' });
  }

  const dailyValues: Record<string, { dv: number; unit: string; threshold_high: number; threshold_low: number }> = {
    fat: { dv: 78, unit: 'g', threshold_high: 20, threshold_low: 3 },
    saturated_fat: { dv: 20, unit: 'g', threshold_high: 20, threshold_low: 2.5 },
    trans_fat: { dv: 2, unit: 'g', threshold_high: 1, threshold_low: 0.5 },
    cholesterol: { dv: 300, unit: 'mg', threshold_high: 13, threshold_low: 20 },
    sodium: { dv: 2300, unit: 'mg', threshold_high: 20, threshold_low: 5 },
    carbohydrates: { dv: 275, unit: 'g', threshold_high: 20, threshold_low: 3 },
    sugar: { dv: 50, unit: 'g', threshold_high: 20, threshold_low: 5 },
    added_sugar: { dv: 50, unit: 'g', threshold_high: 20, threshold_low: 5 },
    fiber: { dv: 28, unit: 'g', threshold_high: 5, threshold_low: 5 },
    protein: { dv: 50, unit: 'g', threshold_high: 20, threshold_low: 5 },
    vitamin_d: { dv: 20, unit: 'mcg', threshold_high: 20, threshold_low: 10 },
    calcium: { dv: 1300, unit: 'mg', threshold_high: 20, threshold_low: 10 },
    iron: { dv: 18, unit: 'mg', threshold_high: 20, threshold_low: 10 },
    potassium: { dv: 4700, unit: 'mg', threshold_high: 20, threshold_low: 10 },
    vitamin_c: { dv: 90, unit: 'mg', threshold_high: 20, threshold_low: 10 },
    vitamin_a: { dv: 900, unit: 'mcg', threshold_high: 20, threshold_low: 10 },
    vitamin_b12: { dv: 2.4, unit: 'mcg', threshold_high: 20, threshold_low: 10 },
    vitamin_e: { dv: 15, unit: 'mg', threshold_high: 20, threshold_low: 10 },
    magnesium: { dv: 420, unit: 'mg', threshold_high: 20, threshold_low: 10 },
    zinc: { dv: 11, unit: 'mg', threshold_high: 20, threshold_low: 10 },
    omega_3: { dv: 1.6, unit: 'g', threshold_high: 20, threshold_low: 10 }
  };

  const results: Array<{ nutrient: string; amount: number; unit: string; daily_value_pct: number; grade: string }> = [];
  let totalDV = 0;
  let nutrientCount = 0;

  for (const [nutrient, amount] of Object.entries(data)) {
    const dvInfo = dailyValues[nutrient.toLowerCase().replace(/\s+/g, '_')];
    if (dvInfo) {
      const pct = (amount / dvInfo.dv) * 100;
      totalDV += pct;
      nutrientCount++;
      results.push({
        nutrient,
        amount,
        unit: dvInfo.unit,
        daily_value_pct: Math.round(pct * 10) / 10,
        grade: pct >= dvInfo.threshold_high ? 'high' : pct >= dvInfo.threshold_low ? 'moderate' : 'low'
      });
    } else {
      results.push({ nutrient, amount, unit: 'unknown', daily_value_pct: 0, grade: 'low' });
    }
  }

  const avgDV = nutrientCount > 0 ? totalDV / nutrientCount : 0;
  const overallScore = Math.min(100, Math.max(0, Math.round(avgDV * 2)));

  let category = 'General Food';
  if (data.protein && data.protein >= 10) category = 'High Protein Product';
  else if (data.fiber && data.fiber >= 5) category = 'High Fiber Product';
  else if (data.sodium && (data.sodium / 2300) * 100 > 30) category = 'High Sodium Product';
  else if (data.sugar && (data.sugar / 50) * 100 > 30) category = 'High Sugar Product';

  // Calculate highlights
  const highNutrients: string[] = [];
  const moderateNutrients: string[] = [];
  const lowNutrients: string[] = [];
  for (const r of results) {
    if (r.grade === 'high') highNutrients.push(r.nutrient);
    else if (r.grade === 'moderate') moderateNutrients.push(r.nutrient);
    else lowNutrients.push(r.nutrient);
  }

  return JSON.stringify({
    serving_size: servingSize,
    category,
    overall_nutritional_score: overallScore,
    nutrients: results.sort((a, b) => b.daily_value_pct - a.daily_value_pct),
    highlights: {
      high_nutrients: highNutrients,
      moderate_nutrients: moderateNutrients,
      low_nutrients: lowNutrients
    },
    warnings: generateNutritionWarnings(data)
  }, null, 2);
}

function executeCosmeticSafetyScorer (ingredientsJson: string, productType: string): string {
  let ingredientList: string[];
  try {
    ingredientList = JSON.parse(ingredientsJson);
  } catch {
    return JSON.stringify({ error: 'Invalid ingredients JSON format' });
  }

  const ingredientScores: Array<{ name: string; score: number; concern: string; comedogenic: number }> = [];
  let totalScore = 0;
  const unknownIngredients: string[] = [];

  for (const ing of ingredientList) {
    const ingLower = ing.toLowerCase().trim();
    const dbEntry = IRRITATION_DB[ingLower] || findClosestIngredient(ingLower);

    if (dbEntry) {
      ingredientScores.push({ name: ing, ...dbEntry });
      totalScore += dbEntry.score;
    } else {
      unknownIngredients.push(ing);
      ingredientScores.push({ name: ing, score: 3, concern: 'Insufficient data - exercise caution', comedogenic: 0 });
      totalScore += 3;
    }
  }

  const avgScore = ingredientList.length > 0 ? totalScore / ingredientList.length : 0;
  const maxScore = ingredientScores.length > 0 ? Math.max(...ingredientScores.map(i => i.score)) : 0;
  const totalComedogenic = ingredientScores.reduce((sum, i) => sum + i.comedogenic, 0);
  const safetyScore = Math.round(Math.max(0, 100 - (avgScore * 12)));

  let irritationPotential: string;
  if (avgScore > 5 || maxScore >= 7) irritationPotential = 'high';
  else if (avgScore > 3) irritationPotential = 'moderate';
  else irritationPotential = 'low';

  const productConcerns: string[] = [];
  if (productType === 'skincare' && ingredientScores.some(i => i.comedogenic >= 2)) {
    productConcerns.push('Comedogenic ingredients may clog pores - not recommended for acne-prone skin');
  }
  if (productType === 'suncare' && ingredientScores.some(i => i.name.includes('oxybenzone'))) {
    productConcerns.push('Chemical UV filters detected - reef-safe alternatives recommended');
  }
  if (productType === 'haircare' && ingredientScores.some(i => i.name.includes('sulfate'))) {
    productConcerns.push('Sulfates present - may cause dryness, consider SLS-free alternatives');
  }

  const concerns = [
    ...ingredientScores.filter(i => i.score >= 5).map(i => `${i.name}: ${i.concern}`),
    ...productConcerns
  ];

  let summary: string;
  if (safetyScore >= 80) summary = 'EXCELLENT - Very safe formulation';
  else if (safetyScore >= 60) summary = 'GOOD - Generally safe with minor concerns';
  else if (safetyScore >= 40) summary = 'MODERATE - Some irritants present, sensitive skin caution';
  else summary = 'REVIEW NEEDED - Multiple irritants detected, reformulation recommended';

  return JSON.stringify({
    product_type: productType,
    overall_safety_score: safetyScore,
    irritation_potential: irritationPotential,
    comedogenic_total: totalComedogenic,
    comedogenic_rating: totalComedogenic >= 5 ? 'highly comedogenic' : totalComedogenic >= 2 ? 'moderately comedogenic' : 'non-comedogenic',
    ingredient_breakdown: ingredientScores.sort((a, b) => b.score - a.score),
    concerns,
    unknown_ingredients: unknownIngredients,
    summary
  }, null, 2);
}

function executeLabelComplianceAudit (labelDataJson: string, market: string, productType: string): string {
  let labelData: any;
  try {
    labelData = JSON.parse(labelDataJson);
  } catch {
    return JSON.stringify({ error: 'Invalid label_data JSON format' });
  }

  const corrections: string[] = [];
  const missingItems: string[] = [];
  const misleadingClaims: string[] = [];
  const complianceItems: string[] = [];
  let score = 100;

  if (!labelData.product_name) {
    missingItems.push('Product name is required on all labels');
    score -= 10;
  } else {
    complianceItems.push('Product name present');
  }

  if (!labelData.net_weight) {
    missingItems.push('Net weight/volume declaration is missing (required in all markets)');
    score -= 15;
  } else {
    complianceItems.push('Net weight/volume declared');
  }

  if (!labelData.manufacturer) {
    missingItems.push('Manufacturer/distributor name and address missing');
    score -= 10;
  } else {
    complianceItems.push('Manufacturer information present');
  }

  // Product type specific
  if (productType === 'food') {
    if (!labelData.nutrition) {
      missingItems.push('Nutrition Facts panel is required for food products');
      score -= 20;
    } else {
      complianceItems.push('Nutrition Facts panel present');
      const requiredNutrients = ['fat', 'sodium', 'carbohydrates', 'protein'];
      for (const n of requiredNutrients) {
        if (labelData.nutrition[n] === undefined) {
          corrections.push(`Nutrition panel missing required nutrient: ${n}`);
          score -= 5;
        }
      }
    }

    if (!labelData.ingredients || labelData.ingredients.length === 0) {
      missingItems.push('Ingredient list is mandatory for food products');
      score -= 15;
    } else {
      complianceItems.push('Ingredient list present');
    }

    if (!labelData.allergen_statement && market !== 'JP') {
      misleadingClaims.push('Allergen declaration missing - required when allergens present');
      score -= 10;
    }

    if (market === 'US') {
      if (labelData.nutrition && labelData.nutrition.added_sugar === undefined) {
        corrections.push('FDA requires Added Sugars declaration since 2020');
        score -= 5;
      }
      if (!labelData.serving_size) {
        missingItems.push('Serving size declaration required (21 CFR 101.9)');
        score -= 10;
      }
    }

    if (market === 'EU' || market === 'UK') {
      if (labelData.nutrition && labelData.nutrition.salt === undefined) {
        corrections.push('EU requires salt declaration (not just sodium)');
        score -= 5;
      }
    }
  }

  if (productType === 'cosmetic') {
    if (!labelData.ingredients || labelData.ingredients.length === 0) {
      missingItems.push('Full INCI ingredient list mandatory (EU Regulation 1223/2009)');
      score -= 20;
    } else {
      complianceItems.push('INCI ingredient list present');
    }

    if (!labelData.expiry_info && market !== 'US') {
      corrections.push('Period After Opening (PAO) or expiry date required for cosmetics');
      score -= 5;
    }

    if (labelData.ingredients?.some((i: string) =>
      i.toLowerCase().includes('retinol') || i.toLowerCase().includes('acid'))) {
      if (!labelData.warnings || labelData.warnings.length === 0) {
        missingItems.push('Precautionary warnings required for active ingredients');
        score -= 10;
      }
    }

    if (market === 'EU' || market === 'UK') {
      if (!labelData.responsible_person) {
        missingItems.push('EU Responsible Person name and address required');
        score -= 10;
      }
      if (!labelData.nominal_content) {
        missingItems.push('Nominal content in weight or volume required');
        score -= 5;
      }
    }
  }

  if (productType === 'supplement') {
    if (!labelData.supplement_facts) {
      missingItems.push('Supplement Facts panel required (21 CFR 101.36)');
      score -= 20;
    } else {
      complianceItems.push('Supplement Facts panel present');
    }

    if (!labelData.serving_size_supplement) {
      missingItems.push('Serving size (amount per serving) required for supplements');
      score -= 10;
    }

    if (!labelData.warnings || !labelData.warnings.some((w: string) => w.toLowerCase().includes('supplement'))) {
      corrections.push('FDA disclaimer required for dietary supplement labels');
      score -= 10;
    }

    if (labelData.claims) {
      const drugClaims = ['cures', 'treats', 'prevents', 'diagnoses', 'mitigates'];
      for (const claim of labelData.claims) {
        const claimLower = claim.toLowerCase();
        if (drugClaims.some(dc => claimLower.includes(dc))) {
          misleadingClaims.push(`Drug claim detected: "${claim}" - supplements cannot make drug claims`);
          score -= 15;
        }
      }
    }
  }

  if (labelData.claims) {
    const unverifiedClaims = validateClaims(labelData.claims, productType, market);
    misleadingClaims.push(...unverifiedClaims);
    score -= unverifiedClaims.length * 5;
  }

  score = Math.max(0, Math.min(100, score));

  let grade: string;
  if (score >= 90) grade = 'A - Excellent compliance';
  else if (score >= 75) grade = 'B - Good compliance, minor fixes needed';
  else if (score >= 60) grade = 'C - Moderate compliance issues';
  else if (score >= 40) grade = 'D - Significant compliance issues';
  else grade = 'F - Major non-compliance, label requires complete revision';

  return JSON.stringify({
    market,
    product_type: productType,
    compliance_score: score,
    grade,
    corrections: corrections.slice(0, 20),
    missing_items: missingItems.slice(0, 15),
    misleading_claims: misleadingClaims.slice(0, 10),
    compliant_items: complianceItems.slice(0, 15),
    priority_actions: [...missingItems.slice(0, 3), ...misleadingClaims.slice(0, 2)]
  }, null, 2);
}

function executeAlternativeFinder (targetIngredient: string, constraintsJson: string): string {
  let cons: { must_avoid: string[]; desired_properties: string[]; natural_only?: boolean; budget_level?: string };
  try {
    cons = JSON.parse(constraintsJson);
  } catch {
    return JSON.stringify({ error: 'Invalid constraints JSON format' });
  }

  const targetLower = targetIngredient.toLowerCase().trim();
  const alternatives = findAlternatives(targetLower, cons);

  let recommendation: string;
  if (alternatives.length > 0) {
    recommendation = `Top recommendation: ${alternatives[0].name} (score: ${alternatives[0].score}/100)`;
  } else {
    recommendation = 'No alternatives found matching all constraints. Consider relaxing constraints.';
  }

  return JSON.stringify({
    target_ingredient: targetIngredient,
    constraints_applied: {
      must_avoid_count: cons.must_avoid?.length || 0,
      desired_properties: cons.desired_properties ?? [],
      natural_only: cons.natural_only || false,
      budget_level: cons.budget_level || 'medium'
    },
    alternatives_found: alternatives.length,
    alternatives: alternatives.slice(0, 10),
    recommendation
  }, null, 2);
}

/* ============================================================================
   PLUGIN REGISTRATION
   ============================================================================ */

export function apply (ctx: Context) {
  const tools = ctx.tools;

  tools.register(defineTool({
    name: 'ingredient_parser',
    description: 'Parse raw ingredient lists into structured INCI names, CAS numbers, and classifications',
    parameters: {
      raw_ingredients: { type: 'string', required: true, description: 'Raw ingredient list (comma-separated or newline-separated text)' },
      product_type: { type: 'string', description: 'Product type: "food", "cosmetic", or "supplement" (default: auto-detect)' }
    },
    output: { schema: { type: 'string' }, render: (_args, value) => [{ type: 'text', text: value as string }] },
    async execute (args: { raw_ingredients: string; product_type?: string }) {
      return executeIngredientParser(args.raw_ingredients, args.product_type);
    }
  }));

  tools.register(defineTool({
    name: 'regulatory_compliance_checker',
    description: 'Check regulatory compliance for ingredients across multiple target markets',
    parameters: {
      ingredients: { type: 'string', required: true, description: 'JSON array of ingredient objects with fields: name, cas?, concentration?' },
      target_markets: { type: 'string', required: true, description: 'JSON array of target country codes: ["US", "EU", "UK", "JP", "CN", "KR", "AU", "CA"]' },
      product_type: { type: 'string', required: true, description: 'Product type: "food", "cosmetic", or "supplement"' }
    },
    output: { schema: { type: 'string' }, render: (_args, value) => [{ type: 'text', text: value as string }] },
    async execute (args: { ingredients: string; target_markets: string; product_type: string }) {
      return executeRegulatoryCompliance(args.ingredients, args.target_markets, args.product_type);
    }
  }));

  tools.register(defineTool({
    name: 'allergen_scanner',
    description: 'Scan ingredients for known allergen matches with severity assessment and labeling requirements',
    parameters: {
      ingredients: { type: 'string', required: true, description: 'JSON array of ingredient strings or objects with fields: name, source?' },
      target_allergens: { type: 'string', description: 'Optional JSON array of specific allergens to check. If omitted, checks all 14 EU-regulated allergens' }
    },
    output: { schema: { type: 'string' }, render: (_args, value) => [{ type: 'text', text: value as string }] },
    async execute (args: { ingredients: string; target_allergens?: string }) {
      return executeAllergenScanner(args.ingredients, args.target_allergens);
    }
  }));

  tools.register(defineTool({
    name: 'banned_substance_detector',
    description: 'Detect banned or restricted substances with regulatory references and alternative suggestions',
    parameters: {
      ingredients: { type: 'string', required: true, description: 'JSON array of ingredient strings' },
      product_type: { type: 'string', required: true, description: 'Product type: "food", "cosmetic", or "supplement"' },
      region: { type: 'string', required: true, description: 'Region code: "US", "EU", "UK", "CN", "JP", "AU", or "global"' }
    },
    output: { schema: { type: 'string' }, render: (_args, value) => [{ type: 'text', text: value as string }] },
    async execute (args: { ingredients: string; product_type: string; region: string }) {
      return executeBannedSubstanceDetector(args.ingredients, args.product_type, args.region);
    }
  }));

  tools.register(defineTool({
    name: 'nutrition_analyzer',
    description: 'Analyze nutritional data per serving, compute daily value percentages, and generate nutrient grading',
    parameters: {
      nutrition_data: { type: 'string', required: true, description: 'JSON object with nutrient name-value pairs (e.g., {"fat": 10, "sodium": 500, "protein": 5, "sugar": 20})' },
      serving_size: { type: 'string', required: true, description: 'Serving size description (e.g., "100g", "1 cup (240ml)", "1 capsule")' }
    },
    output: { schema: { type: 'string' }, render: (_args, value) => [{ type: 'text', text: value as string }] },
    async execute (args: { nutrition_data: string; serving_size: string }) {
      return executeNutritionAnalyzer(args.nutrition_data, args.serving_size);
    }
  }));

  tools.register(defineTool({
    name: 'cosmetic_safety_scorer',
    description: 'Score cosmetic ingredient safety with irritation potential and comedogenic rating',
    parameters: {
      ingredients: { type: 'string', required: true, description: 'JSON array of ingredient strings (INCI names preferred)' },
      product_type: { type: 'string', required: true, description: 'Cosmetic subtype: "skincare", "haircare", "bodycare", "makeup", "suncare", or "oral_care"' }
    },
    output: { schema: { type: 'string' }, render: (_args, value) => [{ type: 'text', text: value as string }] },
    async execute (args: { ingredients: string; product_type: string }) {
      return executeCosmeticSafetyScorer(args.ingredients, args.product_type);
    }
  }));

  tools.register(defineTool({
    name: 'label_compliance_audit',
    description: 'Audit product label compliance against market-specific regulations (FDA, EU, etc.)',
    parameters: {
      label_data: { type: 'string', required: true, description: 'JSON with label content: {product_name, claims[], ingredients[], nutrition{}, warnings[], net_weight, manufacturer, directions, expiry_info}' },
      market: { type: 'string', required: true, description: 'Target market code: "US", "EU", "UK", "JP", "CN", "AU", or "CA"' },
      product_type: { type: 'string', required: true, description: 'Product type: "food", "cosmetic", or "supplement"' }
    },
    output: { schema: { type: 'string' }, render: (_args, value) => [{ type: 'text', text: value as string }] },
    async execute (args: { label_data: string; market: string; product_type: string }) {
      return executeLabelComplianceAudit(args.label_data, args.market, args.product_type);
    }
  }));

  tools.register(defineTool({
    name: 'alternative_ingredient_finder',
    description: 'Find and rank alternative ingredient substitutes based on functional constraints and dietary preferences',
    parameters: {
      target_ingredient: { type: 'string', required: true, description: 'The ingredient to find alternatives for (INCI or common name)' },
      constraints: { type: 'string', required: true, description: 'JSON with constraints: {must_avoid: string[], desired_properties: string[], natural_only?: boolean, budget_level?: "low"|"medium"|"high"}' }
    },
    output: { schema: { type: 'string' }, render: (_args, value) => [{ type: 'text', text: value as string }] },
    async execute (args: { target_ingredient: string; constraints: string }) {
      return executeAlternativeFinder(args.target_ingredient, args.constraints);
    }
  }));
}
