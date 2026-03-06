import { initializeOrgArchitectureData, recalculateTransitionHcQuota } from '../src/mocks/orgData'

const run = async () => {
  initializeOrgArchitectureData()
  const result = await recalculateTransitionHcQuota()
  const report = {
    mode: result.mode,
    total: result.total,
    success: result.success,
    failed: result.failed,
    failures: result.failures
  }
  console.log(JSON.stringify(report, null, 2))
  if (result.failed > 0) {
    process.exitCode = 1
  }
}

run()
