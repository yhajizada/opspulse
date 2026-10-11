const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding OpsPulse enterprise reliability database...");

  // 1. Organization
  const org = await prisma.organization.upsert({
    where: { slug: "nexus-global" },
    update: {},
    create: {
      id: "org_nexus_sre",
      name: "Nexus Global Infrastructure",
      slug: "nexus-global",
      plan: "ENTERPRISE",
    },
  });

  // 2. Users
  const userYusif = await prisma.user.upsert({
    where: { email: "yusif@opspulse.io" },
    update: {},
    create: {
      id: "usr_yhajizada",
      name: "Yusif Hajizada",
      email: "yusif@opspulse.io",
      role: "INCIDENT_COMMANDER",
      phone: "+1 (555) 019-2831",
      organizationId: org.id,
    },
  });

  const userElena = await prisma.user.upsert({
    where: { email: "elena.sre@nexus.cloud" },
    update: {},
    create: {
      id: "usr_elena",
      name: "Elena Rostova",
      email: "elena.sre@nexus.cloud",
      role: "SRE_ENGINEER",
      phone: "+1 (555) 019-4820",
      organizationId: org.id,
    },
  });

  const userMarcus = await prisma.user.upsert({
    where: { email: "marcus.v@nexus.cloud" },
    update: {},
    create: {
      id: "usr_marcus",
      name: "Marcus Vance",
      email: "marcus.v@nexus.cloud",
      role: "SRE_ENGINEER",
      phone: "+1 (555) 019-7711",
      organizationId: org.id,
    },
  });

  // 3. Services Catalog
  const svcPayment = await prisma.service.upsert({
    where: { slug: "payment-gateway" },
    update: {},
    create: {
      id: "svc_payment",
      name: "Payment Gateway API",
      slug: "payment-gateway",
      description: "Credit card processing and external payment provider integration layer",
      tier: "TIER_1",
      status: "OPERATIONAL",
      sloTargetPercent: 99.99,
      errorBudgetPercent: 99.4,
      ownerTeam: "FinTech Core",
      repoUrl: "https://github.com/nexus/payment-gateway",
      organizationId: org.id,
    },
  });

  const svcAuth = await prisma.service.upsert({
    where: { slug: "identity-auth" },
    update: {},
    create: {
      id: "svc_auth",
      name: "Identity & Auth Service",
      slug: "identity-auth",
      description: "OAuth2 / OIDC token issuance, MFA validation, and RBAC policy enforcement",
      tier: "TIER_1",
      status: "OPERATIONAL",
      sloTargetPercent: 99.95,
      errorBudgetPercent: 98.7,
      ownerTeam: "SecOps & Auth",
      repoUrl: "https://github.com/nexus/auth-core",
      organizationId: org.id,
    },
  });

  const svcOrders = await prisma.service.upsert({
    where: { slug: "order-processing" },
    update: {},
    create: {
      id: "svc_orders",
      name: "Order Processing Engine",
      slug: "order-processing",
      description: "Distributed checkout state machine and inventory reservation Kafka consumers",
      tier: "TIER_1",
      status: "DEGRADED",
      sloTargetPercent: 99.9,
      errorBudgetPercent: 78.4,
      ownerTeam: "Commerce SRE",
      repoUrl: "https://github.com/nexus/orders-engine",
      organizationId: org.id,
    },
  });

  const svcSearch = await prisma.service.upsert({
    where: { slug: "search-recommendations" },
    update: {},
    create: {
      id: "svc_search",
      name: "Catalog Search & Discovery",
      slug: "search-recommendations",
      description: "Elasticsearch vector embeddings and query ranking engine",
      tier: "TIER_2",
      status: "OPERATIONAL",
      sloTargetPercent: 99.5,
      errorBudgetPercent: 96.1,
      ownerTeam: "Search & Discovery",
      organizationId: org.id,
    },
  });

  // 4. Service Dependencies
  await prisma.serviceDependency.upsert({
    where: {
      sourceServiceId_targetServiceId: {
        sourceServiceId: svcOrders.id,
        targetServiceId: svcAuth.id,
      },
    },
    update: {},
    create: {
      sourceServiceId: svcOrders.id,
      targetServiceId: svcAuth.id,
      dependencyType: "CRITICAL",
    },
  });

  await prisma.serviceDependency.upsert({
    where: {
      sourceServiceId_targetServiceId: {
        sourceServiceId: svcOrders.id,
        targetServiceId: svcPayment.id,
      },
    },
    update: {},
    create: {
      sourceServiceId: svcOrders.id,
      targetServiceId: svcPayment.id,
      dependencyType: "CRITICAL",
    },
  });

  // 5. Escalation Policy
  const escalationPolicy = await prisma.escalationPolicy.upsert({
    where: { id: "ep_tier1_prod" },
    update: {},
    create: {
      id: "ep_tier1_prod",
      name: "Tier-1 Production Mission Critical Ladder",
      description: "Default escalation for customer-facing outages across tier-1 infrastructure.",
      isDefault: true,
      repeatCount: 3,
      organizationId: org.id,
    },
  });

  // Escalation Steps
  const existingSteps = await prisma.escalationStep.findFirst({
    where: { policyId: escalationPolicy.id },
  });

  if (!existingSteps) {
    await prisma.escalationStep.createMany({
      data: [
        {
          policyId: escalationPolicy.id,
          stepOrder: 1,
          delayMinutes: 0,
          targetType: "USER",
          targetUserId: userElena.id,
        },
        {
          policyId: escalationPolicy.id,
          stepOrder: 2,
          delayMinutes: 5,
          targetType: "USER",
          targetUserId: userMarcus.id,
        },
        {
          policyId: escalationPolicy.id,
          stepOrder: 3,
          delayMinutes: 15,
          targetType: "USER",
          targetUserId: userYusif.id,
        },
      ],
    });
  }

  // 6. On-Call Schedule & Shifts
  const schedule = await prisma.onCallSchedule.upsert({
    where: { id: "sched_global_sre" },
    update: {},
    create: {
      id: "sched_global_sre",
      name: "Global 24x7 SRE Primary Rotation",
      timezone: "UTC",
      rotationType: "WEEKLY",
      organizationId: org.id,
    },
  });

  const now = new Date();
  const nextWeek = new Date(now.getTime() + 1000 * 60 * 60 * 24 * 7);

  await prisma.onCallShift.create({
    data: {
      scheduleId: schedule.id,
      userId: userElena.id,
      role: "PRIMARY",
      startDate: new Date(now.getTime() - 1000 * 60 * 60 * 24 * 2),
      endDate: nextWeek,
    },
  });

  await prisma.onCallShift.create({
    data: {
      scheduleId: schedule.id,
      userId: userMarcus.id,
      role: "SECONDARY",
      startDate: new Date(now.getTime() - 1000 * 60 * 60 * 24 * 2),
      endDate: nextWeek,
    },
  });

  // 7. Active Incident (INC-4091)
  const activeIncident = await prisma.incident.upsert({
    where: { id: "inc_4091" },
    update: {},
    create: {
      id: "inc_4091",
      title: "Order Processing Engine: Elevated HTTP 504 Gateway Timeouts on Checkout Consumers",
      description:
        "Kafka consumer lag spike detected across cluster us-east-1. Checkout requests experiencing P99 latency > 6.2s.",
      severity: "P1_CRITICAL",
      status: "INVESTIGATING",
      serviceId: svcOrders.id,
      escalationPolicyId: escalationPolicy.id,
      commanderId: userYusif.id,
      startedAt: new Date(now.getTime() - 1000 * 60 * 38), // 38 mins ago
      acknowledgedAt: new Date(now.getTime() - 1000 * 60 * 34),
      mttaMinutes: 4,
      slackChannel: "#war-room-inc-4091",
      zoomMeetingUrl: "https://zoom.internal/j/994019283",
      customerImpactSummary: "Approximately 4.2% of checkout attempts timing out in US-East region.",
      organizationId: org.id,
    },
  });

  // Timeline Events for Active Incident
  await prisma.incidentTimelineEvent.createMany({
    data: [
      {
        incidentId: activeIncident.id,
        timestamp: new Date(now.getTime() - 1000 * 60 * 38),
        authorName: "Datadog Monitor (Automated)",
        eventType: "ALERT_LINKED",
        message: "Triggered monitor: [Critical] Order Processing P99 Latency > 5000ms threshold breached.",
      },
      {
        incidentId: activeIncident.id,
        timestamp: new Date(now.getTime() - 1000 * 60 * 34),
        authorName: "Elena Rostova (SRE)",
        eventType: "STATUS_CHANGE",
        message: "Incident acknowledged by Primary On-Call. Investigating partition rebalances on Kafka brokers.",
      },
      {
        incidentId: activeIncident.id,
        timestamp: new Date(now.getTime() - 1000 * 60 * 25),
        authorName: "Yusif Hajizada (Incident Commander)",
        eventType: "ROLE_ASSIGNMENT",
        message: "Yusif Hajizada assumed Incident Commander role. War room #war-room-inc-4091 bridge activated.",
      },
      {
        incidentId: activeIncident.id,
        timestamp: new Date(now.getTime() - 1000 * 60 * 12),
        authorName: "Elena Rostova (SRE)",
        eventType: "NOTE",
        message: "Identified memory leak in consumer worker thread pool pod-order-proc-881. Initiating rolling restart of 12 worker replicas.",
      },
    ],
  });

  // Alerts linked to active incident
  await prisma.alert.createMany({
    data: [
      {
        source: "DATADOG",
        title: "Order Processing Consumer Lag > 15,000 msgs",
        fingerprint: "dd_orders_lag_east",
        status: "FIRING",
        severity: "CRITICAL",
        serviceId: svcOrders.id,
        incidentId: activeIncident.id,
        firedAt: new Date(now.getTime() - 1000 * 60 * 38),
      },
      {
        source: "PROMETHEUS",
        title: "KafkaBrokerPartitionUnderReplicated: broker-04",
        fingerprint: "prom_kafka_partition_underrep",
        status: "FIRING",
        severity: "HIGH",
        serviceId: svcOrders.id,
        incidentId: activeIncident.id,
        firedAt: new Date(now.getTime() - 1000 * 60 * 36),
      },
    ],
  });

  // 8. Historical Resolved Incidents
  const resolvedIncident = await prisma.incident.upsert({
    where: { id: "inc_4089" },
    update: {},
    create: {
      id: "inc_4089",
      title: "Payment Gateway: Webhook HMAC Signature Validation Clock Skew",
      description: "NTP daemon drift on edge ingress nodes caused valid third-party webhook signatures to be rejected.",
      severity: "P2_MAJOR",
      status: "RESOLVED",
      serviceId: svcPayment.id,
      commanderId: userYusif.id,
      startedAt: new Date(now.getTime() - 1000 * 60 * 60 * 28),
      acknowledgedAt: new Date(now.getTime() - 1000 * 60 * 60 * 28 + 1000 * 60 * 3),
      resolvedAt: new Date(now.getTime() - 1000 * 60 * 60 * 28 + 1000 * 60 * 27),
      mttaMinutes: 3,
      mttrMinutes: 24,
      organizationId: org.id,
    },
  });

  // Post-Mortem for resolved incident
  const postMortem = await prisma.postMortem.upsert({
    where: { incidentId: resolvedIncident.id },
    update: {},
    create: {
      incidentId: resolvedIncident.id,
      summary: "Inbound payment provider webhooks failed signature checks due to a 4.8s chrony NTP drift across 3 edge nodes.",
      rootCause: "Chrony daemon failed silently following a kernel patch reboot without systemd restart hook.",
      triggerCause: "Edge node restart sequence initiated by autoscaling group refresh.",
      fiveWhysJson: JSON.stringify([
        "Why did payments fail? Inbound webhooks were rejected as expired.",
        "Why were webhooks expired? System clock had drifted 4.8s behind UTC.",
        "Why did the clock drift? Chronyd process terminated unexpectedly.",
        "Why was Chronyd terminated? Kernel update required node reboot.",
        "Why didn't Chronyd restart? systemd unit file lacked Restart=always directive.",
      ]),
      lessonsLearned: "All host provisioning templates must enforce automated NTP health checks in kubelet readiness probes.",
      status: "PUBLISHED",
      publishedAt: new Date(),
    },
  });

  await prisma.actionItem.createMany({
    data: [
      {
        postMortemId: postMortem.id,
        title: "Add node-exporter clock drift alert (alert if offset > 100ms)",
        assigneeId: userElena.id,
        status: "DONE",
        priority: "CRITICAL",
      },
      {
        postMortemId: postMortem.id,
        title: "Audit all base AMI systemd services for restart reliability",
        assigneeId: userMarcus.id,
        status: "IN_PROGRESS",
        priority: "HIGH",
      },
    ],
  });

  console.log("OpsPulse enterprise database seeded successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
