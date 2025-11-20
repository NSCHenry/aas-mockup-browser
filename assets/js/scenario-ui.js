/**
 * Scenario Planning UI Controller
 * Handles UI interactions, chart rendering, and scenario display
 */

class ScenarioUI {
  constructor() {
    this.engine = null;
    this.baseline = null;
    this.currentScenario = 'hiring';
    this.charts = {};
    this.savedScenarios = [];
  }

  async init() {
    // Load baseline data
    try {
      const response = await fetch('../assets/data/baseline.json');
      this.baseline = await response.json();
      this.engine = new ScenarioEngine(this.baseline);

      this.setupEventListeners();
      this.populateDropdowns();
      this.switchScenario('hiring');
      this.updateDisplay();
    } catch (error) {
      console.error('Failed to load baseline data:', error);
      alert('Failed to load data. Please refresh the page.');
    }
  }

  setupEventListeners() {
    // Scenario type selector
    document.querySelectorAll('.scenario-tab').forEach(tab => {
      tab.addEventListener('click', (e) => {
        const scenario = e.target.dataset.scenario;
        this.switchScenario(scenario);
      });
    });

    // Hiring scenario inputs
    document.getElementById('hiring-center')?.addEventListener('change', () => this.updateDisplay());
    document.getElementById('hiring-type')?.addEventListener('change', () => this.updateDisplay());
    document.getElementById('hiring-count')?.addEventListener('input', () => this.updateDisplay());
    document.getElementById('hiring-salary')?.addEventListener('input', () => this.updateDisplay());

    // Rebalancing scenario inputs
    document.getElementById('rebal-source')?.addEventListener('change', () => {
      this.populateProviderList();
      this.updateDisplay();
    });
    document.getElementById('rebal-dest')?.addEventListener('change', () => this.updateDisplay());
    document.getElementById('rebal-providers')?.addEventListener('change', () => this.updateDisplay());

    // Case redistribution inputs
    document.getElementById('case-source')?.addEventListener('change', () => this.updateDisplay());
    document.getElementById('case-dest')?.addEventListener('change', () => this.updateDisplay());
    document.getElementById('case-count')?.addEventListener('input', () => this.updateDisplay());

    // On-call policy inputs
    document.getElementById('oncall-policy')?.addEventListener('change', () => {
      this.updateOnCallInputs();
      this.updateDisplay();
    });
    document.getElementById('oncall-value')?.addEventListener('input', () => this.updateDisplay());
    document.getElementById('oncall-provider-type')?.addEventListener('change', () => this.updateDisplay());

    // Contract Profitability inputs
    document.getElementById('profitability-center')?.addEventListener('change', () => this.updateDisplay());
    document.getElementById('profitability-volume')?.addEventListener('input', () => this.updateDisplay());
    document.getElementById('profitability-collection')?.addEventListener('input', () => this.updateDisplay());
    document.getElementById('profitability-floor')?.addEventListener('input', () => this.updateDisplay());

    // Market Expansion inputs
    document.getElementById('expansion-state')?.addEventListener('change', () => this.updateDisplay());
    document.getElementById('expansion-contracts')?.addEventListener('input', () => this.updateDisplay());
    document.getElementById('expansion-cases')?.addEventListener('input', () => this.updateDisplay());
    document.getElementById('expansion-timeline')?.addEventListener('input', () => this.updateDisplay());

    // Provider Turnover inputs
    document.getElementById('turnover-providers')?.addEventListener('change', () => this.updateDisplay());
    document.getElementById('turnover-timeline')?.addEventListener('input', () => this.updateDisplay());
    document.querySelectorAll('input[name="coverage-strategy"]').forEach(radio => {
      radio.addEventListener('change', () => this.updateDisplay());
    });

    // RCM Optimization inputs
    document.getElementById('rcm-scope')?.addEventListener('change', () => this.populateRCMCenterOptions());
    document.getElementById('rcm-denial')?.addEventListener('input', () => this.updateDisplay());
    document.getElementById('rcm-collection')?.addEventListener('input', () => this.updateDisplay());
    document.getElementById('rcm-investment')?.addEventListener('input', () => this.updateDisplay());

    // Reset button
    document.getElementById('reset-btn')?.addEventListener('click', () => this.resetInputs());

    // Save scenario button
    document.getElementById('save-scenario-btn')?.addEventListener('click', () => this.saveCurrentScenario());
  }

