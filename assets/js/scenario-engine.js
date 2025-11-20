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

  // ============================================================================
  // NEW SCENARIO CALCULATIONS
  // ============================================================================

  /**
   * Calculate Contract Profitability & Subsidy Analysis
   */
  calculateContractProfitability(centerId, volumeChangePercent, collectionRateChange, floorChange) {
    const center = this.baseline.centers.find(c => c.id === centerId);
    if (!center) return null;

    // Current state
    const currentWeeklyCases = center.casesPerWeek;
    const currentReimbursement = center.reimbursementRate;
    const currentCollectionRate = center.collectionRate / 100;
    const currentFloor = center.contractFloor;
    const currentSubsidy = center.subsidyAmount;

    // Calculate current revenue
    const currentWeeklyRevenue = currentWeeklyCases * currentReimbursement * currentCollectionRate;
    const currentMonthlyRevenue = currentWeeklyRevenue * 4.33; // avg weeks per month

    // Calculate current costs (provider salaries + OT)
    const providersAtCenter = this.baseline.providers.filter(p => p.center === centerId);
    const monthlySalaries = providersAtCenter.reduce((sum, p) => {
      const annualSalary = p.type === 'MDA' ? this.baseline.costs.mdaSalary : this.baseline.costs.crnaSalary;
      return sum + (annualSalary / 12);
    }, 0);

    const weeklyOTCost = center.overtimeHours *
      (providersAtCenter[0]?.type === 'MDA' ? this.baseline.costs.mdaHourlyRate : this.baseline.costs.crnaHourlyRate) *
      this.baseline.costs.overtimeMultiplier;
    const monthlyOTCost = weeklyOTCost * 4.33;

    const currentMonthlyCost = monthlySalaries + monthlyOTCost;
    const currentMargin = currentMonthlyRevenue - currentMonthlyCost;
    const currentMarginPercent = currentMonthlyRevenue > 0 ? (currentMargin / currentMonthlyRevenue) * 100 : 0;

    // New scenario
    const newWeeklyCases = currentWeeklyCases * (1 + volumeChangePercent / 100);
    const newCollectionRate = (center.collectionRate + collectionRateChange) / 100;
    const newFloor = currentFloor + floorChange;

    const newWeeklyRevenue = newWeeklyCases * currentReimbursement * newCollectionRate;
    const newMonthlyRevenue = newWeeklyRevenue * 4.33;

    // Cost scales slightly with volume (more OT if volume up)
    const volumeRatio = newWeeklyCases / currentWeeklyCases;
    const newWeeklyOTCost = weeklyOTCost * volumeRatio;
    const newMonthlyOTCost = newWeeklyOTCost * 4.33;
    const newMonthlyCost = monthlySalaries + newMonthlyOTCost;

    const newMargin = newMonthlyRevenue - newMonthlyCost;
    const newSubsidy = Math.max(0, newFloor - newMargin);
    const newMarginPercent = newMonthlyRevenue > 0 ? (newMargin / newMonthlyRevenue) * 100 : 0;

    // Break-even volume calculation
    const breakEvenVolume = (currentMonthlyCost - (currentFloor * 0)) / (currentReimbursement * currentCollectionRate * 4.33);

    return {
      scenario: 'contractProfitability',
      inputs: {
        centerName: center.name,
        volumeChange: volumeChangePercent,
        collectionChange: collectionRateChange,
        floorChange: floorChange
      },
      center: {
        revenue: { before: currentMonthlyRevenue, after: newMonthlyRevenue, delta: newMonthlyRevenue - currentMonthlyRevenue },
        costs: { before: currentMonthlyCost, after: newMonthlyCost, delta: newMonthlyCost - currentMonthlyCost },
        margin: { before: currentMargin, after: newMargin, delta: newMargin - currentMargin },
        marginPercent: { before: currentMarginPercent, after: newMarginPercent, delta: newMarginPercent - currentMarginPercent },
        subsidy: { before: currentSubsidy, after: newSubsidy, delta: newSubsidy - currentSubsidy },
        breakEvenCases: Math.max(0, breakEvenVolume)
      },
      financial: {
        annualSubsidyChange: (newSubsidy - currentSubsidy) * 12,
        annualMarginChange: (newMargin - currentMargin) * 12
      },
      recommendation: this._generateProfitabilityRecommendation(center, volumeChangePercent, newMargin, currentMargin, newSubsidy, currentSubsidy)
    };
  }

  /**
   * Calculate Market Expansion Readiness & ROI
   */
  calculateMarketExpansion(state, contractCount, avgCasesPerWeek, timeline) {
    const stateRate = this.baseline.stateReimbursementRates[state];
    if (!stateRate) return null;

    const expansionCosts = this.baseline.marketExpansionCosts;

    // Calculate startup costs
    const totalStartupCost = Object.values(expansionCosts).reduce((sum, cost) => sum + cost, 0);

    // Estimate providers needed (assume 40 cases/week per provider)
    const providersNeeded = Math.ceil((contractCount * avgCasesPerWeek) / 40);
    const mdaCount = Math.ceil(providersNeeded * 0.4);
    const crnaCount = providersNeeded - mdaCount;

    // Calculate annual labor costs
    const annualLaborCost = (mdaCount * this.baseline.costs.mdaSalary + crnaCount * this.baseline.costs.crnaSalary) *
      this.baseline.costs.benefitsMultiplier;

    // Calculate revenue ramp (assume staggered contract wins)
    const monthlyProjections = [];
    let cumulativeCashFlow = -totalStartupCost;

    for (let month = 0; month <= timeline; month++) {
      // Contracts won progressively
      const contractsWon = Math.min(contractCount, Math.floor((month / timeline) * contractCount) + 1);
      const weeklyCases = contractsWon * avgCasesPerWeek;
      const monthlyRevenue = weeklyCases * 4.33 * stateRate * 0.88; // 88% collection rate assumption
      const monthlyCost = annualLaborCost / 12;

      const monthlyMargin = monthlyRevenue - monthlyCost;
      cumulativeCashFlow += monthlyMargin;

      monthlyProjections.push({
        month,
        contracts: contractsWon,
        revenue: monthlyRevenue,
        cost: monthlyCost,
        margin: monthlyMargin,
        cumulativeCashFlow
      });
    }

    // Find break-even month
    const breakEvenMonth = monthlyProjections.findIndex(p => p.cumulativeCashFlow >= 0);

    return {
      scenario: 'marketExpansion',
      inputs: {
        state,
        contractCount,
        avgCasesPerWeek,
        timeline
      },
      investment: {
        startupCosts: totalStartupCost,
        annualLaborCost,
        providersNeeded: { mda: mdaCount, crna: crnaCount }
      },
      financial: {
        breakEvenMonth: breakEvenMonth > 0 ? breakEvenMonth : 'Not within timeframe',
        totalInvestment: totalStartupCost + annualLaborCost,
        projectedAnnualRevenue: monthlyProjections[timeline]?.revenue * 12 || 0,
        projectedAnnualMargin: monthlyProjections[timeline]?.margin * 12 || 0,
        roi: monthlyProjections[timeline] ? ((monthlyProjections[timeline].cumulativeCashFlow / totalStartupCost) * 100) : 0
      },
      timeline: monthlyProjections,
      recommendation: this._generateExpansionRecommendation(state, contractCount, breakEvenMonth, totalStartupCost)
    };
  }

  /**
   * Calculate Provider Retention & Turnover Impact
   */
  calculateProviderTurnover(providerIds, replacementMonths, coverageStrategy) {
    const providers = providerIds.map(id => this.baseline.providers.find(p => p.id === id)).filter(p => p);
    if (providers.length === 0) return null;

    // Get affected centers
    const affectedCenters = [...new Set(providers.map(p => p.center))];
    const centerData = affectedCenters.map(centerId => {
      const center = this.baseline.centers.find(c => c.id === centerId);
      const providersAtCenter = this.baseline.providers.filter(p => p.center === centerId);
      const leavingFromCenter = providers.filter(p => p.center === centerId);

      return {
        center,
        current: providersAtCenter.length,
        leaving: leavingFromCenter.length,
        remaining: providersAtCenter.length - leavingFromCenter.length
      };
    });

    // Calculate replacement costs
    const recruitmentCosts = providers.reduce((sum, p) => sum + p.recruitmentCost, 0);
    const relocationCosts = providers.length * this.baseline.costs.relocationCost;

    // Calculate coverage gap cost based on strategy
    let tempCoverageCost = 0;
    let coverageImpact = '';

    switch (coverageStrategy) {
      case 'overtime':
        // Remaining providers pick up slack with OT
        const weeklyHoursNeeded = providers.reduce((sum, p) => sum + p.weeklyHours, 0);
        const weeksUncovered = replacementMonths * 4.33;
        const otHourlyRate = providers[0]?.type === 'MDA' ? this.baseline.costs.mdaHourlyRate : this.baseline.costs.crnaHourlyRate;
        tempCoverageCost = weeklyHoursNeeded * weeksUncovered * otHourlyRate * this.baseline.costs.overtimeMultiplier;
        coverageImpact = `Remaining providers work ${Math.round(weeklyHoursNeeded / centerData[0].remaining)} additional hours/week`;
        break;

      case 'prn':
        // Use PRN contractors (typically 30% premium)
        const prnRate = providers[0]?.type === 'MDA' ? this.baseline.costs.mdaHourlyRate * 1.3 : this.baseline.costs.crnaHourlyRate * 1.3;
        tempCoverageCost = providers.reduce((sum, p) => sum + p.weeklyHours, 0) * replacementMonths * 4.33 * prnRate;
        coverageImpact = `PRN providers cover ${providers.reduce((sum, p) => sum + p.weeklyHours, 0)} hrs/week at premium rates`;
        break;

      case 'reduced':
        // Reduce coverage hours (revenue loss)
        const avgCaseRevenue = 850; // average reimbursement
        const casesLost = providers.length * 8; // assume 8 cases/week per provider
        tempCoverageCost = casesLost * replacementMonths * 4.33 * avgCaseRevenue * 0.88;
        coverageImpact = `Reduce coverage by ~${casesLost} cases/week (potential revenue loss)`;
        break;
    }

    const totalCost = recruitmentCosts + relocationCosts + tempCoverageCost;

    return {
      scenario: 'providerTurnover',
      inputs: {
        providers: providers.map(p => p.name),
        replacementMonths,
        coverageStrategy
      },
      impact: {
        centersAffected: centerData,
        coverageGap: coverageImpact,
        burnoutRisk: centerData.some(c => c.remaining < 2) ? 'High' : 'Moderate'
      },
      financial: {
        recruitmentCosts,
        relocationCosts,
        temporaryCoverageCost: tempCoverageCost,
        totalCost,
        timeToStabilize: replacementMonths + 2 // +2 months for onboarding
      },
      recommendation: this._generateTurnoverRecommendation(providers, totalCost, centerData, coverageStrategy)
    };
  }

  /**
   * Calculate RCM Optimization Impact
   */
  calculateRCMOptimization(centerId, denialReduction, collectionImprovement, investment) {
    const center = centerId === 'all' ? null : this.baseline.centers.find(c => c.id === centerId);
    const centers = center ? [center] : this.baseline.centers;

    let results = {
      scenario: 'rcmOptimization',
      inputs: {
        scope: center ? center.name : 'Network-wide',
        denialReduction,
        collectionImprovement,
        investment
      },
      improvements: [],
      financial: {
        totalAdditionalRevenue: 0,
        totalInvestment: investment,
        annualROI: 0,
        paybackMonths: 0,
        subsidyReduction: 0,
        contractsImproved: 0
      },
      recommendation: ''
    };

    centers.forEach(c => {
      // Current state
      const weeklyRevenue = c.casesPerWeek * c.reimbursementRate * (c.collectionRate / 100);
      const annualRevenue = weeklyRevenue * 52;

      // Improved state
      const newCollectionRate = Math.min(98, c.collectionRate + collectionImprovement);
      const denialImpact = (c.denialRate / 100) * denialReduction; // % of revenue recovered
      const newWeeklyRevenue = c.casesPerWeek * c.reimbursementRate * (newCollectionRate / 100) * (1 + denialImpact);
      const newAnnualRevenue = newWeeklyRevenue * 52;

      const additionalRevenue = newAnnualRevenue - annualRevenue;

      // Check if margin improves enough to reduce subsidy
      const subsidyReduction = Math.min(c.subsidyAmount, additionalRevenue / 12) * 12;

      results.improvements.push({
        centerName: c.name,
        currentRevenue: annualRevenue,
        newRevenue: newAnnualRevenue,
        additionalRevenue,
        subsidyReduction
      });

      results.financial.totalAdditionalRevenue += additionalRevenue;
      results.financial.subsidyReduction += subsidyReduction;
      if (subsidyReduction > 0) results.financial.contractsImproved++;
    });

    results.financial.annualROI = investment > 0 ? ((results.financial.totalAdditionalRevenue / investment) * 100) : 0;
    results.financial.paybackMonths = investment > 0 ? Math.ceil((investment / results.financial.totalAdditionalRevenue) * 12) : 0;

    results.recommendation = this._generateRCMRecommendation(
      results.financial.totalAdditionalRevenue,
      investment,
      results.financial.paybackMonths,
      results.financial.contractsImproved
    );

    return results;
  }

  // Helper methods for new scenarios

  _generateProfitabilityRecommendation(center, volumeChange, newMargin, currentMargin, newSubsidy, currentSubsidy) {
    let rec = `Contract profitability analysis for ${center.name}:\n`;

    const marginChange = newMargin - currentMargin;
    const subsidyChange = newSubsidy - currentSubsidy;

    if (marginChange > 0 && subsidyChange < 0) {
      rec += `• Margin improves by $${Math.round(Math.abs(marginChange)).toLocaleString()}/month\n`;
      rec += `• Subsidy reduced by $${Math.round(Math.abs(subsidyChange)).toLocaleString()}/month\n`;
      rec += `\nRecommendation: STRONG IMPROVEMENTS - ${volumeChange > 0 ? 'Volume growth' : 'Collection improvements'} significantly enhance contract profitability.`;
    } else if (subsidyChange > 0) {
      rec += `• ⚠️ Subsidy increases by $${Math.round(subsidyChange).toLocaleString()}/month\n`;
      rec += `• Contract becoming less profitable\n`;
      rec += `\nRecommendation: CONCERNING TREND - Renegotiate floor or focus on RCM improvements to avoid contract becoming margin-dilutive.`;
    } else {
      rec += `• Margin remains relatively stable\n`;
      rec += `\nRecommendation: STABLE - Monitor closely but no immediate action needed.`;
    }

    return rec;
  }

  _generateExpansionRecommendation(state, contracts, breakEvenMonth, investment) {
    let rec = `Market expansion to ${state} with ${contracts} contract(s):\n`;

    if (breakEvenMonth > 0 && breakEvenMonth <= 24) {
      rec += `• Break-even achieved in ${breakEvenMonth} months\n`;
      rec += `• Total investment: $${Math.round(investment).toLocaleString()}\n`;
      rec += `• ${contracts} contract(s) provide sufficient scale\n`;
      rec += `\nRecommendation: GO - Reasonable path to profitability with acceptable risk.`;
    } else if (breakEvenMonth > 24) {
      rec += `• Break-even beyond 24 months\n`;
      rec += `• Requires sustained contract pipeline\n`;
      rec += `\nRecommendation: CAUTIOUS - Consider securing additional commitments before launching or start with lower overhead model.`;
    } else {
      rec += `• ⚠️ Does not break even within timeframe\n`;
      rec += `• Need more contracts or higher volume\n`;
      rec += `\nRecommendation: NOT READY - Increase contract count to minimum ${Math.ceil(contracts * 1.5)} or delay until pipeline stronger.`;
    }

    return rec;
  }

  _generateTurnoverRecommendation(providers, totalCost, centerData, strategy) {
    let rec = `Impact of losing ${providers.length} provider(s):\n`;

    rec += `• Total cost: $${Math.round(totalCost).toLocaleString()}\n`;
    rec += `• ${centerData.length} center(s) affected\n`;

    const criticalCenters = centerData.filter(c => c.remaining < 2);
    if (criticalCenters.length > 0) {
      rec += `• ⚠️ CRITICAL: ${criticalCenters[0].center.name} drops to ${criticalCenters[0].remaining} provider(s)\n`;
      rec += `\nRecommendation: HIGH PRIORITY - Immediate retention efforts needed. Consider counter-offers, workload adjustments, or emergency recruiting.`;
    } else {
      rec += `• Coverage maintainable with ${strategy} strategy\n`;
      rec += `\nRecommendation: MANAGEABLE - Execute replacement plan but expect $${Math.round(totalCost).toLocaleString()} impact. Invest in retention to prevent future turnover.`;
    }

    return rec;
  }

  _generateRCMRecommendation(revenue, investment, payback, contractsImproved) {
    let rec = `RCM optimization results:\n`;

    rec += `• Additional revenue: $${Math.round(revenue).toLocaleString()}/year\n`;
    rec += `• Investment required: $${Math.round(investment).toLocaleString()}\n`;
    rec += `• Payback period: ${payback} months\n`;
    rec += `• ${contractsImproved} contract(s) shift toward profitability\n`;

    if (payback <= 12 && revenue > investment * 0.5) {
      rec += `\nRecommendation: HIGHLY RECOMMENDED - Excellent ROI with short payback. RCM improvements are the most controllable margin lever.`;
    } else if (payback <= 24) {
      rec += `\nRecommendation: RECOMMENDED - Solid investment with acceptable payback period. Proceed with implementation.`;
    } else {
      rec += `\nRecommendation: EVALUATE ALTERNATIVES - Consider lower-cost RCM improvements or phase implementation to reduce upfront investment.`;
    }

    return rec;
  }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ScenarioEngine;
}
