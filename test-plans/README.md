# Test plans and traceability

Store each reviewed plan as a Markdown file for human review and a JSON file for
tooling. Keep scenario IDs stable when wording changes; do not reuse retired IDs.
Use the same ID in the plan, automated test title, and relevant test annotations.

The JSON `status` must be `approved` before an agent generates automation from a
plan. Drafts, examples, and plans with unresolved blocking questions are not
generation inputs. Record approver and approval date in the plan's `approval`
object; this bootstrap example deliberately remains a draft.

Recommended scenario fields: `id`, `requirement`, `title`, `type`, `priority`,
`preconditions`, `steps`, `expectedResults`, and `automationStatus`.
