import { describe, expect, it } from 'vitest'
import { mapProjectEnvelope, mapProjectsEnvelope, mapTaskEnvelope, mapTasksEnvelope } from '../layers/projects/server/utils/projects.mapper'

const project = {
  id: 'project-1',
  owner_id: 'user-1',
  name: 'Demo project',
  key: 'demo',
  description: null,
  status: 'active' as const,
  tasks_count: 1
}

const task = {
  id: 'task-1',
  project_id: 'project-1',
  owner_id: 'user-1',
  title: 'Write docs',
  description: null,
  status: 'todo' as const,
  priority: 'medium' as const
}

describe('Projects API mapper', () => {
  it('maps the documented Zolta envelope into the browser collection shape', () => {
    expect(mapProjectsEnvelope({ data: { projects: [project] } } as any)).toEqual({ projects: [project] })
  })

  it('also accepts an already-unwrapped collection payload', () => {
    expect(mapProjectsEnvelope({ projects: [project] })).toEqual({ projects: [project] })
  })

  it('maps singular project and task envelopes', () => {
    expect(mapProjectEnvelope({ data: { project } } as any)).toEqual({ project })
    expect(mapTaskEnvelope({ data: { task } } as any)).toEqual({ task })
  })

  it('maps a project task response without leaking the upstream envelope', () => {
    expect(mapTasksEnvelope({ data: { project, tasks: [task] } } as any)).toEqual({ project, tasks: [task] })
  })
})
