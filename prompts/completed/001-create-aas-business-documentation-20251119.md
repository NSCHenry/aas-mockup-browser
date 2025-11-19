<objective>
Create a comprehensive, structured markdown documentation of AAS (Advanced Anesthesia Specialists) that serves as the definitive business reference document. This document will be used by stakeholders, LLMs, and analysts to understand AAS's complete business model, operational state, strategic direction, and measurable performance indicators.

The goal is to produce documentation so thorough that:
1. Any stakeholder can understand AAS's business comprehensively after one read
2. An LLM can generate accurate, contextual dashboards tracking their most critical KPIs
3. Technology teams have a complete inventory of initiatives including compliance requirements (HIPAA/PHI, etc.)
</objective>

<context>
You have access to two authoritative source documents:
- `AAS_Value Creation Kickoff (Nov 2025)_v1.pptx` - The "north star" document containing strategic vision and value creation plans
- `NSC - Underwriting Memo_AAS (November 2025).pptx` - Business context and underwriting perspective

These documents contain information about AAS's current operations, market position, growth strategy, financial performance, operational metrics, and technology landscape.

This documentation will serve multiple purposes:
- Executive reference for business understanding
- Foundation for KPI dashboard creation
- Technology roadmap and compliance tracking
- Business intelligence and analytics context
</context>

<source_analysis>
First, thoroughly analyze both PowerPoint files to extract:

1. **Business fundamentals**: What AAS does, market positioning, service offerings, customer segments, geographic footprint
2. **Organizational structure**: Leadership, operational teams, service delivery model, partner relationships
3. **Current state assessment**: Current performance, operational metrics, financial position, market share, strengths/weaknesses
4. **Future state vision**: Strategic goals, growth targets, expansion plans, transformation initiatives
5. **Key Performance Indicators**: All metrics mentioned across financial, operational, clinical, customer, and growth dimensions
6. **Technology initiatives**: All referenced technology projects, compliance requirements (HIPAA/PHI explicitly mentioned), system implementations, digital transformation efforts
7. **Value drivers**: What creates value in this business, competitive advantages, differentiation factors

For maximum efficiency, read both files in parallel to gather comprehensive context before synthesizing.
</source_analysis>

<documentation_requirements>
The markdown document must include these sections with substantial depth:

## 1. Executive Summary
- Business overview in 3-5 paragraphs
- Core value proposition
- Market position and competitive landscape
- Strategic priorities (current focus areas)

## 2. Business Model Deep Dive
### Services & Offerings
- Detailed description of all service lines
- Customer segments and their characteristics
- Revenue model and pricing approach
- Geographic coverage and facility relationships

### Organizational Structure
- Leadership team and key roles
- Operational structure
- Service delivery model
- Partner ecosystem

### Market Positioning
- Industry landscape and dynamics
- Competitive advantages
- Market share and growth trajectory
- Differentiation factors

## 3. Current State Assessment
### Operational Performance
- Current scale and capacity metrics
- Operational efficiency indicators
- Service delivery quality metrics
- Resource utilization patterns

### Financial Position
- Revenue profile and trends
- Cost structure and margins
- Profitability metrics
- Growth rates (historical and current)

### Organizational Capabilities
- Strengths and core competencies
- Operational challenges
- Resource constraints or gaps
- Risk factors

## 4. Future State Vision
### Strategic Goals
- 3-5 year vision
- Growth targets and expansion plans
- Transformation initiatives
- Expected business model evolution

### Value Creation Initiatives
- Specific programs driving value
- Investment priorities
- Expected ROI or impact
- Timeline and milestones

### Market Expansion
- Geographic expansion plans
- New service line development
- Customer segment expansion
- Partnership strategies

## 5. Key Performance Indicators (KPIs)
Organize KPIs using BOTH hierarchies as specified:

### By Business Function
Group all KPIs by operational area:
- **Financial KPIs**: Revenue, margins, costs, profitability metrics
- **Operational KPIs**: Volume, capacity, efficiency, utilization
- **Clinical KPIs**: Quality, safety, outcomes, compliance
- **Customer/Client KPIs**: Satisfaction, retention, growth
- **People/Talent KPIs**: Staffing, retention, productivity
- **Growth KPIs**: Market share, new business, expansion

### By Priority Tier
For each KPI identified above, also categorize:
- **Tier 1 (Critical)**: Must monitor daily/weekly, directly impacts strategic goals, board-level metrics
- **Tier 2 (Important)**: Monitor weekly/monthly, supports operational excellence, management metrics
- **Tier 3 (Monitoring)**: Track monthly/quarterly, diagnostic or supporting indicators

