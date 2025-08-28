'use client'

import { useState } from 'react'
import { Plus, CheckCircle2, Circle, Trash2 } from 'lucide-react'
import { supabase, Task } from '../../lib/supabase'
import { useEffect } from 'react'

export default function Home() {
  const [activeTab, setActiveTab] = useState('tasks')
  const [tasks, setTasks] = useState<Task[]>([])
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    deadline: ''
  })

  useEffect(() => {
    fetchTasks()
  }, [])

  const fetchTasks = async () => {
    try {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .order('created_at', { ascending: false })
      
      if (error) throw error
      setTasks(data || [])
    } catch (error) {
      console.error('Error fetching tasks:', error)
    }
  }

  const createTask = async () => {
    if (!newTask.title.trim()) return

    try {
      const { error } = await supabase
        .from('tasks')
        .insert([{
          title: newTask.title,
          description: newTask.description || null,
          deadline: newTask.deadline || null,
          completed: false
        }])
      
      if (error) throw error
      
      setNewTask({ title: '', description: '', deadline: '' })
      setShowCreateForm(false)
      fetchTasks()
    } catch (error) {
      console.error('Error creating task:', error)
    }
  }

  const toggleTask = async (taskId: string, completed: boolean) => {
    try {
      const { error } = await supabase
        .from('tasks')
        .update({ completed: !completed })
        .eq('id', taskId)
      
      if (error) throw error
      fetchTasks()
    } catch (error) {
      console.error('Error updating task:', error)
    }
  }

  const deleteTask = async (taskId: string) => {
    try {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', taskId)
      
      if (error) throw error
      fetchTasks()
    } catch (error) {
      console.error('Error deleting task:', error)
    }
  }

  const tabs = [
    { id: 'tasks', label: 'Tasks' },
    { id: 'notes', label: 'Notes' },
    { id: 'goals', label: 'Goals' },
    { id: 'habits', label: 'Habits' }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-md mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold text-gray-900 text-center">Life App</h1>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white shadow-sm">
        <div className="max-w-md mx-auto">
          <div className="flex">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 py-3 px-4 text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-md mx-auto px-4 py-6">
        {activeTab === 'tasks' && (
          <div className="space-y-4">
            {/* Create Button */}
            <button
              onClick={() => setShowCreateForm(true)}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
            >
              <Plus size={20} />
              Create Task
            </button>

            {/* Create Form */}
            {showCreateForm && (
              <div className="bg-white p-4 rounded-lg shadow-sm border space-y-4">
                <input
                  type="text"
                  placeholder="Task title *"
                  value={newTask.title}
                  onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder-gray-500 bg-white"
                />
                <textarea
                  placeholder="Description (optional)"
                  value={newTask.description}
                  onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none text-gray-900 placeholder-gray-500 bg-white"
                  rows={3}
                />
                <input
                  type="datetime-local"
                  value={newTask.deadline}
                  onChange={(e) => setNewTask({ ...newTask, deadline: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder-gray-500 bg-white"
                />
                <div className="flex gap-2">
                  <button
                    onClick={createTask}
                    className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
                  >
                    Create
                  </button>
                  <button
                    onClick={() => setShowCreateForm(false)}
                    className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {/* Tasks List */}
            <div className="space-y-3">
              {tasks.map((task) => (
                <TaskItem
                  key={task.id}
                  task={task}
                  onToggle={toggleTask}
                  onDelete={deleteTask}
                />
              ))}
              {tasks.length === 0 && (
                <div className="text-center text-gray-500 py-8">
                  No tasks yet. Create your first task!
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'notes' && (
          <div className="text-center text-gray-500 py-8">
            Notes feature coming soon...
          </div>
        )}

        {activeTab === 'goals' && (
          <div className="text-center text-gray-500 py-8">
            Goals feature coming soon...
          </div>
        )}

        {activeTab === 'habits' && (
          <div className="text-center text-gray-500 py-8">
            Habits feature coming soon...
          </div>
        )}
      </div>
    </div>
  )
}

// Task Item Component with swipe-to-delete functionality
function TaskItem({ 
  task, 
  onToggle, 
  onDelete 
}: { 
  task: Task
  onToggle: (id: string, completed: boolean) => void
  onDelete: (id: string) => void
}) {
  const [isDeleting, setIsDeleting] = useState(false)

  const getTimeRemaining = (deadline: string) => {
    const now = new Date()
    const dueDate = new Date(deadline)
    const diffMs = dueDate.getTime() - now.getTime()
    
    if (diffMs < 0) {
      return 'Overdue'
    }
    
    const diffMonths = Math.floor(diffMs / (1000 * 60 * 60 * 24 * 30.44))
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    
    if (diffMonths > 0) {
      return `${diffMonths} month${diffMonths > 1 ? 's' : ''}`
    } else if (diffDays > 0) {
      return `${diffDays} day${diffDays > 1 ? 's' : ''}`
    } else if (diffHours > 0) {
      return `${diffHours} hour${diffHours > 1 ? 's' : ''}`
    } else {
      return 'Due soon'
    }
  }

  const handleDelete = () => {
    setIsDeleting(true)
    setTimeout(() => {
      onDelete(task.id)
      setIsDeleting(false)
    }, 200)
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
      <div className="flex items-center p-4">
        {/* Radio Button */}
        <button
          onClick={() => onToggle(task.id, task.completed)}
          className="mr-3 text-blue-600 hover:text-blue-700 transition-colors"
        >
          {task.completed ? (
            <CheckCircle2 size={24} className="fill-current" />
          ) : (
            <Circle size={24} />
          )}
        </button>

        {/* Task Content */}
        <div className="flex-1 min-w-0">
          <h3 
            className={`font-medium text-gray-900 ${
              task.completed ? 'line-through text-gray-500' : ''
            }`}
          >
            {task.title}
          </h3>
          {task.description && (
            <p 
              className={`text-sm text-gray-600 mt-1 ${
                task.completed ? 'line-through text-gray-400' : ''
              }`}
            >
              {task.description}
            </p>
          )}
          {task.deadline && (
            <p 
              className={`text-xs text-gray-500 mt-1 ${
                task.completed ? 'line-through text-gray-400' : ''
              }`}
            >
              Due: {new Date(task.deadline).toLocaleDateString()} 
              <span className="ml-2 text-blue-600">
                ({getTimeRemaining(task.deadline)})
              </span>
            </p>
          )}
        </div>

        {/* Delete Button */}
        <button
          onClick={handleDelete}
          className="ml-3 p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-full transition-colors"
          disabled={isDeleting}
        >
          <Trash2 size={20} />
        </button>
      </div>
    </div>
  )
}
