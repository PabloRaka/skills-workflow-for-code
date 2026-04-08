# Example 2: Dependency Vulnerability Scan (CVE Detection)

## Mission
Scan project dependencies for known CVEs and supply chain risks, providing upgrade paths and mitigation strategies.

## Input
```json
{
  "package_manager": "npm",
  "dependencies": {
    "express": "4.17.1",
    "lodash": "4.17.19",
    "jsonwebtoken": "8.5.1",
    "axios": "0.21.0",
    "tar": "4.4.13"
  }
}
```

## Scan Results

| Package | Current | CVE | Severity | Fix Version |
|:--------|:--------|:----|:---------|:------------|
| lodash | 4.17.19 | CVE-2021-23337 | 🔴 Critical | 4.17.21 |
| axios | 0.21.0 | CVE-2021-3749 | 🟠 High | 0.21.2+ |
| tar | 4.4.13 | CVE-2021-37701 | 🟠 High | 4.4.19+ |
| jsonwebtoken | 8.5.1 | CVE-2022-23529 | 🟡 Medium | 9.0.0 |
| express | 4.17.1 | — | 🟢 Safe | — |

## Remediation Commands

```bash
# Critical — fix immediately
npm install lodash@4.17.21

# High — fix within 48 hours
npm install axios@1.6.0
npm install tar@6.2.0

# Medium — fix within 1 week (breaking change: major version)
npm install jsonwebtoken@9.0.2

# Verify all fixes
npm audit
```

## Agent Output (Standard Data Schema v2.0)

```json
{
  "agent_name": "security-agent",
  "timestamp": "2026-04-08T14:00:00Z",
  "status": "success",
  "confidence": 0.94,
  "input_received": {
    "from_agent": null,
    "task_summary": "Scan npm dependencies for known CVEs",
    "summarized": false,
    "artifact_refs": []
  },
  "output": {
    "type": "analysis",
    "data": {
      "scan_type": "dependency_vulnerability",
      "package_manager": "npm",
      "total_packages_scanned": 5,
      "vulnerabilities": [
        {"package": "lodash", "current": "4.17.19", "cve": "CVE-2021-23337", "risk": "critical", "fix": "4.17.21", "type": "Command Injection"},
        {"package": "axios", "current": "0.21.0", "cve": "CVE-2021-3749", "risk": "high", "fix": "0.21.2+", "type": "ReDoS"},
        {"package": "tar", "current": "4.4.13", "cve": "CVE-2021-37701", "risk": "high", "fix": "4.4.19+", "type": "Arbitrary File Write"},
        {"package": "jsonwebtoken", "current": "8.5.1", "cve": "CVE-2022-23529", "risk": "medium", "fix": "9.0.0", "type": "Insecure Key Handling"}
      ],
      "overall_risk": "critical",
      "breaking_changes": ["jsonwebtoken 8.x → 9.x requires API changes"],
      "recommendations": [
        "Enable npm audit in CI/CD pipeline",
        "Use dependabot or renovate for auto-updates",
        "Pin exact versions in production",
        "Review transitive dependencies regularly"
      ]
    },
    "reasoning_log": [{"step": "plan", "description": "Auto-generated adherence to Reasoning Protocol."}],
    "impact_assessment": {"areas_affected": ["local context"], "risks": ["none"]},
    "artifacts": ["cve-report.md", "remediation-script.sh"]
  },
  "context_info": {
    "input_tokens": 500,
    "output_tokens": 1800,
    "summarized": false,
    "pruned_fields": []
  },
  "metadata": {
    "execution_time_ms": 1500,
    "tokens_used": 2300,
    "retry_count": 0,
    "risk_level": "low",
    "approval_status": "not_required",
    "checkpoint_id": null
  }
}
```

## Best Practices Applied
- Automated CVE database lookup for each dependency
- Severity-based prioritization with fix timelines
- Breaking change warnings for major version upgrades
- CI/CD integration recommendations
