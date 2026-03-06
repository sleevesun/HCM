import { initializeOrgArchitectureData } from '../src/mocks/orgData'

const report = initializeOrgArchitectureData(true)

if (!report.valid) {
  process.exitCode = 1
}

console.log('组织架构预设完成', report)
