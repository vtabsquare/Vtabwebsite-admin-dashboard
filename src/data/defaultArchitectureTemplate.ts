import type { FiveScreenArchitectureData } from '../types/architecture';

export const createDefaultArchitectureTemplate = (title: string, category: string): FiveScreenArchitectureData => {
  const cleanTitle = title || 'Enterprise Solution';
  const cleanCategory = category || 'ENTERPRISE INTELLIGENCE';

  return {
    topBadge: `${cleanTitle.toUpperCase()} SUITE · V2.4.1 PRODUCTION`,
    eyebrow: 'END-TO-END PIPELINE ARCHITECTURE',
    pipelineHeadline: `Engineered for the complete ${cleanTitle.toLowerCase()} lifecycle.`,
    pipelineDescription: `From automated parameter ingestion and contextual parsing to high-throughput synthesis and audit-ready verification, every stage is optimized for zero-slippage enterprise execution.`,
    pipelineStages: [
      {
        id: 'stage-1',
        stageNumber: '01',
        stageTag: `STAGE 01 OF 04 · Data Ingestion & Parameter Capture`,
        stageHeadline: 'Ingest & Parameterize',
        stageDescription: `Multi-source data ingestion, schema parsing, and contextual cataloging across enterprise systems.`,
        bullets: [
          'High-throughput raw data ingestion with schema validation',
          'Automated normalization and error boundary checking',
          'Real-time tokenized telemetry and security verification'
        ],
        bottomBadges: ['Schema Compliant', 'Real-Time Vectorization', 'TLS 1.3 Strict'],
        activeNode: `${cleanTitle} Ingestion Engine`,
        streamStates: [
          { name: 'Core Schema Registry', status: 'LIVE', detail: '100% Validated' },
          { name: 'Telemetry & Event Stream', status: 'LIVE', detail: 'Sub-second Latency' },
          { name: 'Security Policy Validator', status: 'LIVE', detail: 'Zero-Trust Gate' }
        ],
        filterStatus: 'Integrity Guard: 100% mathematical consistency with zero pipeline discrepancy.'
      },
      {
        id: 'stage-2',
        stageNumber: '02',
        stageTag: `STAGE 02 OF 04 · Contextual Resolution & Transformation`,
        stageHeadline: 'Index & Resolve',
        stageDescription: `Dynamic contextual indexation matching rules, domain taxonomies, and live transactional state.`,
        bullets: [
          'Rule-based and LLM-assisted semantic alignment',
          'Real-time reconciliation against enterprise master records',
          'Automated dependency resolution and DAG compilation'
        ],
        bottomBadges: ['AST Transpiled', 'Master Entity Matched', 'Sub-15ms Latency'],
        activeNode: 'Semantic Transformation Engine',
        streamStates: [
          { name: 'Domain Taxonomy Mesh', status: 'LIVE', detail: 'Synchronized' },
          { name: 'Transformation Compiler', status: 'LIVE', detail: 'AST Parity Verified' },
          { name: 'Anomaly Interceptor', status: 'ACTIVE', detail: 'Zero Drift Detected' }
        ],
        filterStatus: 'Transformation Filter: 0% semantic loss across intermediate execution layers.'
      },
      {
        id: 'stage-3',
        stageNumber: '03',
        stageTag: `STAGE 03 OF 04 · Autonomous Synthesis & Engine Execution`,
        stageHeadline: 'Synthesize & Quantify',
        stageDescription: `High-precision quantification engine calculating analytical projections and automated outputs.`,
        bullets: [
          'Dynamic multi-tier computation with automated verification gates',
          'Zero-drift execution pipeline operating on validated contracts',
          'Deterministic fallback routing for complex edge cases'
        ],
        bottomBadges: ['Contract V2 Enforced', 'Zero Hallucination', 'Audit Logging'],
        activeNode: 'Autonomous Synthesis Core',
        streamStates: [
          { name: 'Synthesis Engine Cluster', status: 'LIVE', detail: 'Active-Active Nodes' },
          { name: 'Deterministic Verification Gate', status: 'ACTIVE', detail: 'Gate Passed' },
          { name: 'Audit Trail Dispatcher', status: 'LIVE', detail: 'Immutable Ledger' }
        ],
        filterStatus: 'Engine Precision: 99.9% deterministic execution accuracy.'
      },
      {
        id: 'stage-4',
        stageNumber: '04',
        stageTag: `STAGE 04 OF 04 · Document Generation & Enterprise Delivery`,
        stageHeadline: 'Generate & Deliver',
        stageDescription: `Vector document generation, cloud synchronization, and automated notification dispatch.`,
        bullets: [
          'Audit-ready vector PDF & high-res export generation',
          'Transactional email dispatch and automated notification webhooks',
          'Instant cloud synchronization with enterprise ledgers and data lakes'
        ],
        bottomBadges: ['Vector PDF Rendered', 'Multi-Channel Push', 'Enterprise Cloud Synced'],
        activeNode: 'Cloud Distribution Gateway',
        streamStates: [
          { name: 'PDF & Vector Renderer', status: 'LIVE', detail: 'ReportLab / Playwright' },
          { name: 'Transactional Dispatcher', status: 'LIVE', detail: 'Brevo SMTP Active' },
          { name: 'Cloud Ledger Mesh', status: 'LIVE', detail: 'Dataverse / Delta Sync' }
        ],
        filterStatus: 'Delivery Status: Dispatched with sub-second receipt confirmation.'
      }
    ],
    capabilitiesHeadline: `Interactive ${cleanTitle.toLowerCase()} capabilities.`,
    capabilitiesDescription: `Select a capability below to explore how ${cleanTitle} powers enterprise workflows and continuous operational excellence.`,
    capabilities: [
      {
        id: 'cap-1',
        name: 'Autonomous Synthesis',
        shortName: 'Autonomous Synthesis',
        categoryTag: `SYNTHESIS · ${cleanCategory.toUpperCase()}`,
        headline: 'Deterministic Autonomous Synthesis',
        description: 'Convert raw input parameters into structured, verifiable enterprise outputs without manual overhead.',
        bullets: [
          'Deterministic schema conversion with zero syntactic hallucinations',
          'Context-aware parameter grounding and automated rule matching',
          'Sub-second batch throughput scaling to millions of transactions'
        ],
        specs: [
          { label: 'SYNTHESIS LATENCY', value: '< 15 ms' },
          { label: 'ACCURACY SLA', value: '99.9%' }
        ]
      },
      {
        id: 'cap-2',
        name: 'Dynamic Engine Rules',
        shortName: 'Rules Engine',
        categoryTag: `GOVERNANCE · RULES & POLICIES`,
        headline: 'Dynamic Policy & Rules Engine',
        description: 'Real-time policy validation ensuring corporate compliance and governance across every transaction.',
        bullets: [
          'Enforces fine-grained corporate compliance protocols',
          'Automated audit-logging with immutable timestamping',
          'Live anomaly interceptor preventing corrupt state commits'
        ],
        specs: [
          { label: 'POLICY CHECK', value: 'Sub-Millisecond' },
          { label: 'DRIFT TOLERANCE', value: '0.00%' }
        ]
      },
      {
        id: 'cap-3',
        name: 'Observability & Metrics',
        shortName: 'Telemetry & OTel',
        categoryTag: `OBSERVABILITY · TELEMETRY`,
        headline: 'OpenTelemetry Distributed Observability',
        description: 'End-to-end tracing and health telemetry tracking operational performance across distributed nodes.',
        bullets: [
          'Full-trace distributed span recording across all execution nodes',
          'Root-cause diagnostic engine highlighting bottlenecks automatically',
          'Exportable Prometheus and Grafana metrics feeds'
        ],
        specs: [
          { label: 'TRACE COVERAGE', value: '100% Transactions' },
          { label: 'UPTIME SLA', value: '99.99%' }
        ]
      },
      {
        id: 'cap-4',
        name: 'Enterprise Cloud Mesh',
        shortName: 'Cloud Mesh',
        categoryTag: `INTEGRATION · CLOUD SYNC`,
        headline: 'Federated Enterprise Cloud Sync',
        description: 'Direct bi-directional synchronization with cloud ledgers, ERP systems, and modern data warehouses.',
        bullets: [
          'Native integration with Azure AD, Supabase, and Microsoft Dataverse',
          'Zero cloud credential exposure with tokenized bearer authentication',
          'Automated data reconciliation preventing ledger discrepancy'
        ],
        specs: [
          { label: 'SYNC PROTOCOL', value: 'OData / REST / gRPC' },
          { label: 'SECURITY TIER', value: 'TLS 1.3 / SOC 2' }
        ]
      },
      {
        id: 'cap-5',
        name: 'Audit-Ready Reports',
        shortName: 'Audit Reports',
        categoryTag: `DELIVERY · AUDIT EXPORT`,
        headline: 'Audit-Ready PDF & Document Synthesis',
        description: 'Generate legally verifiable documents with cryptographic checksums and vector precision.',
        bullets: [
          'Automated vector PDF report generation with digital stamping',
          'Structured JSON, Excel, and CSV export for compliance filing',
          'Automatic transactional email dispatch with delivery verification'
        ],
        specs: [
          { label: 'RENDER SPEED', value: '< 2.0s' },
          { label: 'LEGAL FORMAT', value: 'ISO 19005 (PDF/A)' }
        ]
      },
      {
        id: 'cap-6',
        name: 'Multi-Channel Dispatch',
        shortName: 'Distribution',
        categoryTag: `COMMUNICATION · AUTOMATION`,
        headline: 'Multi-Channel Alerting & Webhooks',
        description: 'Instant notification dispatch across email, enterprise messaging, and webhook endpoints.',
        bullets: [
          'Brevo SMTP transactional email gateway with sub-second delivery',
          'Slack, Microsoft Teams, and Webhook dispatch pipelines',
          'Event-driven architecture with automated retry policies'
        ],
        specs: [
          { label: 'DISPATCH LATENCY', value: '< 500 ms' },
          { label: 'RETRY POLICY', value: 'Exponential Backoff' }
        ]
      }
    ],
    deepDiveHeadline: 'Engineered layer by layer for security, compliance, and real-time speed.',
    deepDiveDescription: `Every tier of the ${cleanTitle} architecture is purpose-built to eliminate manual operations and enforce strict corporate data governance.`,
    deepDiveLayers: [
      {
        layerNumber: '01',
        sectionTag: 'LAYER 01 · INGESTION & DATA FEDERATION',
        headline: 'Enterprise-grade ingestion & protocol federation.',
        description: 'Seamlessly capture raw data across REST, gRPC, database CDC streams, and multi-tenant webhook events.',
        bullets: [
          'Decoupled buffer queues supporting sudden throughput spikes without message loss',
          'Client-side cryptographic sessions ensuring zero persistent credential storage',
          'Automated payload normalization into strictly typed contracts'
        ],
        tags: ['WebRTC', 'FastAPI', 'gRPC', 'TLS 1.3'],
        rightBoxTitle: 'Active Knowledge Ingestion Mesh',
        rightBoxSubtitle: 'Live Stream Ingestion & Decoding',
        rightBoxItems: [
          { label: 'Ingestion Pipeline Gateway', status: 'LIVE', detail: 'Active' },
          { label: 'Schema Contract Validator', status: 'LIVE', detail: '100% Passed' },
          { label: 'Memory Buffer Sanitizer', status: 'PURGED', detail: 'Zero RAM Leak' }
        ]
      },
      {
        layerNumber: '02',
        sectionTag: 'LAYER 02 · PARSING & SEMANTIC REPAIR',
        headline: 'Deterministic AST compilation & semantic validation.',
        description: 'Convert unstructured or legacy queries and inputs into verified, optimized execution trees.',
        bullets: [
          'High-speed AST transformation operating at over 100K lines/sec',
          'Domain-trained statistical models identifying and repairing edge-case discrepancies',
          'Instant validation preventing malformed syntax from touching production engines'
        ],
        tags: ['AST Parser', 'Tree-Sitter', 'PyMuPDF', 'Pandas'],
        rightBoxTitle: 'Deterministic AST Compiler',
        rightBoxSubtitle: 'Syntax & Semantic Verification',
        rightBoxItems: [
          { label: 'Abstract Syntax Tree (AST)', status: 'COMPILED', detail: 'Zero Syntax Errors' },
          { label: 'Type Integrity Checker', status: 'ACTIVE', detail: 'Strict Types Enforced' },
          { label: 'Semantic Optimization Pass', status: 'APPLIED', detail: '10x Faster Execution' }
        ]
      },
      {
        layerNumber: '03',
        sectionTag: 'LAYER 03 · EXECUTION & CALCULATION ENGINE',
        headline: 'High-throughput computational core & reconciliation.',
        description: 'Execute dynamic calculations, multi-floor bill of quantities, and continuous compliance checks.',
        bullets: [
          'Parallelized worker clusters with automated load distribution',
          'Built-in rate indexation matching live market indices and regional price tiers',
          'Zero-drift reconciliation between estimated metrics and actual ledger commits'
        ],
        tags: ['Python Engine', 'PyTorch', 'Vector Index', 'Redis Cache'],
        rightBoxTitle: 'High-Throughput Calculation Core',
        rightBoxSubtitle: 'Live Compute & Reconciliation Nodes',
        rightBoxItems: [
          { label: 'Worker Execution Pods', status: 'HEALTHY', detail: 'Auto-scaled' },
          { label: 'Dynamic Price & Rate Index', status: 'SYNCHRONIZED', detail: 'Real-time' },
          { label: 'Mathematical Reconciliation', status: 'OPTIMAL', detail: 'Zero Variance' }
        ]
      },
      {
        layerNumber: '04',
        sectionTag: 'LAYER 04 · PERSISTENCE & MULTI-CLOUD AUDIT',
        headline: 'Encrypted persistence, audit trails, and multi-tenant isolation.',
        description: 'Persist state with row-level security, immutable changelogs, and enterprise governance compliance.',
        bullets: [
          'Row-level security (RLS) ensuring strict multi-tenant boundary isolation',
          'Immutable audit logging compliant with SOC 2, HIPAA, and GDPR standards',
          'Real-time webhook notifications alerting stakeholders on critical workflow milestones'
        ],
        tags: ['Supabase', 'PostgreSQL', 'Brevo SMTP', 'SOC 2 Ready'],
        rightBoxTitle: 'Enterprise Persistence Gateway',
        rightBoxSubtitle: 'Encrypted Ledger & Audit Mesh',
        rightBoxItems: [
          { label: 'Encrypted Database (AES-256)', status: 'ONLINE', detail: 'Strict RLS' },
          { label: 'Immutable Audit Log Ledger', status: 'COMMITTED', detail: 'Tamper-Proof' },
          { label: 'Automated Alerting Webhook', status: 'DISPATCHED', detail: 'Sub-second' }
        ]
      }
    ],
    editionsHeadline: 'Enterprise deployment options tailored to your infrastructure.',
    editionsDescription: `Choose between lightweight developer studio configurations or high-throughput enterprise cloud clusters.`,
    editions: [
      {
        tier: 'Community & Professional',
        cardTag: 'DEVELOPER WORKSTATION',
        title: `${cleanTitle} Studio`,
        subtitle: 'Local-first execution for engineering and technical teams',
        badge: 'Zero Cloud Overhead',
        bullets: [
          'Lightweight local execution engine compatible with standard laptops',
          'Full-featured studio interface with real-time feedback loops',
          'Direct export to PDF, Excel, and structured JSON formats',
          'Community support with weekly feature updates'
        ],
        primaryCtaText: 'Schedule Technical Demo',
        specs: [
          { label: 'DEPLOYMENT', value: 'Local CLI / Web' },
          { label: 'MIN MEMORY', value: '4 GB RAM' },
          { label: 'SETUP TIME', value: '< 5 Minutes' }
        ],
        consoleTitle: 'Studio Local Runtime',
        consoleItems: [
          { label: 'Local Runtime Node', value: 'Active (Port 3000)' },
          { label: 'Local Storage Engine', value: 'SQLite / JSON Cache' },
          { label: 'Export Engine', value: 'Vector PDF & CSV Ready' }
        ]
      },
      {
        tier: 'Enterprise Suite',
        cardTag: 'MISSION-CRITICAL CLOUD',
        title: `${cleanTitle} Enterprise Cloud`,
        subtitle: 'Multi-tenant cloud cluster with SLA guarantee and SSO security',
        badge: 'Enterprise Production',
        bullets: [
          'Multi-region high availability with 99.99% uptime SLA',
          'Enterprise SSO (SAML, Okta, Azure AD MSAL) integration',
          'Automated daily backup, disaster recovery, and point-in-time restore',
          'Dedicated enterprise support with 1-hour priority response'
        ],
        primaryCtaText: 'Contact Enterprise Sales',
        specs: [
          { label: 'DEPLOYMENT', value: 'AWS / Azure / GCP' },
          { label: 'CONCURRENCY', value: 'Unlimited Pods' },
          { label: 'SLA GUARANTEE', value: '99.99% Uptime' }
        ],
        consoleTitle: 'Enterprise Cloud Cluster',
        consoleItems: [
          { label: 'Kubernetes Cluster', value: 'Active-Active Nodes' },
          { label: 'Security Compliance', value: 'SOC 2 & ISO 27001' },
          { label: 'Dedicated Account Manager', value: '24/7 SLA Backed' }
        ]
      }
    ]
  };
};
