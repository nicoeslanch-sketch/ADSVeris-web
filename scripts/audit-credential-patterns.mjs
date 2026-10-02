// Read-only, limited pattern check. Never prints matching values.
import { execFileSync } from 'node:child_process'
const pattern = 'ghp_[A-Za-z0-9]{20,}|github_pat_[A-Za-z0-9_]{20,}|SG\\.[A-Za-z0-9_-]{20,}\\.|BEGIN (RSA |EC |OPENSSH )?PRIVATE KEY'
const commits = execFileSync('git', ['rev-list', '--all'], { encoding: 'utf8' }).trim().split('\n').filter(Boolean)
const matches = new Set()
for (const commit of commits) {
  try {
    const output = execFileSync('git', ['grep', '-I', '-l', '-E', pattern, commit], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] })
    for (const line of output.trim().split('\n')) matches.add(line.slice(commit.length + 1))
  } catch (error) { if (error.status !== 1) throw error }
}
console.log(JSON.stringify({ scope: 'tracked history, recognizable credential patterns only', commitsChecked: commits.length, matchingFiles: [...matches] }))
if (matches.size) process.exitCode = 1