  populateDropdowns() {
    const centers = this.baseline.centers;

    // Populate center dropdowns
    const centerSelects = [
      'hiring-center', 'rebal-source', 'rebal-dest',
      'case-source', 'case-dest', 'profitability-center'
    ];

    centerSelects.forEach(selectId => {
      const select = document.getElementById(selectId);
      if (select) {
        select.innerHTML = '<option value="">Select Center...</option>';
        centers.forEach(center => {
          const option = document.createElement('option');
          option.value = center.id;
          option.textContent = center.name;
          select.appendChild(option);
        });
      }
    });

    // Populate provider turnover multi-select
    const turnoverSelect = document.getElementById('turnover-providers');
    if (turnoverSelect) {
      turnoverSelect.innerHTML = '';
      this.baseline.providers.forEach(provider => {
        const option = document.createElement('option');
        option.value = provider.id;
        option.textContent = `${provider.name} (${provider.type}) - ${this.baseline.centers.find(c => c.id === provider.center)?.name || ''}`;
        if (provider.retentionRisk === 'high') {
          option.textContent += ' ⚠️ High Risk';
        }
        option.dataset.retentionRisk = provider.retentionRisk;
        turnoverSelect.appendChild(option);
      });
    }

    // Initialize RCM scope dropdown
    this.populateRCMCenterOptions();
  }

  populateRCMCenterOptions() {
    const select = document.getElementById('rcm-scope');
    if (!select) return;

    const currentValue = select.value;
    select.innerHTML = '<option value="all">Network-Wide (All Centers)</option>';
    select.innerHTML += '<option value="">-- Or Select Single Center --</option>';

    this.baseline.centers.forEach(center => {
      const option = document.createElement('option');
      option.value = center.id;
      option.textContent = center.name;
      select.appendChild(option);
    });

    if (currentValue) select.value = currentValue;
  }

  populateProviderList() {
    const sourceId = document.getElementById('rebal-source')?.value;
    const select = document.getElementById('rebal-providers');

    if (!select || !sourceId) return;

    const providers = this.baseline.providers.filter(p => p.center === sourceId);

    select.innerHTML = '';
    providers.forEach(provider => {
      const option = document.createElement('option');
      option.value = provider.id;
      option.textContent = `${provider.name} (${provider.type})`;
      select.appendChild(option);
    });
  }

  switchScenario(scenarioType) {
    this.currentScenario = scenarioType;

    // Update tab styles
    document.querySelectorAll('.scenario-tab').forEach(tab => {
      tab.classList.toggle('active', tab.dataset.scenario === scenarioType);
    });

    // Show/hide scenario panels
    document.querySelectorAll('.scenario-panel').forEach(panel => {
      panel.style.display = panel.dataset.scenario === scenarioType ? 'block' : 'none';
    });

    this.updateDisplay();
  }

  updateOnCallInputs() {
    const policyType = document.getElementById('oncall-policy')?.value;
    const valueInput = document.getElementById('oncall-value');
    const valueLabel = document.getElementById('oncall-value-label');

    if (!valueInput || !valueLabel) return;

    switch (policyType) {
      case 'addPremium':
        valueLabel.textContent = 'Premium Per Shift ($)';
        valueInput.placeholder = '500';
        valueInput.value = '500';
        break;
      case 'balanceRotations':
        valueLabel.textContent = 'Max Rotations Per Provider';
        valueInput.placeholder = '4';
        valueInput.value = '4';
        break;
      case 'reduceFrequency':
        valueLabel.textContent = 'Additional Providers in Rotation';
        valueInput.placeholder = '3';
        valueInput.value = '3';
        break;
    }
  }

  updateDisplay() {
    let result;

    try {
      switch (this.currentScenario) {
        case 'hiring':
          result = this.calculateHiringScenario();
          break;
        case 'rebalancing':
          result = this.calculateRebalancingScenario();
          break;
        case 'caseRedistribution':
          result = this.calculateCaseRedistributionScenario();
          break;
        case 'onCallPolicy':
          result = this.calculateOnCallPolicyScenario();
          break;
        case 'contractProfitability':
          result = this.calculateContractProfitabilityScenario();
          break;
        case 'marketExpansion':
          result = this.calculateMarketExpansionScenario();
          break;
        case 'providerTurnover':
          result = this.calculateProviderTurnoverScenario();
          break;
        case 'rcmOptimization':
          result = this.calculateRCMOptimizationScenario();
          break;
      }

      if (result) {
        this.updateSummaryCards(result);
        this.updateCharts(result);
        this.updateRecommendation(result);
      }
    } catch (error) {
      console.error('Calculation error:', error);
    }
  }

  calculateHiringScenario() {
    const centerId = document.getElementById('hiring-center')?.value;
    const providerType = document.getElementById('hiring-type')?.value;
    const count = parseInt(document.getElementById('hiring-count')?.value) || 0;
    const salary = parseInt(document.getElementById('hiring-salary')?.value) || null;

    if (!centerId || !providerType) return null;

    return this.engine.calculateHiringScenario(centerId, providerType, count, salary);
  }

  calculateRebalancingScenario() {
    const sourceId = document.getElementById('rebal-source')?.value;
    const destId = document.getElementById('rebal-dest')?.value;
    const providerSelect = document.getElementById('rebal-providers');
    const selectedOptions = Array.from(providerSelect?.selectedOptions || []);
    const providerIds = selectedOptions.map(opt => opt.value);

    if (!sourceId || !destId || providerIds.length === 0) return null;

    return this.engine.calculateRebalancingScenario(sourceId, destId, providerIds);
  }

