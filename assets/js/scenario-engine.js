/**
 * Scenario Planning Calculation Engine
 * Handles what-if analysis for hiring, rebalancing, case redistribution, and on-call policies
 */

class ScenarioEngine {
  constructor(baselineData) {
    this.baseline = baselineData;
    this.current = null; // Current scenario results
  }

  /**
   * Get baseline metrics for comparison
   */
  getBaselineMetrics() {
    const totalOT = this.baseline.centers.reduce((sum, c) => sum + c.overtimeHours, 0);
    const avgCoverage = this.baseline.centers.reduce((sum, c) => sum + c.coverageRate, 0) / this.baseline.centers.length;
    const totalProviders = this.baseline.centers.reduce((sum, c) => sum + c.providers.mda + c.providers.crna, 0);

    // Calculate annual OT cost
    const mdaOTHours = this.baseline.providers
      .filter(p => p.type === 'MDA')
      .reduce((sum, p) => sum + p.overtimeHours, 0);
    const crnaOTHours = this.baseline.providers
      .filter(p => p.type === 'CRNA')
      .reduce((sum, p) => sum + p.overtimeHours, 0);

    const annualOTCost = (
      (mdaOTHours * this.baseline.costs.mdaHourlyRate * this.baseline.costs.overtimeMultiplier) +
      (crnaOTHours * this.baseline.costs.crnaHourlyRate * this.baseline.costs.overtimeMultiplier)
    ) * this.baseline.assumptions.weeksPerYear;

    return {
      overtimeHoursWeekly: totalOT,
      coverageRate: avgCoverage,
      totalProviders,
      annualOTCost,
      totalCases: this.baseline.centers.reduce((sum, c) => sum + c.casesPerWeek, 0)
    };
  }

  /**
   * Calculate impact of hiring new providers
   * @param {string} centerId - ID of center to hire for
   * @param {string} providerType - 'MDA' or 'CRNA'
   * @param {number} count - Number to hire
   * @param {number} salary - Annual salary (optional, uses default if not provided)
   */
  calculateHiringScenario(centerId, providerType, count, salary = null) {
    if (count === 0) {
      return this.getBaselineMetrics();
    }

    const center = this.baseline.centers.find(c => c.id === centerId);
    if (!center) {
      throw new Error('Center not found');
    }

    // Use provided salary or default
    const annualSalary = salary || (providerType === 'MDA' ?
      this.baseline.costs.mdaSalary :
      this.baseline.costs.crnaSalary);

    const hourlyRate = providerType === 'MDA' ?
      this.baseline.costs.mdaHourlyRate :
      this.baseline.costs.crnaHourlyRate;

    // Calculate OT reduction
    const otReductionPerHire = this.baseline.assumptions.otReductionPerHire;
    const totalOTReduction = Math.min(center.overtimeHours, count * otReductionPerHire);
    const newCenterOT = center.overtimeHours - totalOTReduction;

    // Calculate costs
    const totalHiringCost = count * annualSalary * this.baseline.costs.benefitsMultiplier;
    const annualOTSavings = totalOTReduction * this.baseline.assumptions.weeksPerYear *
                            hourlyRate * this.baseline.costs.overtimeMultiplier;
    const netAnnualImpact = annualOTSavings - totalHiringCost;
    const breakEvenMonths = netAnnualImpact < 0 ?
      Math.ceil(totalHiringCost / (annualOTSavings / 12)) : 0;

    // Calculate coverage improvement
    const coverageImprovement = Math.min(
      100 - center.coverageRate,
      count * this.baseline.assumptions.coverageImprovementPerHire
    );
    const newCoverageRate = center.coverageRate + coverageImprovement;

    // Network-wide metrics
    const baselineMetrics = this.getBaselineMetrics();
    const newNetworkOT = baselineMetrics.overtimeHoursWeekly - totalOTReduction;
    const newNetworkOTCost = baselineMetrics.annualOTCost - annualOTSavings;

    // Provider workload balance
    const currentProvidersAtCenter = center.providers.mda + center.providers.crna;
    const newProvidersAtCenter = currentProvidersAtCenter + count;
    const casesPerProvider = {
      before: center.casesPerWeek / currentProvidersAtCenter,
      after: center.casesPerWeek / newProvidersAtCenter
    };

    return {
      scenario: 'hiring',
      inputs: { centerId, centerName: center.name, providerType, count, salary: annualSalary },

      center: {
        overtimeHours: { before: center.overtimeHours, after: newCenterOT, delta: -totalOTReduction },
        coverageRate: { before: center.coverageRate, after: newCoverageRate, delta: coverageImprovement },
        providers: { before: currentProvidersAtCenter, after: newProvidersAtCenter, delta: count },
        casesPerProvider: casesPerProvider
      },

      network: {
        overtimeHoursWeekly: { before: baselineMetrics.overtimeHoursWeekly, after: newNetworkOT, delta: -totalOTReduction },
        annualOTCost: { before: baselineMetrics.annualOTCost, after: newNetworkOTCost, delta: -annualOTSavings },
        totalProviders: { before: baselineMetrics.totalProviders, after: baselineMetrics.totalProviders + count, delta: count }
      },

      financial: {
        annualHiringCost: totalHiringCost,
        annualOTSavings: annualOTSavings,
        netAnnualImpact: netAnnualImpact,
        breakEvenMonths: breakEvenMonths,
        roi: annualOTSavings > 0 ? ((annualOTSavings - totalHiringCost) / totalHiringCost * 100) : -100
      },

      recommendation: this._generateHiringRecommendation(center, count, providerType, netAnnualImpact, breakEvenMonths, totalOTReduction)
    };
  }

