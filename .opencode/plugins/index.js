const EDIT_TOOLS = new Set([
  "edit",
  "write",
  "multiedit",
  "apply_patch",
])

async function runCheck($, name, command) {
  try {
    await $`${{ raw: command }}`.quiet()
    console.log(`✅ ${name} passed`)
    return { ok: true, name, command }
  } catch (err) {
    const stdout = String(err.stdout || "").trim()
    const stderr = String(err.stderr || "").trim()
    const message = String(err.message || err).trim()

    console.error(`❌ ${name} failed`)

    return {
      ok: false,
      name,
      command,
      stdout,
      stderr,
      message,
    }
  }
}

function formatFailure(results) {
  return results
    .filter((r) => !r.ok)
    .map((r) => {
      return `
Hook failed: ${r.name}

Command:
${r.command}

STDOUT:
${r.stdout || "No stdout"}

STDERR:
${r.stderr || "No stderr"}

ERROR:
${r.message || "No extra error"}

Fix the issue above, then edit the files again so hooks rerun.
`.trim()
    })
    .join("\n\n---\n\n")
}

export const HooksDemo = async ({ $ }) => {
  return {
    "tool.execute.after": async (input) => {
      if (!EDIT_TOOLS.has(input.tool)) return

      const results = [
        await runCheck($, "Python compile check", "python -m compileall ."),
        await runCheck($, "Docker build check", "docker build -t taskflow-backend backend/"),
      ]

      const failed = results.filter((r) => !r.ok)

      if (failed.length > 0) {
        throw new Error(formatFailure(results))
      }

      console.log("✅ hooks-demo: all checks passed")
    },
  }
}