  calculateCaseRedistributionScenario() {
    const sourceId = document.getElementById('case-source')?.value;
    const destId = document.getElementById('case-dest')?.value;
    const casesPerWeek = parseInt(document.getElementById('case-count')?.value) || 0;

    if (!sourceId || !destId) return null;

    return this.engine.calculateCaseRedistributionScenario(sourceId, destId, casesPerWeek);
  }

  calculateOnCallPolicyScenario() {
    const policyType = document.getElementById('oncall-policy')?.value;
    const value = parseInt(document.getElementById('oncall-value')?.value) || 0;
    const providerType = document.getElementById('oncall-provider-type')?.value;

    if (!policyType) return null;

    return this.engine.calculateOnCallPolicyScenario(policyType, value, providerType);
  }

  calculateContractProfitabilityScenario() {
    const centerId = document.getElementById('profitability-center')?.value;
    const volumeChange = parseFloat(document.getElementById('profitability-volume')?.value) || 0;
    const collectionChange = parseFloat(document.getElementById('profitability-collection')?.value) || 0;
    const floorChange = parseFloat(document.getElementById('profitability-floor')?.value) || 0;

    if (!centerId) {
      // Return placeholder result to update card labels
      return {
        scenario: 'contractProfitability',
        center: {
          revenue: { before: 0, after: 0, delta: 0 },
          margin: { before: 0, after: 0, delta: 0 },
          subsidy: { before: 0, after: 0, delta: 0 },
          marginPercent: { before: 0, after: 0, delta: 0 }
        },
        financial: { annualSubsidyChange: 0 },
        recommendation: 'Select a center to analyze contract profitability and subsidy impact.'
      };
    }

    return this.engine.calculateContractProfitability(centerId, volumeChange, collectionChange, floorChange);
  }

  calculateMarketExpansionScenario() {
    const state = document.getElementById('expansion-state')?.value;
    const contractCount = parseInt(document.getElementById('expansion-contracts')?.value) || 0;
    const avgCasesPerWeek = parseInt(document.getElementById('expansion-cases')?.value) || 0;
    const timeline = parseInt(document.getElementById('expansion-timeline')?.value) || 0;

    if (!state || !contractCount || !avgCasesPerWeek) {
      // Return placeholder result to update card labels
      return {
        scenario: 'marketExpansion',
        financial: {
          totalInvestment: 0,
          breakEvenMonth: 'Not calculated',
          projectedAnnualRevenue: 0,
          roi: 0
        },
        timeline: [],
        recommendation: 'Select a state and enter contract details to analyze market expansion opportunity.'
      };
    }

    return this.engine.calculateMarketExpansion(state, contractCount, avgCasesPerWeek, timeline);
  }

  calculateProviderTurnoverScenario() {
    const providerSelect = document.getElementById('turnover-providers');
    const selectedOptions = Array.from(providerSelect?.selectedOptions || []);
    const providerIds = selectedOptions.map(opt => opt.value);
    const replacementMonths = parseInt(document.getElementById('turnover-timeline')?.value) || 3;
    const strategyRadio = document.querySelector('input[name="coverage-strategy"]:checked');
    const coverageStrategy = strategyRadio?.value || 'overtime';

    if (providerIds.length === 0) {
      // Return placeholder result to update card labels
      return {
        scenario: 'providerTurnover',
        financial: {
          totalCost: 0,
          recruitmentCosts: 0,
          relocationCosts: 0,
          temporaryCoverageCost: 0,
          timeToStabilize: 0
        },
        impact: {
          centersAffected: []
        },
        recommendation: 'Select one or more providers to analyze turnover impact and replacement costs.'
      };
    }

    return this.engine.calculateProviderTurnover(providerIds, replacementMonths, coverageStrategy);
  }

  calculateRCMOptimizationScenario() {
    const scope = document.getElementById('rcm-scope')?.value;
    const denialReduction = parseFloat(document.getElementById('rcm-denial')?.value) || 0;
    const collectionImprovement = parseFloat(document.getElementById('rcm-collection')?.value) || 0;
    const investment = parseFloat(document.getElementById('rcm-investment')?.value) || 0;

    if (!scope || investment === 0) {
      // Return placeholder result to update card labels
      return {
        scenario: 'rcmOptimization',
        financial: {
          totalAdditionalRevenue: 0,
          annualROI: 0,
          paybackMonths: 0,
          contractsImproved: 0,
          totalInvestment: 0
        },
        improvements: [],
        recommendation: 'Enter investment amount to analyze RCM optimization potential and revenue recovery.'
      };
    }

    return this.engine.calculateRCMOptimization(scope, denialReduction, collectionImprovement, investment);
  }