### KPI Specifications
For EACH KPI, document:
- **Metric name**: Clear, specific name
- **Definition**: Exact calculation or measurement method
- **Current baseline**: Current performance level (if available in source docs)
- **Target/Goal**: Desired performance level (if specified)
- **Frequency**: How often this should be measured
- **Owner**: Which function/role owns this metric
- **Why it matters**: Business rationale and decision-making use
- **Data sources**: Where data comes from to calculate this

## 6. Technology Initiatives Inventory
Create a comprehensive catalog of all technology-related initiatives:

### Initiative Catalog
For each technology initiative identified:
- **Initiative name**: Clear identifier
- **Category**: (e.g., Compliance, EHR/Clinical Systems, Analytics/BI, Infrastructure, Integration, Security, etc.)
- **Business objective**: Why this initiative exists, problem it solves
- **Scope**: What's included, key deliverables
- **Timeline**: Start date, key milestones, expected completion (if available)
- **Stakeholders**: Key business and technical owners
- **Dependencies**: Prerequisites or related initiatives
- **Success metrics**: How success will be measured
- **Status**: Current state (if indicated in source materials)

### Compliance & Regulatory Focus
Explicitly detail:
- **HIPAA/PHI compliance initiatives**: All related projects, requirements, controls
- **Other regulatory requirements**: Any other compliance obligations mentioned
- **Data security and privacy**: Related technology controls and initiatives
- **Audit and monitoring**: Compliance verification approaches

### Technology Roadmap View
- **Immediate priorities** (0-6 months)
- **Near-term initiatives** (6-12 months)
- **Long-term strategic projects** (12+ months)

## 7. Critical Success Factors
- Top 5-7 factors essential for AAS to achieve its strategic goals
- Risks and mitigation strategies
- Dependencies or assumptions

## 8. Appendices
### A. Definitions and Acronyms
- All industry-specific terms
- All acronyms used throughout document

### B. Data Sources
- Reference to source documents
- Key assumptions made where data was unclear
</documentation_requirements>

<writing_standards>
This is a business intelligence document, so maintain:

1. **Clarity and precision**: Use clear, professional business language; define all technical or industry terms
2. **Depth over brevity**: Go beyond surface-level descriptions; provide substantial detail that demonstrates deep understanding
3. **Data-driven**: Cite specific numbers, percentages, metrics from source documents whenever available
4. **Structure and navigation**: Use clear hierarchical markdown headers, bullet points, and tables where appropriate for readability
5. **Actionable insights**: Don't just describe what exists; explain WHY it matters and HOW it connects to business goals
6. **Comprehensive coverage**: If information exists in the source documents, include it; don't leave gaps

When the source materials provide detailed information, reflect that depth in your documentation. When source materials are sparse on a topic, acknowledge the limitation but provide what's available.
</writing_standards>

<analysis_approach>
1. **Read both PowerPoint files** using the Read tool to extract all content, slides, and data
2. **Synthesize information** across both documents, identifying overlaps, complementary details, and unique insights from each
3. **Prioritize KPIs** based on frequency of mention, context of importance, and alignment to strategic goals stated in the materials
4. **Categorize technology initiatives** based on their purpose, scope, and business impact
5. **Structure the narrative** to flow logically from business fundamentals → current state → future vision → measurement (KPIs) → enablement (technology)

Deeply consider how all elements connect: how KPIs measure progress toward strategic goals, how technology initiatives enable operational improvements, how current state challenges inform future state priorities.
</analysis_approach>

<output>
Save the comprehensive documentation to:
`./docs/AAS-Business-Overview.md`

The document should be substantial (likely 15-25+ pages when rendered) given the comprehensive scope. Quality and completeness are more important than brevity.
</output>

<verification>
Before declaring complete, verify your documentation includes:

✓ All major sections outlined in documentation_requirements are present
✓ Every KPI has all specified details (name, definition, baseline, target, frequency, owner, rationale, data source)
✓ Technology initiatives inventory is comprehensive with moderate detail level
✓ HIPAA/PHI compliance is explicitly addressed with specific initiatives
✓ Both KPI organization schemes are present (by function AND by priority tier)
✓ Executive summary provides genuine high-level understanding without requiring reading the full document
✓ Specific data points, numbers, and metrics from source documents are cited throughout
✓ All acronyms and industry terms are defined in appendix
✓ Document reads coherently as a standalone reference (someone unfamiliar with AAS can understand the business)
✓ An LLM could use this to create accurate KPI dashboards with proper context

Read through the complete document once to ensure flow, completeness, and clarity.
</verification>

<success_criteria>
- Comprehensive business documentation saved to `./docs/AAS-Business-Overview.md`
- Document thoroughly covers all 8 required sections with substantial depth
- All KPIs are documented with complete specifications and dual organization (function + priority)
- Technology initiatives inventory is complete with moderate detail
- HIPAA/PHI compliance initiatives are explicitly detailed
- Document is actionable for dashboard creation and business intelligence use
- Quality check completed confirming coherence and completeness
</success_criteria>