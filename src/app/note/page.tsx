'use client'
import React, { useState, useCallback, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { debounce } from 'lodash'
import callApi from '../services/api'
import { toast, ToastContainer } from 'react-toastify'
import { INote, INoteForm } from '../interfaces/types'
import { STORAGE_KEY } from '../ui/constants/localStorage'
import { saveToLocalStorage } from '../helpers/utils'
import SearchComponent from '../ui/components/search/Search'
import { FiEdit } from 'react-icons/fi'
import CustomRichTextEditor from '../ui/components/forms/rich-text-editor/CustomRichTextEditor'

export default function NotePage() {
  const [content, setContent] = useState<string>('')
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'error'>('saved')
  const [isOnline, setIsOnline] = useState(true)
  const [notes, setNotes] = useState<INote[]>([])
  const [selectedNote, setSelectedNote] = useState<INote | null>(null)
  const [isModified, setIsModified] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false)

  const { register, handleSubmit, setValue, getValues, reset, formState: { errors } } = useForm<INoteForm>({
    defaultValues: {
      title: '',
      content: ''
    }
  })

  // Fetch all notes
  const fetchNotes = async () => {
    try {
      const response = await callApi('/notes', 'GET')
      setNotes(response.data)
    } catch (error) {
      toast.error('Failed to fetch notes')
    }
  }

  useEffect(() => {
    fetchNotes()
  }, [])

  // Handle note selection
  const handleNoteSelect = (note: INote) => {
    setSelectedNote(note)
    setValue('title', note.title)
    setValue('content', note.content)
    setContent(note.content)
    setIsModified(false) // Reset modification flag
  }

  const handleSearch = async (query: string) => {
    if (!query.trim()) {
      // If search is empty, fetch all notes
      fetchNotes()
      return
    }

    try {
      setSearchLoading(true)
      const response = await callApi(`/notes/search?query=${encodeURIComponent(query)}`, 'GET')
      setNotes(response.data)
    } catch (error) {
      toast.error('Search failed')
    } finally {
      setSearchLoading(false)
    }
  }

  // Add reset handler
  const handleNewNote = () => {
    setSelectedNote(null)
    setContent('')
    setSaveStatus('saved')
    reset({
      title: '',
      content: ''
    })

    // Clear localStorage
    localStorage.removeItem(STORAGE_KEY.TITLE)
    localStorage.removeItem(STORAGE_KEY.CONTENT)
    localStorage.removeItem(STORAGE_KEY.LAST_SAVED)
  }

  // Load from localStorage on mount
  useEffect(() => {
    const storedTitle = localStorage.getItem(STORAGE_KEY.TITLE)
    const storedContent = localStorage.getItem(STORAGE_KEY.CONTENT)

    if (storedTitle) setValue('title', storedTitle)
    if (storedContent) {
      setValue('content', storedContent)
      setContent(storedContent)
    }
  }, [])

  // Monitor online status
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true)
      syncWithServer()
    }
    const handleOffline = () => setIsOnline(false)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  // Sync with server
  const syncWithServer = async () => {
    const data = {
      title: getValues('title'),
      content: getValues('content')
    }

    if (!data.title) return

    try {
      setSaveStatus('saving')
      await callApi('/notes', 'POST', data)
      setSaveStatus('saved')
      toast.success('Note synced with server')
    } catch (error) {
      setSaveStatus('error')
      toast.error('Failed to sync with server')
    }
  }

  // Debounced save function
  const debouncedSave = useCallback(
    debounce(async (data: INoteForm) => {
      if (!data.title) return

      // Save to localStorage regardless of modification state
      saveToLocalStorage(data)

      // Only call API if note is modified and we're online
      if (isOnline && isModified) {
        try {
          setSaveStatus('saving')
          const endpoint = selectedNote
            ? `/notes/${selectedNote._id}`
            : '/notes'
          const method = selectedNote ? 'PATCH' : 'POST'

          const response = await callApi(endpoint, method, data)
          if (!selectedNote && response.data) {
            setSelectedNote(response.data)
          }

          setSaveStatus('saved')
          toast.success(`Note ${selectedNote ? 'updated' : 'created'} successfully`)
          fetchNotes()
          setIsModified(false) // Reset modification flag after successful save
        } catch (error) {
          setSaveStatus('error')
          toast.error('Failed to save note')
        }
      }
    }, 1000),
    [isOnline, selectedNote, isModified] // Add isModified to dependencies
  )

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setValue('title', value)
    setIsModified(true) // Mark as modified
    if (value) {
      debouncedSave({
        title: value,
        content: getValues('content'),
        ...(selectedNote && { id: selectedNote._id })
      })
    }
  }

  const handleContentChange = (value: string) => {
    setContent(value)
    setValue('content', value)
    setIsModified(true) // Mark as modified
    if (getValues('title')) {
      debouncedSave({
        title: getValues('title'),
        content: value,
        ...(selectedNote && { id: selectedNote._id })
      })
    }
  }

  return (
    <div className="flex h-screen bg-gray-100">
      <div className="w-72 bg-white flex flex-col">
        <div className="p-4 flex flex-col h-full">
          <div className="space-y-2 items-center justify-between gap-2 mb-4">
            <SearchComponent
              onSearch={handleSearch}
              loading={searchLoading}
            />
          </div>
          <div className="flex items-center justify-between mb-4">
            <button
              className="p-2 hover:bg-gray-200 rounded ml-auto"
              onClick={handleNewNote}
            >
              <FiEdit className='text-black' />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto">
            <ul className="list-disc pl-4 space-y-2">
              {(notes || []).length === 0 ? (
                <li className="text-gray-500 p-3">No notes found</li>
              ) : (
                notes.map((note) => (
                  <li
                    key={note._id}
                    className={`p-3 bg-white cursor-pointer hover:bg-gray-50 ${
                      selectedNote?._id === note._id ? 'bg-gray-100' : ''
                    }`}
                    onClick={() => handleNoteSelect(note)}
                  >
                    <h3 className="font-medium text-black">{note.title}</h3>
                    <p className="text-sm text-gray-500 truncate">
                      {note.content.replace(/<[^>]*>/g, '').slice(0, 100)}
                    </p>
                  </li>
                ))
              )}
            </ul>
          </div>
        </div>
      </div>

      <div className="flex-1 bg-white flex flex-col h-screen">
        <div className="p-4 flex flex-col h-full">
          <div className="flex items-center gap-2 mb-4">
            <input
              type="text"
              placeholder="Note Title *"
              {...register('title', { required: 'Title is required' })}
              onChange={handleTitleChange}
              className="border p-1 text-2xl font-bold w-full focus:outline-none"
            />
          </div>
          {errors.title && (
            <p className="text-red-500 text-sm mb-2">{errors.title.message}</p>
          )}

          <div className="flex-grow overflow-auto">
            <CustomRichTextEditor
              value={content}
              setValue={handleContentChange}
              placeholder="Write your note here..."
              className="h-[calc(100vh-160px)]"
            />
          </div>
        </div>
      </div>

    <ToastContainer />
    </div>
  )
}
