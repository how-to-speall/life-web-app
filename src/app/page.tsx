'use client'

import { useState } from 'react'
import { Plus, CheckCircle2, Circle, Trash2 } from 'lucide-react'
import { supabase, Task, Person } from '../../lib/supabase'
import { useEffect } from 'react'

export default function Home() {
  const [activeTab, setActiveTab] = useState('tasks')
  const [tasks, setTasks] = useState<Task[]>([])
  const [people, setPeople] = useState<Person[]>([])
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [showCreatePersonForm, setShowCreatePersonForm] = useState(false)
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    deadline: ''
  })
  const [newPerson, setNewPerson] = useState({
    name: '',
    howIKnowThem: '',
    tags: [] as string[],
    tagInput: '',
    description: '',
    birthday: '',
    giftIdeas: '',
    lastHangoutDate: ''
  })
  const [allTags, setAllTags] = useState<string[]>([])
  const [sortBy, setSortBy] = useState<'name' | 'lastHangout' | 'birthday'>('name')
  const [filterTag, setFilterTag] = useState<string>('')
  const [editingPerson, setEditingPerson] = useState<Person | null>(null)

  useEffect(() => {
    fetchTasks()
    fetchPeople()
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

  const fetchPeople = async () => {
    try {
      const { data, error } = await supabase
        .from('people')
        .select('*')
        .order('name', { ascending: true })
      
      if (error) throw error
      setPeople(data || [])
      
      // Extract all unique tags
      const tags = new Set<string>()
      data?.forEach(person => {
        person.tags?.forEach((tag: string) => tags.add(tag))
      })
      setAllTags(Array.from(tags))
    } catch (error) {
      console.error('Error fetching people:', error)
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

  const createPerson = async () => {
    if (!newPerson.name.trim()) return

    try {
      const { error } = await supabase
        .from('people')
        .insert([{
          name: newPerson.name,
          howIKnowThem: newPerson.howIKnowThem,
          tags: newPerson.tags,
          description: newPerson.description || null,
          birthday: newPerson.birthday || null,
          "giftIdeas": newPerson.giftIdeas || null,
          "lastHangoutDate": newPerson.lastHangoutDate || null
        }])
      
      if (error) throw error
      
      setNewPerson({ 
        name: '', 
        howIKnowThem: '', 
        tags: [], 
        tagInput: '',
        description: '', 
        birthday: '', 
        giftIdeas: '', 
        lastHangoutDate: '' 
      })
      setShowCreatePersonForm(false)
      fetchPeople()
    } catch (error) {
      console.error('Error creating person:', error)
    }
  }

  const updatePerson = async () => {
    if (!editingPerson || !editingPerson.name.trim()) return

    try {
      const { error } = await supabase
        .from('people')
        .update({
          name: editingPerson.name,
          howIKnowThem: editingPerson.howIKnowThem,
          tags: editingPerson.tags,
          description: editingPerson.description || null,
          birthday: editingPerson.birthday || null,
          "giftIdeas": editingPerson.giftIdeas || null,
          "lastHangoutDate": editingPerson.lastHangoutDate || null
        })
        .eq('id', editingPerson.id)
      
      if (error) throw error
      
      setEditingPerson(null)
      fetchPeople()
    } catch (error) {
      console.error('Error updating person:', error)
    }
  }

  const startEditPerson = (person: Person) => {
    setEditingPerson({ ...person, tagInput: '' })
    // Scroll to top of the page when edit form opens
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const deletePerson = async (personId: string) => {
    if (!confirm('Are you sure you want to delete this person?')) return

    try {
      const { error } = await supabase
        .from('people')
        .delete()
        .eq('id', personId)
      
      if (error) throw error
      
      fetchPeople()
    } catch (error) {
      console.error('Error deleting person:', error)
    }
  }

  const getSortedAndFilteredPeople = () => {
    let filtered = people
    if (filterTag) {
      filtered = people.filter(person => person.tags.includes(filterTag))
    }
    
    return filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name)
        case 'lastHangout':
          if (!a.lastHangoutDate && !b.lastHangoutDate) return 0
          if (!a.lastHangoutDate) return 1
          if (!b.lastHangoutDate) return -1
          // Sort by longest time since hangout (most overdue first)
          return new Date(b.lastHangoutDate).getTime() - new Date(a.lastHangoutDate).getTime()
        case 'birthday':
          if (!a.birthday && !b.birthday) return 0
          if (!a.birthday) return 1
          if (!b.birthday) return -1
          return getDaysUntilBirthday(a.birthday) - getDaysUntilBirthday(b.birthday)
        default:
          return 0
      }
    })
  }

  const getUpcomingBirthdaysCount = () => {
    const threeMonthsFromNow = new Date()
    threeMonthsFromNow.setMonth(threeMonthsFromNow.getMonth() + 3)
    
    return people.filter(person => {
      if (!person.birthday) return false
      const daysUntil = getDaysUntilBirthday(person.birthday)
      return daysUntil >= 0 && daysUntil <= 90
    }).length
  }

  const getDaysUntilBirthday = (birthday: string) => {
    const now = new Date()
    const birthDate = new Date(birthday)
    const nextBirthday = new Date(now.getFullYear(), birthDate.getMonth(), birthDate.getDate())
    
    if (nextBirthday < now) {
      nextBirthday.setFullYear(now.getFullYear() + 1)
    }
    
    return Math.ceil((nextBirthday.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
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
    { id: 'people', label: 'People' },
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

        {activeTab === 'people' && (
          <div className="space-y-4">
            {/* Create Button */}
            <button
              onClick={() => setShowCreatePersonForm(true)}
              className="w-full bg-green-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
            >
              <Plus size={20} />
              Add Person
            </button>

            {/* Create Person Form */}
            {showCreatePersonForm && (
              <div className="bg-white p-4 rounded-lg shadow-sm border space-y-4">
                <h3 className="text-lg font-medium text-gray-900 mb-2">Add New Person</h3>
                <input
                  type="text"
                  placeholder="Name *"
                  value={newPerson.name}
                  onChange={(e) => setNewPerson({ ...newPerson, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900 placeholder-gray-500 bg-white"
                />
                <input
                  type="text"
                  placeholder="How I know them *"
                  value={newPerson.howIKnowThem}
                  onChange={(e) => setNewPerson({ ...newPerson, howIKnowThem: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900 placeholder-gray-500 bg-white"
                />
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Tags</label>
                  <div className="space-y-2">
                    {/* Tag Input */}
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Type a tag and press Enter"
                        value={newPerson.tagInput || ''}
                        onChange={(e) => setNewPerson({ ...newPerson, tagInput: e.target.value })}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault()
                            const newTag = newPerson.tagInput?.trim()
                            if (newTag && !newPerson.tags.includes(newTag)) {
                              setNewPerson({ 
                                ...newPerson, 
                                tags: [...newPerson.tags, newTag],
                                tagInput: ''
                              })
                            }
                          }
                        }}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900 placeholder-gray-500 bg-white"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const newTag = newPerson.tagInput?.trim()
                          if (newTag && !newPerson.tags.includes(newTag)) {
                            setNewPerson({ 
                              ...newPerson, 
                              tags: [...newPerson.tags, newTag],
                              tagInput: ''
                            })
                          }
                        }}
                        className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                      >
                        Add
                      </button>
                    </div>
                    
                    {/* Display Tags */}
                    {newPerson.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {newPerson.tags.map((tag, index) => (
                          <span 
                            key={index}
                            className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-800 text-sm rounded-full"
                          >
                            {tag}
                            <button
                              type="button"
                              onClick={() => setNewPerson({ 
                                ...newPerson, 
                                tags: newPerson.tags.filter((_, i) => i !== index)
                              })}
                              className="ml-1 text-green-600 hover:text-green-800"
                            >
                              ×
                            </button>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                <textarea
                  placeholder="Description (optional)"
                  value={newPerson.description}
                  onChange={(e) => setNewPerson({ ...newPerson, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900 placeholder-gray-500 bg-white resize-none"
                  rows={2}
                />
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Birthday (optional)</label>
                  <input
                    type="date"
                    value={newPerson.birthday}
                    onChange={(e) => setNewPerson({ ...newPerson, birthday: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900 placeholder-gray-500 bg-white"
                  />
                </div>
                <textarea
                  placeholder="Gift ideas / things they like (optional)"
                  value={newPerson.giftIdeas}
                  onChange={(e) => setNewPerson({ ...newPerson, giftIdeas: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900 placeholder-gray-500 bg-white resize-none"
                  rows={2}
                />
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Last hangout date (optional)</label>
                  <input
                    type="date"
                    value={newPerson.lastHangoutDate}
                    onChange={(e) => setNewPerson({ ...newPerson, lastHangoutDate: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900 placeholder-gray-500 bg-white"
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={createPerson}
                    className="flex-1 bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition-colors"
                  >
                    Add Person
                  </button>
                  <button
                    onClick={() => setShowCreatePersonForm(false)}
                    className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {/* Edit Person Form */}
            {editingPerson && (
              <div className="bg-white p-4 rounded-lg shadow-sm border space-y-4">
                <h3 className="text-lg font-medium text-gray-900 mb-2">Edit Person</h3>
                <input
                  type="text"
                  placeholder="Name *"
                  value={editingPerson.name}
                  onChange={(e) => setEditingPerson({ ...editingPerson, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900 placeholder-gray-500 bg-white"
                />
                <input
                  type="text"
                  placeholder="How I know them *"
                  value={editingPerson.howIKnowThem}
                  onChange={(e) => setEditingPerson({ ...editingPerson, howIKnowThem: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900 placeholder-gray-500 bg-white"
                />
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Tags</label>
                  <div className="space-y-2">
                    {/* Tag Input */}
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Type a tag and press Enter"
                        value={editingPerson.tagInput || ''}
                        onChange={(e) => setEditingPerson({ ...editingPerson, tagInput: e.target.value })}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault()
                            const newTag = editingPerson.tagInput?.trim()
                            if (newTag && !editingPerson.tags.includes(newTag)) {
                              setEditingPerson({ 
                                ...editingPerson, 
                                tags: [...editingPerson.tags, newTag],
                                tagInput: ''
                              })
                            }
                          }
                        }}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900 placeholder-gray-500 bg-white"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const newTag = editingPerson.tagInput?.trim()
                          if (newTag && !editingPerson.tags.includes(newTag)) {
                            setEditingPerson({ 
                              ...editingPerson, 
                              tags: [...editingPerson.tags, newTag],
                              tagInput: ''
                            })
                          }
                        }}
                        className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                      >
                        Add
                      </button>
                    </div>
                    
                    {/* Display Tags */}
                    {editingPerson.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {editingPerson.tags.map((tag, index) => (
                          <span 
                            key={index}
                            className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-800 text-sm rounded-full"
                          >
                            {tag}
                            <button
                              type="button"
                              onClick={() => setEditingPerson({ 
                                ...editingPerson, 
                                tags: editingPerson.tags.filter((_, i) => i !== index)
                              })}
                              className="ml-1 text-green-600 hover:text-green-800"
                            >
                              ×
                            </button>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                <textarea
                  placeholder="Description (optional)"
                  value={editingPerson.description}
                  onChange={(e) => setEditingPerson({ ...editingPerson, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900 placeholder-gray-500 bg-white resize-none"
                  rows={2}
                />
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Birthday (optional)</label>
                  <input
                    type="date"
                    value={editingPerson.birthday}
                    onChange={(e) => setEditingPerson({ ...editingPerson, birthday: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900 placeholder-gray-500 bg-white"
                  />
                </div>
                <textarea
                  placeholder="Gift ideas / things they like (optional)"
                  value={editingPerson.giftIdeas}
                  onChange={(e) => setEditingPerson({ ...editingPerson, giftIdeas: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900 placeholder-gray-500 bg-white resize-none"
                  rows={2}
                />
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Last hangout date (optional)</label>
                  <input
                    type="date"
                    value={editingPerson.lastHangoutDate}
                    onChange={(e) => setEditingPerson({ ...editingPerson, lastHangoutDate: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900 placeholder-gray-500 bg-white"
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={updatePerson}
                    className="flex-1 bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition-colors"
                  >
                    Update Person
                  </button>
                  <button
                    onClick={() => setEditingPerson(null)}
                    className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {/* Sorting and Filtering */}
            <div className="bg-white p-3 rounded-lg shadow-sm border space-y-3">
              <div className="flex gap-2">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900 bg-white"
                >
                  <option value="name">Sort by Name</option>
                  <option value="lastHangout">Sort by Last Hangout</option>
                  <option value="birthday">Sort by Upcoming Birthday</option>
                </select>
                <select
                  value={filterTag}
                  onChange={(e) => setFilterTag(e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900 bg-white"
                >
                  <option value="">All Tags</option>
                  {allTags.map(tag => (
                    <option key={tag} value={tag}>{tag}</option>
                  ))}
                </select>
              </div>
              
              {/* Birthday Counter */}
              <div className="text-sm text-gray-600 text-center">
                {getUpcomingBirthdaysCount()} people have birthdays within 3 months
              </div>
            </div>

            {/* People List */}
            <div className="space-y-3">
              {getSortedAndFilteredPeople().map((person) => (
                <PersonItem
                  key={person.id}
                  person={person}
                  onEdit={() => startEditPerson(person)}
                  onDelete={deletePerson}
                />
              ))}
              {getSortedAndFilteredPeople().length === 0 && (
                <div className="text-center text-gray-500 py-8">
                  No people yet. Add your first person!
                </div>
              )}
            </div>
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

// Person Item Component
function PersonItem({ 
  person, 
  onEdit,
  onDelete
}: { 
  person: Person
  onEdit: () => void
  onDelete: (id: string) => void
}) {
  const getTimeSinceLastHangout = (lastHangoutDate: string) => {
    const now = new Date()
    const lastHangout = new Date(lastHangoutDate)
    const diffMs = now.getTime() - lastHangout.getTime()
    
    const diffMonths = Math.floor(diffMs / (1000 * 60 * 60 * 24 * 30.44))
    const diffWeeks = Math.floor(diffMs / (1000 * 60 * 60 * 24 * 7))
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
    
    if (diffMonths > 0) {
      return `${diffMonths} month${diffMonths > 1 ? 's' : ''} ago`
    } else if (diffWeeks > 0) {
      return `${diffWeeks} week${diffWeeks > 1 ? 's' : ''} ago`
    } else if (diffDays > 0) {
      return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`
    } else {
      return 'Today'
    }
  }

  const getBirthdayCountdown = (birthday: string) => {
    const daysUntil = getDaysUntilBirthday(birthday)
    if (daysUntil < 0) return null
    
    if (daysUntil > 30) {
      const months = Math.floor(daysUntil / 30.44)
      return `${months} month${months > 1 ? 's' : ''} away`
    } else {
      return `${daysUntil} day${daysUntil > 1 ? 's' : ''} away`
    }
  }

  const getDaysUntilBirthday = (birthday: string) => {
    const now = new Date()
    const birthDate = new Date(birthday)
    const nextBirthday = new Date(now.getFullYear(), birthDate.getMonth(), birthDate.getDate())
    
    if (nextBirthday < now) {
      nextBirthday.setFullYear(now.getFullYear() + 1)
    }
    
    return Math.ceil((nextBirthday.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
  }

  const isOverdueForHangout = person.lastHangoutDate ? 
    (new Date().getTime() - new Date(person.lastHangoutDate).getTime()) > (30 * 24 * 60 * 60 * 1000) : false
  
  const isBirthdaySoon = person.birthday ? getDaysUntilBirthday(person.birthday) <= 120 : false

  return (
    <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
      <div className="p-4">
        {/* Header with warnings */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <h3 className="font-medium text-gray-900 text-lg">{person.name}</h3>
            <p className="text-sm text-gray-600">{person.howIKnowThem}</p>
          </div>
          
          {/* Warning indicators */}
          <div className="flex gap-2 ml-3">
            {isOverdueForHangout && (
              <div className="px-2 py-1 bg-orange-100 text-orange-800 text-xs rounded-full">
                Overdue hangout
              </div>
            )}
            {isBirthdaySoon && (
              <div className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                Birthday soon
              </div>
            )}
          </div>
        </div>

        {/* Tags */}
        {person.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-3">
            {person.tags.map((tag, index) => (
              <span 
                key={index}
                className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Description */}
        {person.description && (
          <p className="text-sm text-gray-600 mb-3">{person.description}</p>
        )}

        {/* Birthday and Hangout Info */}
        <div className="space-y-2 text-sm">
          {person.birthday && (
            <div className="flex items-center gap-2">
              <span className="text-gray-500">🎂</span>
              <span className="text-gray-600">
                {getBirthdayCountdown(person.birthday)}
              </span>
            </div>
          )}
          
          {person.lastHangoutDate && (
            <div className="flex items-center gap-2">
              <span className="text-gray-500">☕</span>
              <span className="text-gray-600">
                Last hangout: {getTimeSinceLastHangout(person.lastHangoutDate)}
              </span>
            </div>
          )}
        </div>

        {/* Gift Ideas */}
        {person.giftIdeas && (
          <div className="mt-3 pt-3 border-t border-gray-100">
            <p className="text-xs text-gray-500 mb-1">Gift ideas:</p>
            <p className="text-sm text-gray-700">{person.giftIdeas}</p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2 mt-3">
          <button
            onClick={onEdit}
            className="flex-1 bg-gray-100 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-200 transition-colors text-sm"
          >
            Edit Person
          </button>
          <button
            onClick={() => onDelete(person.id)}
            className="flex-1 bg-red-100 text-red-700 py-2 px-4 rounded-md hover:bg-red-200 transition-colors text-sm"
          >
            Delete Person
          </button>
        </div>
      </div>
    </div>
  )
}
