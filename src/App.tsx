import React, { useState } from "react";
import './styles.css';

// Types
interface ScoringRules {
  [domain: string]: {
    [metric: string]: [number, number];
  };
}

interface AssessmentResponses {
  [domain: string]: {
    [metric: string]: number;
  };
}

interface DomainWeights {
  [domain: string]: number;
}

// Static scoring rules and weights
const scoring_rules: ScoringRules = {
  PhysicalHealth: {
    BodyMassIndex: [+15, -30],
    BloodPressure: [+15, -25],
    ChronicConditionDiabetes: [0, -50],
    ChronicConditionHYperTension: [0, -30],
    ChronicConditionASthma: [+10, -20],
    TotalCholestrol: [+10, -15],
    LDLCholestrol: [+10, -15],
    HDLCholestrol: [+15, -10],
    Triglycerides: [+10, -15],
    HbA1c: [+20, -40],
    eGFR: [+10, -25],
    PhysicalFunction: [+10, -20]
  },
  MentalHealth: {
    PHQ9: [+15, -35],
    GAD7: [+15, -20],
    PSS10: [+10, -15],
    PSQI: [+10, -15]
  },
  LifestyleAndBehaviour: {
    SmokingStatus: [+25, -40],
    AlcoholUse: [+10, -25],
    SubstanceUse: [+10, -30],
    PhysicalActivity: [+15, -20],
    DietQuality: [+10, -15],
    FruitVegetableIntake: [+5, -5]
  },
  PreventiveCareAndScreenings: {
    Mammogram: [+10, -15],
    Colonoscopy: [+10, -15],
    CervicalCancerScreen: [+10, -15],
    ProstateCancerScreen: [+5, -5],
    VaccinationStatus: [+5, -5],
    DentalVisit: [+5, -5]
  },
  SocialAndEnvironment: {
    SocialSupport: [+10, -10],
    SocialIsolationRisk: [+10, -15],
    HousingStability: [+10, -15],
    FoodSecurity: [+10, -10],
    TransportationAccess: [+5, -5],
    EducationLevel: [+5, -5]
  }
};

const domain_weights: DomainWeights = {
  PhysicalHealth: 0.35,
  MentalHealth: 0.25,
  LifestyleAndBehaviour: 0.20,
  PreventiveCareAndScreenings: 0.10,
  SocialAndEnvironment: 0.10
};

const assessment_responses: AssessmentResponses = {
  PhysicalHealth: {
    BodyMassIndex: 5,
    BloodPressure: 7,
    ChronicConditionDiabetes: -10,
    ChronicConditionHYperTension: 0,
    ChronicConditionASthma: 10,
    TotalCholestrol: 8,
    LDLCholestrol: 7,
    HDLCholestrol: 12,
    Triglycerides: 6,
    HbA1c: 15,
    eGFR: 8,
    PhysicalFunction: 9
  },
  MentalHealth: {
    PHQ9: 12,
    GAD7: 10,
    PSS10: 8,
    PSQI: 7
  },
  LifestyleAndBehaviour: {
    SmokingStatus: 20,
    AlcoholUse: 5,
    SubstanceUse: 2,
    PhysicalActivity: 12,
    DietQuality: 8,
    FruitVegetableIntake: 3
  },
  PreventiveCareAndScreenings: {
    Mammogram: 8,
    Colonoscopy: 7,
    CervicalCancerScreen: 6,
    ProstateCancerScreen: 3,
    VaccinationStatus: 4,
    DentalVisit: 5
  },
  SocialAndEnvironment: {
    SocialSupport: 7,
    SocialIsolationRisk: 5,
    HousingStability: 8,
    FoodSecurity: 6,
    TransportationAccess: 3,
    EducationLevel: 4
  }
};

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function calculateScoreDetails(
  rules: ScoringRules,
  responses: AssessmentResponses,
  weights: DomainWeights
) {
  let totalScore = 0;
  let totalWeight = 0;
  const domainDetails: {
    [domain: string]: {
      raw: number;
      normalized: number;
    };
  } = {};

  for (const domain in responses) {
    const metrics = responses[domain];
    let domainRaw = 0;
    let domainMin = 0;
    let domainMax = 0;

    // 1. Sum total points per domain (raw)
    for (const metric in metrics) {
      const responseValue = metrics[metric];
      const [maxImpact, minImpact] = rules[domain][metric];
      // Calculate normalized score for this metric
      const metricScore = minImpact + ((responseValue / 20) * (maxImpact - minImpact));
      domainRaw += metricScore;
      domainMin += Math.min(minImpact, maxImpact);
      domainMax += Math.max(minImpact, maxImpact);
    }

    // 2. Normalize the total points per domain
    let normalizedDomainScore = 0;
    if (domainMax !== domainMin) {
      normalizedDomainScore = ((domainRaw - domainMin) / (domainMax - domainMin)) * 100;
    }

    const weight = weights[domain] || 0;
    totalScore += normalizedDomainScore * weight;
    totalWeight += weight;

    domainDetails[domain] = {
      raw: domainRaw,
      normalized: normalizedDomainScore,
    };
  }

  const finalScore = clamp((totalScore / totalWeight), 0, 100);

  return { finalScore, domainDetails };
}