  updateSummaryCards(result) {
    const cards = [
      { id: 'ot-hours', data: this.getCardData(0, result) },
      { id: 'annual-cost', data: this.getCardData(1, result) },
      { id: 'coverage-rate', data: this.getCardData(2, result) },
      { id: 'provider-load', data: this.getCardData(3, result) }
    ];

    cards.forEach(({ id, data }) => {
      if (data) this.updateCard(id, data);
    });
  }

  getCardData(cardIndex, result) {
    const scenario = result.scenario;

    // Different card configurations for each scenario type
    switch (scenario) {
      case 'contractProfitability':
        const profitCards = [
          {
            label: 'Monthly Revenue',
            before: result.center.revenue.before,
            after: result.center.revenue.after,
            delta: result.center.revenue.delta,
            unit: '$',
            inverse: false
          },
          {
            label: 'Monthly Margin',
            before: result.center.margin.before,
            after: result.center.margin.after,
            delta: result.center.margin.delta,
            unit: '$',
            inverse: false
          },
          {
            label: 'Subsidy Amount',
            before: result.center.subsidy.before,
            after: result.center.subsidy.after,
            delta: result.center.subsidy.delta,
            unit: '$',
            inverse: true
          },
          {
            label: 'Margin %',
            before: result.center.marginPercent.before,
            after: result.center.marginPercent.after,
            delta: result.center.marginPercent.delta,
            unit: '%',
            inverse: false
          }
        ];
        return profitCards[cardIndex];

      case 'marketExpansion':
        const expansionCards = [
          {
            label: 'Total Investment',
            before: 0,
            after: result.financial.totalInvestment,
            delta: result.financial.totalInvestment,
            unit: '$',
            inverse: true
          },
          {
            label: 'Break-Even',
            before: 0,
            after: result.financial.breakEvenMonth === 'Not within timeframe' ? 999 : result.financial.breakEvenMonth,
            delta: 0,
            unit: ' mo',
            inverse: false,
            displayValue: result.financial.breakEvenMonth
          },
          {
            label: 'Year 1 Revenue',
            before: 0,
            after: result.financial.projectedAnnualRevenue,
            delta: result.financial.projectedAnnualRevenue,
            unit: '$',
            inverse: false
          },
          {
            label: '3-Year ROI',
            before: 0,
            after: result.financial.roi,
            delta: result.financial.roi,
            unit: '%',
            inverse: false
          }
        ];
        return expansionCards[cardIndex];

      case 'providerTurnover':
        const turnoverCards = [
          {
            label: 'Total Cost',
            before: 0,
            after: result.financial.totalCost,
            delta: result.financial.totalCost,
            unit: '$',
            inverse: true
          },
          {
            label: 'Recruitment',
            before: 0,
            after: result.financial.recruitmentCosts,
            delta: result.financial.recruitmentCosts,
            unit: '$',
            inverse: true
          },
          {
            label: 'Temp Coverage',
            before: 0,
            after: result.financial.temporaryCoverageCost,
            delta: result.financial.temporaryCoverageCost,
            unit: '$',
            inverse: true
          },
          {
            label: 'Time to Stabilize',
            before: 0,
            after: result.financial.timeToStabilize,
            delta: 0,
            unit: ' mo',
            inverse: false
          }
        ];
        return turnoverCards[cardIndex];

      case 'rcmOptimization':
        const rcmCards = [
          {
            label: 'Additional Revenue',
            before: 0,
            after: result.financial.totalAdditionalRevenue,
            delta: result.financial.totalAdditionalRevenue,
            unit: '$',
            inverse: false
          },
          {
            label: 'Annual ROI',
            before: 0,
            after: result.financial.annualROI,
            delta: result.financial.annualROI,
            unit: '%',
            inverse: false
          },
          {
            label: 'Payback Period',
            before: 0,
            after: result.financial.paybackMonths,
            delta: 0,
            unit: ' mo',
            inverse: false
          },
          {
            label: 'Contracts Improved',
            before: 0,
            after: result.financial.contractsImproved,
            delta: 0,
            unit: '',
            inverse: false
          }
        ];
        return rcmCards[cardIndex];

      default:
        // Original scenarios (hiring, rebalancing, caseRedistribution, onCallPolicy)
        const defaultCards = [
          {
            label: 'Overtime Hours/Week',
            before: result.network?.overtimeHoursWeekly?.before,
            after: result.network?.overtimeHoursWeekly?.after,
            delta: result.network?.overtimeHoursWeekly?.delta,
            unit: ' hrs',
            inverse: true
          },
          {
            label: 'Annual Net Impact',
            before: 0,
            after: result.financial?.netAnnualImpact || result.financial?.annualOTImpact || 0,
            delta: result.financial?.netAnnualImpact || result.financial?.annualOTImpact || 0,
            unit: '$',
            inverse: true
          },
          {
            label: 'Coverage Rate',
            before: result.center?.coverageRate?.before || 0,
            after: result.center?.coverageRate?.after || 0,
            delta: result.center?.coverageRate?.delta || 0,
            unit: '%',
            inverse: false
          },
          {
            label: 'Provider Workload',
            before: 0,
            after: 0,
            delta: 0,
            unit: '',
            inverse: false,
            displayValue: 'Balanced'
          }
        ];
        return defaultCards[cardIndex];
    }
  }