  /**
   * Calculate impact of rebalancing providers between centers
   */
  calculateRebalancingScenario(sourceId, destId, providerIds, timeline = 'immediate') {
    const source = this.baseline.centers.find(c => c.id === sourceId);
    const dest = this.baseline.centers.find(c => c.id === destId);

    if (!source || !dest) {
      throw new Error('Center not found');
    }

    if (providerIds.length === 0) {
      return this.getBaselineMetrics();
    }

    const providers = providerIds.map(id =>
      this.baseline.providers.find(p => p.id === id)
    ).filter(p => p !== undefined);

    const mdaCount = providers.filter(p => p.type === 'MDA').length;
    const crnaCount = providers.filter(p => p.type === 'CRNA').length;

    // Source center impact (losing providers)
    const sourceCoverageImpact = -(providers.length * 2.5);
    const sourceNewCoverage = Math.max(0, source.coverageRate + sourceCoverageImpact);

    // OT might increase at source if they lose providers
    const sourceOTIncrease = providers.length * 8; // Rough estimate
    const sourceNewOT = source.overtimeHours + sourceOTIncrease;

    // Destination center impact (gaining providers)
    const destOTReduction = Math.min(dest.overtimeHours, providers.length * 15);
    const destNewOT = dest.overtimeHours - destOTReduction;
    const destCoverageImprovement = Math.min(100 - dest.coverageRate, providers.length * 2.5);
    const destNewCoverage = dest.coverageRate + destCoverageImprovement;

    // Network-wide OT change
    const netOTChange = -destOTReduction + sourceOTIncrease;

    // Cost impact (relocation only)
    const relocationCost = providers.length * this.baseline.costs.relocationCost;

    // Calculate annual OT savings from the move
    const avgHourlyRate = (mdaCount * this.baseline.costs.mdaHourlyRate +
                          crnaCount * this.baseline.costs.crnaHourlyRate) / providers.length;
    const annualOTSavings = Math.abs(netOTChange) * this.baseline.assumptions.weeksPerYear *
                           avgHourlyRate * this.baseline.costs.overtimeMultiplier;

    const baselineMetrics = this.getBaselineMetrics();

    return {
      scenario: 'rebalancing',
      inputs: {
        sourceName: source.name,
        destName: dest.name,
        providerCount: providers.length,
        providerNames: providers.map(p => p.name),
        timeline
      },

      source: {
        overtimeHours: { before: source.overtimeHours, after: sourceNewOT, delta: sourceOTIncrease },
        coverageRate: { before: source.coverageRate, after: sourceNewCoverage, delta: sourceCoverageImpact },
        providers: {
          before: source.providers.mda + source.providers.crna,
          after: source.providers.mda + source.providers.crna - providers.length,
          delta: -providers.length
        }
      },

      destination: {
        overtimeHours: { before: dest.overtimeHours, after: destNewOT, delta: -destOTReduction },
        coverageRate: { before: dest.coverageRate, after: destNewCoverage, delta: destCoverageImprovement },
        providers: {
          before: dest.providers.mda + dest.providers.crna,
          after: dest.providers.mda + dest.providers.crna + providers.length,
          delta: providers.length
        }
      },

      network: {
        overtimeHoursWeekly: {
          before: baselineMetrics.overtimeHoursWeekly,
          after: baselineMetrics.overtimeHoursWeekly + netOTChange,
          delta: netOTChange
        }
      },

      financial: {
        relocationCost: relocationCost,
        annualOTImpact: netOTChange < 0 ? annualOTSavings : -annualOTSavings,
        netImpact: (netOTChange < 0 ? annualOTSavings : -annualOTSavings) - relocationCost
      },

      recommendation: this._generateRebalancingRecommendation(source, dest, providers, netOTChange, sourceNewCoverage)
    };
  }