// Add this type for CompletedTest
type CompletedTest = {
  [domain: string]: string[];
};

// Helper functions as per your structure
function addUpPointsForDomain(assessment_responses: AssessmentResponses): Record<string, number> {
  const result: Record<string, number> = {};
  for (const domain in assessment_responses) {
    let points = 0;
    for (const assessment in assessment_responses[domain]) {
      points += assessment_responses[domain][assessment];
    }
    result[domain] = points;
  }
  return result;
}

function getMinAndMaxPossibleScore(completedtest: CompletedTest, scoring_rules: ScoringRules): Record<string, number[]> {
  const result: Record<string, number[]> = {};
  for (const domain in completedtest) {
    let max = 0;
    let min = 0;
    for (const assessment of completedtest[domain]) {
      const maxnmin = scoring_rules[domain][assessment];
      max += maxnmin[0];
      min += maxnmin[1];
    }
    result[domain] = [max, min];
  }
  return result;
}

function normalizeScore(maxnmin: Record<string, number[]>, totalpoints: Record<string, number>): Record<string, number> {
  const result: Record<string, number> = {};
  for (const domain in maxnmin) {
    const maxscore = maxnmin[domain][0];
    const minscore = maxnmin[domain][1];
    const rawscore = totalpoints[domain];
    const normalized = (((rawscore - minscore) / (maxscore - minscore)) * 100) - 50;
    result[domain] = normalized;
  }
  return result;
}

function applyWeights(normalized: Record<string, number>, domain_weights: DomainWeights): number {
  let totalweightedscore = 0;
  let upperlimit = 0;
  let lowerlimit = 0;
  for (const domain_name in normalized) {
    const score = normalized[domain_name];
    const weight = domain_weights[domain_name];
    lowerlimit += -50 * weight;
    upperlimit += 50 * weight;
    totalweightedscore += (score * weight);
  }
  const finalweightedscore = ((totalweightedscore - lowerlimit) / (upperlimit - lowerlimit));
  return finalweightedscore;
}

function scaleTo100(result: number): number {
  const scaledscore = result * 100;
  if (scaledscore < 0) return 0;
  if (scaledscore > 100) return 100;
  return scaledscore;
}

// Utility to get CompletedTest from assessment_responses
function getCompletedTest(assessment_responses: AssessmentResponses): CompletedTest {
  const completedTest: CompletedTest = {};
  for (const domain in assessment_responses) {
    completedTest[domain] = Object.keys(assessment_responses[domain]);
  }
  return completedTest;
}

export default function HealthScoreApp() {
  const [score, setScore] = useState<number | null>(null);
  const [domainDetails, setDomainDetails] = useState<{
    [domain: string]: { raw: number; normalized: number };
  }>({});
  const [rawSums, setRawSums] = useState<Record<string, number>>({});

  const calculate = () => {
    // Step 1: Add up points per domain
    const totalPoints = addUpPointsForDomain(assessment_responses);

    // Step 2: Get min and max possible scores per domain
    const completedTest = getCompletedTest(assessment_responses);
    const minMax = getMinAndMaxPossibleScore(completedTest, scoring_rules);

    // Step 3: Normalize scores per domain
    const normalized = normalizeScore(minMax, totalPoints);

    // Step 4: Apply weights
    const weighted = applyWeights(normalized, domain_weights);

    // Step 5: Scale to 100
    const finalScore = scaleTo100(weighted);

    // For table display, prepare domainDetails
    const details: { [domain: string]: { raw: number; normalized: number } } = {};
    for (const domain in totalPoints) {
      details[domain] = {
        raw: totalPoints[domain],
        normalized: normalized[domain] ?? 0,
      };
    }

    setScore(finalScore);
    setDomainDetails(details);
    setRawSums(totalPoints);
  };

  return (
    <div className="p-4 max-w-2xl mx-auto">
      <h1 className="text-xl font-bold mb-4">Subjective Health & Wellness Index</h1>
      <button onClick={calculate} className="bg-green-600 text-white px-4 py-1 rounded">
        Calculate Index
      </button>
      {score !== null && (
        <div className="mt-4 text-lg">
          Final Subjective Health & Wellness Index Score: <strong>{score.toFixed(2)}</strong>/100
        </div>
      )}
      {score !== null && (
        <div className="mt-6">
          <h2 className="font-semibold mb-2">Domain Scores</h2>
          <table className="min-w-full border text-sm">
            <thead>
              <tr>
                <th className="border px-2 py-1">Domain</th>
                <th className="border px-2 py-1">Raw Response Total</th>
                <th className="border px-2 py-1">Total Points (Algorithm)</th>
                <th className="border px-2 py-1">Normalized Score (0-100)</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(domainDetails).map(([domain, details]) => (
                <tr key={domain}>
                  <td className="border px-2 py-1">{domain}</td>
                  <td className="border px-2 py-1">{rawSums[domain]}</td>
                  <td className="border px-2 py-1">{details.raw.toFixed(2)}</td>
                  <td className="border px-2 py-1">{details.normalized.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export { scoring_rules, domain_weights, assessment_responses, };
// This file contains the main application logic for calculating the Subjective Health & Wellness Index.