  updateCard(cardId, data) {
    const card = document.getElementById(`${cardId}-card`);
    if (!card || !data) return;

    const { label, before, after, delta, unit, inverse, displayValue } = data;

    // Update label
    const labelElem = card.querySelector('.card-label');
    if (labelElem) labelElem.textContent = label;

    // Update values
    const beforeSpan = card.querySelector('.before-value');
    const afterSpan = card.querySelector('.after-value');
    const deltaSpan = card.querySelector('.delta-value');

    if (beforeSpan) beforeSpan.textContent = this.formatValue(before, unit);
    if (afterSpan) {
      afterSpan.textContent = displayValue || this.formatValue(after, unit);
    }

    if (deltaSpan && delta !== undefined) {
      if (displayValue) {
        deltaSpan.textContent = '—';
        deltaSpan.className = 'delta-value neutral';
      } else {
        const arrow = delta > 0 ? '↑' : delta < 0 ? '↓' : '→';
        const pct = before !== 0 ? Math.abs(Math.round((delta / before) * 100)) : 0;
        deltaSpan.textContent = `${arrow} ${pct > 0 ? pct + '%' : '—'}`;
        deltaSpan.className = 'delta-value';

        // Determine color: inverse means negative delta is good (e.g., costs going down)
        let colorClass;
        if (delta === 0) {
          colorClass = 'neutral';
        } else if (inverse) {
          colorClass = delta < 0 ? 'positive' : 'negative';
        } else {
          colorClass = delta > 0 ? 'positive' : 'negative';
        }
        deltaSpan.classList.add(colorClass);
      }
    }
  }

  formatValue(value, unit) {
    if (unit === '' && Math.abs(value) > 1000) {
      // Currency
      return '$' + Math.round(value).toLocaleString();
    }
    return Math.round(value).toLocaleString() + unit;
  }

  updateCharts(result) {
    // Route to appropriate chart renderer based on scenario type
    switch (result.scenario) {
      case 'hiring':
      case 'rebalancing':
      case 'caseRedistribution':
        this.updateOvertimeComparisonChart(result);
        this.updateCostImpactChart(result);
        break;
      case 'contractProfitability':
        this.renderContractProfitabilityCharts(result);
        break;
      case 'marketExpansion':
        this.renderMarketExpansionCharts(result);
        break;
      case 'providerTurnover':
        this.renderProviderTurnoverCharts(result);
        break;
      case 'rcmOptimization':
        this.renderRCMOptimizationCharts(result);
        break;
      default:
        this.updateOvertimeComparisonChart(result);
        this.updateCostImpactChart(result);
    }
  }