  /**
   * Calculate impact of redistributing cases between centers
   */
  calculateCaseRedistributionScenario(sourceId, destId, casesPerWeek) {
    const source = this.baseline.centers.find(c => c.id === sourceId);
    const dest = this.baseline.centers.find(c => c.id === destId);

    if (!source || !dest) {
      throw new Error('Center not found');
    }

    if (casesPerWeek === 0) {
      return this.getBaselineMetrics();
    }

    // Source impact (losing cases)
    const sourceUtilization = source.casesPerWeek / source.capacity;
    const sourceNewCases = source.casesPerWeek - casesPerWeek;
    const sourceNewUtilization = sourceNewCases / source.capacity;

    // Estimate OT reduction at source (rough: 10% case reduction = 10% OT reduction)
    const sourceCaseReductionPct = casesPerWeek / source.casesPerWeek;
    const sourceOTReduction = source.overtimeHours * sourceCaseReductionPct;
    const sourceNewOT = source.overtimeHours - sourceOTReduction;

    // Destination impact (gaining cases)
    const destUtilization = dest.casesPerWeek / dest.capacity;
    const destNewCases = dest.casesPerWeek + casesPerWeek;
    const destNewUtilization = destNewCases / dest.capacity;

    // Check if destination has capacity
    const feasible = destNewCases <= dest.capacity;
    const destOTIncrease = feasible ? (casesPerWeek / dest.capacity) * 10 : casesPerWeek * 0.5; // Penalty if over capacity
    const destNewOT = dest.overtimeHours + destOTIncrease;

    // Network impact
    const netOTChange = -sourceOTReduction + destOTIncrease;

    // Cost calculation
    const avgHourlyRate = (this.baseline.costs.mdaHourlyRate + this.baseline.costs.crnaHourlyRate) / 2;
    const annualOTImpact = netOTChange * this.baseline.assumptions.weeksPerYear *
                          avgHourlyRate * this.baseline.costs.overtimeMultiplier;

    const baselineMetrics = this.getBaselineMetrics();

    return {
      scenario: 'caseRedistribution',
      inputs: {
        sourceName: source.name,
        destName: dest.name,
        casesPerWeek
      },

      source: {
        cases: { before: source.casesPerWeek, after: sourceNewCases, delta: -casesPerWeek },
        utilization: { before: sourceUtilization * 100, after: sourceNewUtilization * 100, delta: (sourceNewUtilization - sourceUtilization) * 100 },
        overtimeHours: { before: source.overtimeHours, after: sourceNewOT, delta: -sourceOTReduction },
        capacity: source.capacity,
        remainingCapacity: source.capacity - sourceNewCases
      },

      destination: {
        cases: { before: dest.casesPerWeek, after: destNewCases, delta: casesPerWeek },
        utilization: { before: destUtilization * 100, after: destNewUtilization * 100, delta: (destNewUtilization - destUtilization) * 100 },
        overtimeHours: { before: dest.overtimeHours, after: destNewOT, delta: destOTIncrease },
        capacity: dest.capacity,
        remainingCapacity: dest.capacity - destNewCases,
        overCapacity: !feasible
      },

      network: {
        overtimeHoursWeekly: {
          before: baselineMetrics.overtimeHoursWeekly,
          after: baselineMetrics.overtimeHoursWeekly + netOTChange,
          delta: netOTChange
        }
      },

      financial: {
        annualOTImpact: netOTChange < 0 ? -annualOTImpact : annualOTImpact
      },

      feasibility: {
        score: feasible ? 85 : 45,
        status: feasible ? 'Feasible' : 'Over Capacity',
        color: feasible ? 'green' : 'red'
      },

      recommendation: this._generateCaseRedistributionRecommendation(source, dest, casesPerWeek, feasible, netOTChange)
    };
  }

