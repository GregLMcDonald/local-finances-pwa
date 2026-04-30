import { useState } from 'react'
import { Layout } from '@/components/Layout'
import { Card } from '@/components/Card'
import { Button } from '@/components/Button'
import { Modal } from '@/components/Modal'
import { Input, Select } from '@/components/Input'
import { useAppData } from '@/context/AppDataContext'
import type { Task, TaskStatus, TaskPriority } from '@/lib/types'

const STATUS_CONFIG: Record<TaskStatus, { label: string; icon: string; color: string }> = {
  todo: { label: 'To Do', icon: '○', color: 'text-muted' },
  in_progress: { label: 'In Progress', icon: '◔', color: 'text-accent-yellow' },
  done: { label: 'Done', icon: '✓', color: 'text-accent-green' },
}

const PRIORITY_COLOR: Record<TaskPriority, string> = {
  low: 'text-muted',
  medium: 'text-accent-yellow',
  high: 'text-accent-red',
}

function blank(): Omit<Task, 'id' | 'createdAt'> {
  return { title: '', description: '', status: 'todo', priority: 'medium', dueDate: '' }
}

export function Tasks() {
  const { data, setTasks } = useAppData()
  const [modal, setModal] = useState(false)
  const [editing, setEditing] = useState<Task | null>(null)
  const [form, setForm] = useState(blank())

  const total = data.tasks.length
  const done = data.tasks.filter((t) => t.status === 'done').length

  const byStatus = (status: TaskStatus) => data.tasks.filter((t) => t.status === status)

  const openAdd = () => { setForm(blank()); setEditing(null); setModal(true) }
  const openEdit = (t: Task) => {
    setForm({ title: t.title, description: t.description, status: t.status, priority: t.priority, dueDate: t.dueDate })
    setEditing(t)
    setModal(true)
  }

  const save = () => {
    if (!form.title.trim()) return
    if (editing) {
      setTasks(data.tasks.map((t) => t.id === editing.id ? { ...t, ...form } : t))
    } else {
      setTasks([...data.tasks, { ...form, id: crypto.randomUUID(), createdAt: new Date().toISOString() }])
    }
    setModal(false)
  }

  const remove = (id: string) => setTasks(data.tasks.filter((t) => t.id !== id))

  const cycleStatus = (task: Task) => {
    const order: TaskStatus[] = ['todo', 'in_progress', 'done']
    const next = order[(order.indexOf(task.status) + 1) % order.length]
    setTasks(data.tasks.map((t) => t.id === task.id ? { ...t, status: next } : t))
  }

  return (
    <Layout
      title="Tasks"
      subtitle={`${done}/${total} completed`}
      action={<Button onClick={openAdd} size="sm">+ Add Task</Button>}
    >
      <div className="space-y-4">
        {(['todo', 'in_progress', 'done'] as TaskStatus[]).map((status) => {
          const cfg = STATUS_CONFIG[status]
          const tasks = byStatus(status)
          return (
            <div key={status}>
              <div className={`flex items-center gap-2 mb-2 font-medium ${cfg.color}`}>
                <span>{cfg.icon}</span>
                <span>{cfg.label} ({tasks.length})</span>
              </div>
              <div className="space-y-2">
                {tasks.map((t) => (
                  <Card key={t.id} onClick={() => openEdit(t)}>
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-start gap-2 flex-1 min-w-0">
                        <button
                          onClick={(e) => { e.stopPropagation(); cycleStatus(t) }}
                          className={`mt-0.5 text-base leading-none shrink-0 ${cfg.color}`}
                        >{cfg.icon}</button>
                        <div className="min-w-0">
                          <div className={`font-medium truncate ${t.status === 'done' ? 'line-through text-muted' : 'text-white'}`}>{t.title}</div>
                          {t.description && <div className="text-xs text-muted mt-0.5 truncate">{t.description}</div>}
                          <div className="flex gap-2 mt-1">
                            <span className={`text-xs capitalize ${PRIORITY_COLOR[t.priority]}`}>{t.priority}</span>
                            {t.dueDate && <span className="text-xs text-muted">Due {t.dueDate}</span>}
                          </div>
                        </div>
                      </div>
                      <button onClick={(e) => { e.stopPropagation(); remove(t.id) }} className="text-muted hover:text-accent-red text-sm shrink-0">✕</button>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )
        })}
      </div>

      {modal && (
        <Modal
          title={editing ? 'Edit Task' : 'Add Task'}
          onClose={() => setModal(false)}
          footer={
            <>
              <Button variant="ghost" onClick={() => setModal(false)}>Cancel</Button>
              <Button onClick={save}>Save</Button>
            </>
          }
        >
          <div className="space-y-3">
            <Input label="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Task title" />
            <Input label="Description (optional)" value={form.description ?? ''} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            <Select label="Status" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as TaskStatus })} options={[
              { value: 'todo', label: 'To Do' },
              { value: 'in_progress', label: 'In Progress' },
              { value: 'done', label: 'Done' },
            ]} />
            <Select label="Priority" value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value as TaskPriority })} options={[
              { value: 'low', label: 'Low' },
              { value: 'medium', label: 'Medium' },
              { value: 'high', label: 'High' },
            ]} />
            <Input label="Due Date (optional)" type="date" value={form.dueDate ?? ''} onChange={(e) => setForm({ ...form, dueDate: e.target.value })} />
          </div>
        </Modal>
      )}
    </Layout>
  )
}