  updateOvertimeComparisonChart(result) {
    const ctx = document.getElementById('overtime-comparison-chart');
    if (!ctx) return;

    const labels = [];
    const beforeData = [];
    const afterData = [];

    if (result.scenario === 'hiring') {
      labels.push(result.inputs.centerName);
      beforeData.push(result.center.overtimeHours.before);
      afterData.push(result.center.overtimeHours.after);
    } else if (result.scenario === 'rebalancing' || result.scenario === 'caseRedistribution') {
      labels.push(result.inputs.sourceName, result.inputs.destName);
      beforeData.push(result.source.overtimeHours.before, result.destination.overtimeHours.before);
      afterData.push(result.source.overtimeHours.after, result.destination.overtimeHours.after);
    }

    if (this.charts.overtimeComparison) {
      this.charts.overtimeComparison.destroy();
    }

    this.charts.overtimeComparison = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [
          {
            label: 'Current OT',
            data: beforeData,
            backgroundColor: 'rgba(239, 68, 68, 0.7)',
            borderColor: '#ef4444',
            borderWidth: 2
          },
          {
            label: 'Projected OT',
            data: afterData,
            backgroundColor: 'rgba(16, 185, 129, 0.7)',
            borderColor: '#10b981',
            borderWidth: 2
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { labels: { color: '#e8eaed' } },
          tooltip: { backgroundColor: 'rgba(37,41,64,0.95)' }
        },
        scales: {
          x: { grid: { display: false }, ticks: { color: '#9aa0a6' } },
          y: {
            grid: { color: 'rgba(255,255,255,0.05)' },
            ticks: { color: '#9aa0a6', callback: v => v + ' hrs' }
          }
        }
      }
    });
  }

  updateCostImpactChart(result) {
    const ctx = document.getElementById('cost-impact-chart');
    if (!ctx) return;

    if (result.scenario !== 'hiring') return;

    const months = [];
    const cumulativeCost = [];
    const cumulativeSavings = [];

    const monthlyCost = result.financial.annualHiringCost / 12;
    const monthlySavings = result.financial.annualOTSavings / 12;

    for (let i = 0; i <= 24; i++) {
      months.push(`M${i}`);
      cumulativeCost.push(-(i * monthlyCost));
      cumulativeSavings.push(i * monthlySavings);
    }

    const netData = cumulativeCost.map((cost, i) => cost + cumulativeSavings[i]);

    if (this.charts.costImpact) {
      this.charts.costImpact.destroy();
    }

    this.charts.costImpact = new Chart(ctx, {
      type: 'line',
      data: {
        labels: months,
        datasets: [
          {
            label: 'Net Impact',
            data: netData,
            borderColor: '#3b82f6',
            backgroundColor: 'rgba(59, 130, 246, 0.1)',
            fill: true,
            tension: 0.4,
            borderWidth: 3
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { labels: { color: '#e8eaed' } },
          tooltip: {
            backgroundColor: 'rgba(37,41,64,0.95)',
            callbacks: {
              label: (context) => {
                const value = context.parsed.y;
                return 'Net: $' + Math.round(value).toLocaleString();
              }
            }
          }
        },
        scales: {
          x: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#9aa0a6' } },
          y: {
            grid: { color: 'rgba(255,255,255,0.05)' },
            ticks: {
              color: '#9aa0a6',
              callback: v => '$' + (v / 1000).toFixed(0) + 'K'
            }
          }
        }
      }
    });
  }

  renderContractProfitabilityCharts(result) {
    // Chart 1: Waterfall - Revenue Flow to Margin
    const ctx1 = document.getElementById('overtime-comparison-chart');
    if (ctx1 && this.charts.overtimeComparison) {
      this.charts.overtimeComparison.destroy();
    }

    if (ctx1) {
      const data = [
        result.center.revenue.after,
        -result.center.costs.after,
        result.center.margin.after
      ];

      this.charts.overtimeComparison = new Chart(ctx1, {
        type: 'bar',
        data: {
          labels: ['Revenue', 'Costs', 'Net Margin'],
          datasets: [{
            label: 'Monthly Flow ($)',
            data: data,
            backgroundColor: [
              'rgba(16, 185, 129, 0.7)',
              'rgba(239, 68, 68, 0.7)',
              'rgba(59, 130, 246, 0.7)'
            ],
            borderColor: ['#10b981', '#ef4444', '#3b82f6'],
            borderWidth: 2
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false },
            tooltip: {
              backgroundColor: 'rgba(37,41,64,0.95)',
              callbacks: {
                label: (context) => '$' + Math.round(Math.abs(context.parsed.y)).toLocaleString()
              }
            }
          },
          scales: {
            x: { grid: { display: false }, ticks: { color: '#9aa0a6' } },
            y: {
              grid: { color: 'rgba(255,255,255,0.05)' },
              ticks: {
                color: '#9aa0a6',
                callback: v => '$' + (v / 1000).toFixed(0) + 'K'
              }
            }
          }
        }
      });
    }

    // Chart 2: Subsidy Comparison
    const ctx2 = document.getElementById('cost-impact-chart');
    if (ctx2 && this.charts.costImpact) {
      this.charts.costImpact.destroy();
    }

    if (ctx2) {
      this.charts.costImpact = new Chart(ctx2, {
        type: 'bar',
        data: {
          labels: ['Current Subsidy', 'New Subsidy', 'Annual Savings'],
          datasets: [{
            label: 'Amount ($)',
            data: [
              result.center.subsidy.before,
              result.center.subsidy.after,
              -result.financial.annualSubsidyChange
            ],
            backgroundColor: [
              'rgba(239, 68, 68, 0.7)',
              result.center.subsidy.after < result.center.subsidy.before ? 'rgba(16, 185, 129, 0.7)' : 'rgba(239, 68, 68, 0.7)',
              result.financial.annualSubsidyChange < 0 ? 'rgba(16, 185, 129, 0.7)' : 'rgba(239, 68, 68, 0.7)'
            ],
            borderWidth: 2
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false },
            tooltip: { backgroundColor: 'rgba(37,41,64,0.95)' }
          },
          scales: {
            x: { grid: { display: false }, ticks: { color: '#9aa0a6' } },
            y: {
              grid: { color: 'rgba(255,255,255,0.05)' },
              ticks: {
                color: '#9aa0a6',
                callback: v => '$' + (v / 1000).toFixed(0) + 'K'
              }
            }
          }
        }
      });
    }
  }

  renderMarketExpansionCharts(result) {
    // Chart 1: Cumulative Cash Flow Over Time
    const ctx1 = document.getElementById('overtime-comparison-chart');
    if (ctx1 && this.charts.overtimeComparison) {
      this.charts.overtimeComparison.destroy();
    }

    if (ctx1) {
      const months = result.timeline.map(t => `M${t.month}`);
      const cashFlow = result.timeline.map(t => t.cumulativeCashFlow);

      this.charts.overtimeComparison = new Chart(ctx1, {
        type: 'line',
        data: {
          labels: months,
          datasets: [{
            label: 'Cumulative Cash Flow',
            data: cashFlow,
            borderColor: '#3b82f6',
            backgroundColor: 'rgba(59, 130, 246, 0.1)',
            fill: true,
            tension: 0.4,
            borderWidth: 3,
            pointRadius: 2
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { labels: { color: '#e8eaed' } },
            tooltip: {
              backgroundColor: 'rgba(37,41,64,0.95)',
              callbacks: {
                label: (context) => 'Cash Flow: $' + Math.round(context.parsed.y).toLocaleString()
              }
            }
          },
          scales: {
            x: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#9aa0a6' } },
            y: {
              grid: { color: 'rgba(255,255,255,0.05)' },
              ticks: {
                color: '#9aa0a6',
                callback: v => '$' + (v / 1000).toFixed(0) + 'K'
              }
            }
          }
        }
      });
    }

    // Chart 2: Revenue Ramp
    const ctx2 = document.getElementById('cost-impact-chart');
    if (ctx2 && this.charts.costImpact) {
      this.charts.costImpact.destroy();
    }

    if (ctx2) {
      const months = result.timeline.slice(0, 13).map(t => `M${t.month}`);
      const revenue = result.timeline.slice(0, 13).map(t => t.revenue);
      const costs = result.timeline.slice(0, 13).map(t => t.cost);

      this.charts.costImpact = new Chart(ctx2, {
        type: 'line',
        data: {
          labels: months,
          datasets: [
            {
              label: 'Monthly Revenue',
              data: revenue,
              borderColor: '#10b981',
              backgroundColor: 'rgba(16, 185, 129, 0.1)',
              borderWidth: 2
            },
            {
              label: 'Monthly Costs',
              data: costs,
              borderColor: '#ef4444',
              backgroundColor: 'rgba(239, 68, 68, 0.1)',
              borderWidth: 2
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { labels: { color: '#e8eaed' } },
            tooltip: { backgroundColor: 'rgba(37,41,64,0.95)' }
          },
          scales: {
            x: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#9aa0a6' } },
            y: {
              grid: { color: 'rgba(255,255,255,0.05)' },
              ticks: {
                color: '#9aa0a6',
                callback: v => '$' + (v / 1000).toFixed(0) + 'K'
              }
            }
          }
        }
      });
    }
  }

  renderProviderTurnoverCharts(result) {
    // Chart 1: Cost Breakdown
    const ctx1 = document.getElementById('overtime-comparison-chart');
    if (ctx1 && this.charts.overtimeComparison) {
      this.charts.overtimeComparison.destroy();
    }

    if (ctx1) {
      this.charts.overtimeComparison = new Chart(ctx1, {
        type: 'bar',
        data: {
          labels: ['Recruitment', 'Relocation', 'Temp Coverage', 'Total Impact'],
          datasets: [{
            label: 'Cost ($)',
            data: [
              result.financial.recruitmentCosts,
              result.financial.relocationCosts,
              result.financial.temporaryCoverageCost,
              result.financial.totalCost
            ],
            backgroundColor: [
              'rgba(239, 68, 68, 0.7)',
              'rgba(251, 191, 36, 0.7)',
              'rgba(239, 68, 68, 0.7)',
              'rgba(239, 68, 68, 0.9)'
            ],
            borderWidth: 2
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false },
            tooltip: { backgroundColor: 'rgba(37,41,64,0.95)' }
          },
          scales: {
            x: { grid: { display: false }, ticks: { color: '#9aa0a6' } },
            y: {
              grid: { color: 'rgba(255,255,255,0.05)' },
              ticks: {
                color: '#9aa0a6',
                callback: v => '$' + (v / 1000).toFixed(0) + 'K'
              }
            }
          }
        }
      });
    }

    // Chart 2: Center Impact
    const ctx2 = document.getElementById('cost-impact-chart');
    if (ctx2 && this.charts.costImpact) {
      this.charts.costImpact.destroy();
    }

    if (ctx2) {
      const labels = result.impact.centersAffected.map(c => c.center.name);
      const before = result.impact.centersAffected.map(c => c.current);
      const after = result.impact.centersAffected.map(c => c.remaining);

      this.charts.costImpact = new Chart(ctx2, {
        type: 'bar',
        data: {
          labels: labels,
          datasets: [
            {
              label: 'Current Providers',
              data: before,
              backgroundColor: 'rgba(59, 130, 246, 0.7)',
              borderWidth: 2
            },
            {
              label: 'After Turnover',
              data: after,
              backgroundColor: 'rgba(239, 68, 68, 0.7)',
              borderWidth: 2
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { labels: { color: '#e8eaed' } },
            tooltip: { backgroundColor: 'rgba(37,41,64,0.95)' }
          },
          scales: {
            x: { grid: { display: false }, ticks: { color: '#9aa0a6' } },
            y: {
              grid: { color: 'rgba(255,255,255,0.05)' },
              ticks: { color: '#9aa0a6', stepSize: 1 }
            }
          }
        }
      });
    }
  }

  renderRCMOptimizationCharts(result) {
    // Chart 1: Revenue Improvement by Center
    const ctx1 = document.getElementById('overtime-comparison-chart');
    if (ctx1 && this.charts.overtimeComparison) {
      this.charts.overtimeComparison.destroy();
    }

    if (ctx1) {
      const top8 = result.improvements.slice(0, 8);
      const labels = top8.map(c => c.centerName);
      const improvements = top8.map(c => c.additionalRevenue);

      this.charts.overtimeComparison = new Chart(ctx1, {
        type: 'bar',
        data: {
          labels: labels,
          datasets: [{
            label: 'Additional Annual Revenue',
            data: improvements,
            backgroundColor: 'rgba(16, 185, 129, 0.7)',
            borderColor: '#10b981',
            borderWidth: 2
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false },
            tooltip: {
              backgroundColor: 'rgba(37,41,64,0.95)',
              callbacks: {
                label: (context) => '+$' + Math.round(context.parsed.y).toLocaleString()
              }
            }
          },
          scales: {
            x: { grid: { display: false }, ticks: { color: '#9aa0a6' } },
            y: {
              grid: { color: 'rgba(255,255,255,0.05)' },
              ticks: {
                color: '#9aa0a6',
                callback: v => '$' + (v / 1000).toFixed(0) + 'K'
              }
            }
          }
        }
      });
    }

    // Chart 2: ROI Timeline
    const ctx2 = document.getElementById('cost-impact-chart');
    if (ctx2 && this.charts.costImpact) {
      this.charts.costImpact.destroy();
    }

    if (ctx2) {
      const months = [];
      const cumulativeReturn = [];
      const monthlyReturn = result.financial.totalAdditionalRevenue / 12;

      for (let i = 0; i <= 24; i++) {
        months.push(`M${i}`);
        cumulativeReturn.push((i * monthlyReturn) - result.financial.totalInvestment);
      }

      this.charts.costImpact = new Chart(ctx2, {
        type: 'line',
        data: {
          labels: months,
          datasets: [{
            label: 'Net Return',
            data: cumulativeReturn,
            borderColor: '#10b981',
            backgroundColor: 'rgba(16, 185, 129, 0.1)',
            fill: true,
            tension: 0.4,
            borderWidth: 3
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { labels: { color: '#e8eaed' } },
            tooltip: {
              backgroundColor: 'rgba(37,41,64,0.95)',
              callbacks: {
                label: (context) => {
                  const val = context.parsed.y;
                  return (val >= 0 ? '+' : '') + '$' + Math.round(val).toLocaleString();
                }
              }
            }
          },
          scales: {
            x: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#9aa0a6' } },
            y: {
              grid: { color: 'rgba(255,255,255,0.05)' },
              ticks: {
                color: '#9aa0a6',
                callback: v => '$' + (v / 1000).toFixed(0) + 'K'
              }
            }
          }
        }
      });
    }
  }

  updateRecommendation(result) {
    const panel = document.getElementById('recommendation-panel');
    if (!panel) return;

    let html = `<div class="recommendation-text">${result.recommendation.replace(/\n/g, '<br>')}</div>`;

    if (result.financial) {
      html += '<div class="financial-summary">';
      html += '<h4>Financial Summary</h4>';

      if (result.financial.netAnnualImpact !== undefined) {
        const impact = result.financial.netAnnualImpact;
        const color = impact > 0 ? '#10b981' : impact < 0 ? '#ef4444' : '#9aa0a6';
        html += `<div class="summary-item">
          <span>Net Annual Impact:</span>
          <span style="color: ${color}; font-weight: 700;">
            ${impact > 0 ? '+' : ''}$${Math.round(impact).toLocaleString()}
          </span>
        </div>`;
      }

      if (result.financial.breakEvenMonths) {
        html += `<div class="summary-item">
          <span>Break-Even:</span>
          <span style="font-weight: 700;">${result.financial.breakEvenMonths} months</span>
        </div>`;
      }

      html += '</div>';
    }

    panel.innerHTML = html;
  }

  resetInputs() {
    document.querySelectorAll('input[type="number"], input[type="range"], select').forEach(input => {
      if (input.type === 'number' || input.type === 'range') {
        input.value = input.defaultValue || '0';
      } else {
        input.selectedIndex = 0;
      }
    });

    this.updateDisplay();
  }

  saveCurrentScenario() {
    // For now, just show an alert
    // In a real implementation, this would save to localStorage or server
    alert('Scenario saved! (Feature demonstration - not persisted)');
  }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  const ui = new ScenarioUI();
  ui.init();
});