  /**
   * Calculate impact of on-call policy changes
   */
  calculateOnCallPolicyScenario(policyType, value, affectedProviderType = 'all') {
    const baselineMetrics = this.getBaselineMetrics();

    // Current on-call distribution
    const allProviders = this.baseline.providers;
    const mdaProviders = allProviders.filter(p => p.type === 'MDA');
    const crnaProviders = allProviders.filter(p => p.type === 'CRNA');

    const currentMDARotations = mdaProviders.reduce((sum, p) => sum + p.onCallRotations, 0);
    const currentCRNARotations = crnaProviders.reduce((sum, p) => sum + p.onCallRotations, 0);
    const totalRotations = currentMDARotations + currentCRNARotations;

    // Calculate fairness score (0-100)
    const avgRotations = totalRotations / allProviders.length;
    const variance = allProviders.reduce((sum, p) =>
      sum + Math.pow(p.onCallRotations - avgRotations, 2), 0) / allProviders.length;
    const currentFairness = Math.max(0, 100 - (variance * 10));

    let result = {};

    switch (policyType) {
      case 'addPremium':
        // Adding on-call premium pay
        const monthlyRotations = totalRotations * 4; // Assume 4 rotations per month on average
        const annualCost = monthlyRotations * value * 12;

        result = {
          scenario: 'onCallPolicy',
          policyType: 'Add On-Call Premium Pay',
          inputs: { premiumPerShift: value, affectedProviderType },

          distribution: {
            totalRotations,
            mdaRotations: currentMDARotations,
            crnaRotations: currentCRNARotations,
            fairnessScore: { before: currentFairness, after: currentFairness, delta: 0 }
          },

          financial: {
            annualPremiumCost: annualCost,
            monthlyPremiumCost: annualCost / 12
          },

          impact: {
            providerSatisfaction: 'Moderate Improvement',
            retentionRisk: 'Reduced',
            recruitingAdvantage: 'Improved'
          },

          recommendation: `Adding $${value} per on-call shift will cost approximately $${Math.round(annualCost).toLocaleString()} annually. This is a competitive benefit that improves provider satisfaction and reduces turnover risk. Recommended if retention is a concern.`
        };
        break;

      case 'balanceRotations':
        // Mandate balanced rotations
        const targetRotationsPerProvider = Math.ceil(avgRotations);
        const newFairness = 95; // Nearly perfect distribution

        result = {
          scenario: 'onCallPolicy',
          policyType: 'Balanced Rotation Policy',
          inputs: { targetRotationsPerProvider, affectedProviderType },

          distribution: {
            totalRotations,
            mdaRotations: currentMDARotations,
            crnaRotations: currentCRNARotations,
            fairnessScore: { before: currentFairness, after: newFairness, delta: newFairness - currentFairness }
          },

          financial: {
            cost: 0,
            benefit: 'Improved equity and morale'
          },

          impact: {
            providerSatisfaction: 'Significant Improvement',
            workloadEquity: 'Greatly Improved',
            implementationComplexity: 'Low'
          },

          recommendation: `Implementing a balanced rotation policy (max ${targetRotationsPerProvider} rotations/month per provider) will improve fairness from ${Math.round(currentFairness)}% to ${newFairness}%. Zero cost, high satisfaction impact. Strongly recommended.`
        };
        break;

      case 'reduceFrequency':
        // Reduce rotation frequency by adding more providers to rotation
        const additionalProvidersNeeded = value;
        const newTotalProviders = allProviders.length + additionalProvidersNeeded;
        const newRotationsPerProvider = totalRotations / newTotalProviders;
        const reductionPct = ((avgRotations - newRotationsPerProvider) / avgRotations) * 100;

        result = {
          scenario: 'onCallPolicy',
          policyType: 'Reduce Rotation Frequency',
          inputs: { additionalProviders: additionalProvidersNeeded, affectedProviderType },

          distribution: {
            totalRotations,
            providersInRotation: { before: allProviders.length, after: newTotalProviders, delta: additionalProvidersNeeded },
            rotationsPerProvider: { before: avgRotations, after: newRotationsPerProvider, delta: -(avgRotations - newRotationsPerProvider) },
            reductionPercentage: reductionPct,
            fairnessScore: { before: currentFairness, after: 90, delta: 90 - currentFairness }
          },

          financial: {
            cost: 'None (using existing staff)',
            benefit: 'Reduced burnout, improved work-life balance'
          },

          impact: {
            providerSatisfaction: 'Significant Improvement',
            burnoutRisk: 'Reduced',
            workLifeBalance: 'Improved'
          },

          recommendation: `Adding ${additionalProvidersNeeded} providers to on-call rotation reduces individual burden by ${Math.round(reductionPct)}%. This improves work-life balance without additional cost. Recommended if providers are available.`
        };
        break;
    }

    return result;
  }

