import React, { useState } from "react";

// Data types
interface Assessment {
  domain: string;
  points: number;
  minPoints: number;
  maxPoints: number;
}

interface DomainWeightMap {
  [domain: string]: number;
}

// Clamp function
function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

// Main scoring function
function calculateSubjectiveHealthIndex(
  assessments: Assessment[],
  domainWeights: DomainWeightMap
): number {
  const domainGroups: Record<string, Assessment[]> = {};

  for (const assessment of assessments) {
    if (!domainGroups[assessment.domain]) {
      domainGroups[assessment.domain] = [];
    }
    domainGroups[assessment.domain].push(assessment);
  }

  let weightedDomainScores: number[] = [];
  let totalMinScore = 0;
  let totalMaxScore = 0;

  for (const domain in domainGroups) {
    const domainAssessments = domainGroups[domain];

    const SRAW = domainAssessments.reduce((sum, a) => sum + a.points, 0);
    const SMIN = domainAssessments.reduce((sum, a) => sum + a.minPoints, 0);
    const SMAX = domainAssessments.reduce((sum, a) => sum + a.maxPoints, 0);

    let SNormalized = 0;
    if (SMAX !== SMIN) {
      SNormalized = -50 + ((SRAW - SMIN) / (SMAX - SMIN)) * 100;
    }

    const weight = domainWeights[domain] ?? 0;
    const weightedScore = SNormalized * weight;

    weightedDomainScores.push(weightedScore);
    totalMinScore += -50 * weight;
    totalMaxScore += 50 * weight;
  }

  const rawOverallScore = weightedDomainScores.reduce((a, b) => a + b, 0);

  let finalScore = 0;
  if (totalMaxScore !== totalMinScore) {
    finalScore =
      ((rawOverallScore - totalMinScore) / (totalMaxScore - totalMinScore)) * 100;
  }

  return clamp(finalScore, 0, 100);
}

// React component
export default function HealthScoreApp() {
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [domainWeights, setDomainWeights] = useState<DomainWeightMap>({});
  const [score, setScore] = useState<number | null>(null);

  const addAssessment = () => {
    setAssessments([...assessments, { domain: "", points: 0, minPoints: 0, maxPoints: 0 }]);
  };

  const handleAssessmentChange = (index: number, key: keyof Assessment, value: string) => {
    const updated = [...assessments];
    updated[index][key] = key === "domain" ? value : parseFloat(value);
    setAssessments(updated);
  };

  const handleWeightChange = (domain: string, value: string) => {
    setDomainWeights({ ...domainWeights, [domain]: parseFloat(value) });
  };

  const calculate = () => {
    const result = calculateSubjectiveHealthIndex(assessments, domainWeights);
    setScore(result);
  };

  return (
    <div className="p-4 max-w-2xl mx-auto">
      <h1 className="text-xl font-bold mb-4">Subjective Health & Wellness Index</h1>

      {assessments.map((a, i) => (
        <div key={i} className="grid grid-cols-5 gap-2 mb-2">
          <input
            className="border p-1"
            placeholder="Domain"
            value={a.domain}
            onChange={(e) => handleAssessmentChange(i, "domain", e.target.value)}
          />
          <input
            className="border p-1"
            placeholder="Points"
            type="number"
            value={a.points}
            onChange={(e) => handleAssessmentChange(i, "points", e.target.value)}
          />
          <input
            className="border p-1"
            placeholder="Min"
            type="number"
            value={a.minPoints}
            onChange={(e) => handleAssessmentChange(i, "minPoints", e.target.value)}
          />
          <input
            className="border p-1"
            placeholder="Max"
            type="number"
            value={a.maxPoints}
            onChange={(e) => handleAssessmentChange(i, "maxPoints", e.target.value)}
          />
          <input
            className="border p-1"
            placeholder="Weight"
            type="number"
            value={domainWeights[a.domain] ?? ""}
            onChange={(e) => handleWeightChange(a.domain, e.target.value)}
          />
        </div>
      ))}

      <button onClick={addAssessment} className="bg-blue-600 text-white px-4 py-1 rounded mr-2">
        Add Assessment
      </button>

      <button onClick={calculate} className="bg-green-600 text-white px-4 py-1 rounded">
        Calculate Index
      </button>

      {score !== null && (
        <div className="mt-4 text-lg">
          Final Subjective Health & Wellness Index Score: <strong>{score.toFixed(2)}</strong>/100
        </div>
      )}
    </div>
  );
}