  // Helper methods for generating recommendations

  _generateHiringRecommendation(center, count, providerType, netImpact, breakEven, otReduction) {
    let recommendation = `Adding ${count} ${providerType}${count > 1 ? 's' : ''} at ${center.name} will:\n`;
    recommendation += `• Reduce overtime by ${Math.round(otReduction)} hours/week (${Math.round((otReduction/center.overtimeHours) * 100)}% reduction)\n`;

    if (netImpact > 0) {
      recommendation += `• Generate net savings of $${Math.round(netImpact).toLocaleString()} annually\n`;
      recommendation += `• Positive ROI from day one\n\n`;
      recommendation += `Recommendation: STRONGLY RECOMMENDED - Immediate positive financial impact while reducing provider burnout.`;
    } else if (breakEven <= 24) {
      recommendation += `• Break-even in ${breakEven} months\n`;
      recommendation += `• Addresses critical staffing need\n\n`;
      recommendation += `Recommendation: RECOMMENDED - Reasonable break-even timeline and addresses ${center.name}'s overtime issues.`;
    } else {
      recommendation += `• Break-even in ${breakEven} months\n`;
      recommendation += `• Long-term investment in capacity\n\n`;
      recommendation += `Recommendation: CONSIDER CAREFULLY - Long break-even period. Explore alternatives like rebalancing or case redistribution first.`;
    }

    return recommendation;
  }

  _generateRebalancingRecommendation(source, dest, providers, netOTChange, sourceCoverage) {
    let recommendation = `Moving ${providers.length} provider${providers.length > 1 ? 's' : ''} from ${source.name} to ${dest.name}:\n`;

    if (netOTChange < 0) {
      recommendation += `• Network-wide overtime reduced by ${Math.abs(Math.round(netOTChange))} hours/week\n`;
    } else {
      recommendation += `• ⚠️ Network-wide overtime increased by ${Math.round(netOTChange)} hours/week\n`;
    }

    if (sourceCoverage < 90) {
      recommendation += `• ⚠️ ${source.name} coverage drops to ${Math.round(sourceCoverage)}% (below 90% threshold)\n`;
      recommendation += `\nRecommendation: NOT RECOMMENDED - Source center coverage falls below acceptable levels.`;
    } else if (netOTChange > 0) {
      recommendation += `\nRecommendation: NOT RECOMMENDED - Increases network-wide overtime without clear benefit.`;
    } else {
      recommendation += `• Zero cost (rebalancing only)\n`;
      recommendation += `• ${dest.name} overtime significantly reduced\n`;
      recommendation += `\nRecommendation: RECOMMENDED - Improves network efficiency at no cost while maintaining adequate coverage.`;
    }

    return recommendation;
  }

  _generateCaseRedistributionRecommendation(source, dest, cases, feasible, netOTChange) {
    let recommendation = `Shifting ${cases} cases/week from ${source.name} to ${dest.name}:\n`;

    if (!feasible) {
      recommendation += `• ⚠️ ${dest.name} would exceed capacity\n`;
      recommendation += `• This will create new overtime issues at destination\n`;
      recommendation += `\nRecommendation: NOT FEASIBLE - Destination center lacks capacity. Consider hiring at ${dest.name} first.`;
    } else if (netOTChange < 0) {
      recommendation += `• Network overtime reduced by ${Math.abs(Math.round(netOTChange))} hours/week\n`;
      recommendation += `• Both centers remain within capacity\n`;
      recommendation += `• Zero cost implementation\n`;
      recommendation += `\nRecommendation: RECOMMENDED - Optimizes network capacity utilization and reduces overall overtime.`;
    } else {
      recommendation += `• Network overtime increases by ${Math.round(netOTChange)} hours/week\n`;
      recommendation += `• Marginal benefit to ${source.name} but creates issues at ${dest.name}\n`;
      recommendation += `\nRecommendation: NOT RECOMMENDED - Does not improve network-wide efficiency.`;
    }

    return recommendation;
  }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ScenarioEngine;
}
