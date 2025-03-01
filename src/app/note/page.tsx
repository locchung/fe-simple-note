'use client'
import React, { useState, useCallback, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { debounce, get } from 'lodash'
import { callApi } from '../services/api'
import { toast, ToastContainer } from 'react-toastify'
import { INote, INoteForm } from '../interfaces/types'
import { saveToLocalStorage } from '../helpers/utils'
import SearchComponent from '../ui/components/search/Search'
import { FiEdit, FiLogOut, FiMoon, FiSun, FiTrash2 } from 'react-icons/fi'
import CustomRichTextEditor from '../ui/components/forms/rich-text-editor/CustomRichTextEditor'
import { useTheme } from '../context/ThemeContext'
import { useAuth } from '../context/AuthContext'
import { Button } from '@mui/material'
import { LOCAL_STORAGE_KEY } from '../constants/localStorage'
import ReactMde from 'react-mde'
import Showdown from "showdown";
import MdeEditor from '../ui/components/forms/mde-editor/MdeEditor'

export default function NotePage() {
  const { theme, toggleTheme } = useTheme()
  const [content, setContent] = useState<string>('')
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'error'>('saved')
  const [isOnline, setIsOnline] = useState(true)
  const [notes, setNotes] = useState<INote[]>([])
  const [selectedNote, setSelectedNote] = useState<INote | null>(null)
  const [isModified, setIsModified] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false)
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null)
  const [selectedTab, setSelectedTab] = useState<any>("write");
  const { logout } = useAuth()

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

      // Auto-select first note if no note is selected
      if (response.data?.length > 0 && !selectedNote) {
        const firstNote = response.data[0]
        handleNoteSelect(firstNote)
      }
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
      const response = await callApi(`/notes/search?querySearch=${encodeURIComponent(query)}`, 'GET')
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
    localStorage.removeItem(LOCAL_STORAGE_KEY.TITLE)
    localStorage.removeItem(LOCAL_STORAGE_KEY.CONTENT)
    localStorage.removeItem(LOCAL_STORAGE_KEY.LAST_SAVED)
  }

  const handleDeleteNote = async (noteId: string, e: React.MouseEvent) => {
    e.stopPropagation() // Prevent note selection when clicking delete

    if (deleteLoading) return // Prevent multiple deletes
    if (!confirm('Are you sure you want to delete this note?')) return

    try {
      setDeleteLoading(noteId)
      const resp = await callApi(`/notes/${noteId}`, 'DELETE')

      // If deleted note was selected, reset form
      if (selectedNote?._id === noteId) {
        handleNewNote()
      }
      if (resp.statusCode === 200)
        toast.success('Note deleted successfully')
      else {
        toast.error('Failed to delete note')
      }
      fetchNotes() // Refresh notes list
    } catch (error) {
      toast.error('Failed to delete note')
    } finally {
      setDeleteLoading(null)
    }
  }

  // Load from localStorage on mount
  useEffect(() => {
    const storedTitle = localStorage.getItem(LOCAL_STORAGE_KEY.TITLE)
    const storedContent = localStorage.getItem(LOCAL_STORAGE_KEY.CONTENT)

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

          if (response.error) {
            toast.error(response.message)
            return
          }

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

  const handleLogout = () => {
    logout()
  }

  const converter = new Showdown.Converter({
    tables: true,
    simplifiedAutoLink: true,
    strikethrough: true,
    tasklists: true
  });

  return (
    <div className={`flex h-screen ${theme === 'dark' ? 'dark' : ''}`}>
      <div className="w-72 bg-white dark:bg-gray-800 flex flex-col">
        <div className="p-4 flex flex-col h-full">
          <div className="space-y-2 items-center justify-between gap-2">
            <SearchComponent
              onSearch={handleSearch}
              loading={searchLoading}
            />
            <button
              onClick={toggleTheme}
              className="fixed bottom-4 left-4 z-50 p-3 rounded-full shadow-lg
                bg-white dark:bg-gray-800 hover:scale-110 transform transition-all duration-200
                border border-gray-200 dark:border-gray-700"
              aria-label="Toggle theme"
            >
              {theme === 'light' ? (
                <FiMoon className="w-5 h-5 text-gray-600 dark:text-gray-300" />
              ) : (
                <FiSun className="w-5 h-5 text-gray-300 dark:text-gray-400" />
              )}
            </button>
          </div>
          <div className="flex items-center justify-between">
            <button
              className="p-2 hover:bg-gray-200 rounded ml-auto"
              onClick={handleNewNote}
            >
              <FiEdit />
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
                    className={`p-3 bg-white dark:bg-gray-700 cursor-pointer
                      hover:bg-gray-50 dark:hover:bg-gray-600
                      ${selectedNote?._id === note._id ? 'bg-gray-100 dark:bg-gray-600' : ''}
                      transition-colors`}
                    onClick={() => handleNoteSelect(note)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h3 className="font-medium">{note.title}</h3>
                        <p className="text-sm text-gray-500 truncate">
                          {note.content.replace(/<[^>]*>/g, '').slice(0, 100)}
                        </p>
                      </div>
                      <button
                        onClick={(e) => handleDeleteNote(note._id, e)}
                        className={`p-2 hover:bg-red-50 rounded text-gray-500 hover:text-red-500 transition-colors ${
                          deleteLoading === note._id ? 'opacity-50 cursor-not-allowed' : ''
                        }`}
                        disabled={deleteLoading === note._id}
                      >
                        {deleteLoading === note._id ? (
                          <div className="animate-spin h-4 w-4 border-2 border-red-500 border-t-transparent rounded-full" />
                        ) : (
                          <FiTrash2 size={16} />
                        )}
                      </button>
                    </div>
                  </li>
                ))
              )}
            </ul>
          </div>
        </div>
      </div>

      <div className="flex-1 bg-white dark:bg-gray-800 flex flex-col h-screen">
        <div className="p-4 flex flex-col h-full">
          <div className="flex items-center gap-2 mb-4">
            <input
              type="text"
              placeholder="Note Title *"
              {...register('title', { required: 'Title is required' })}
              onChange={handleTitleChange}
              className="border p-1 text-2xl font-bold w-full focus:outline-none bg-white dark:bg-gray-700 dark:text-white transition-colors"
            />
          </div>
          {errors.title && (
            <p className="text-red-500 text-sm mb-2">{errors.title.message}</p>
          )}

          {/* <div className="flex-grow overflow-auto"> */}
            {/* <CustomRichTextEditor
              value={content}
              setValue={handleContentChange}
              placeholder="Write your note here..."
              className="h-[calc(100vh-180px)]"
            /> */}
          {/* </div> */}

          <MdeEditor
            currentNote={content}
            updateNote={handleContentChange}
          />
        </div>
        <Button
          variant="outlined"
          color="primary"
          startIcon={<FiLogOut />}
          onClick={handleLogout}
          sx={{
            marginBottom: '10px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)', // Optional: add subtle shadow
          }}
        >
          Logout
        </Button>
      </div>

      <ToastContainer />
    </div>
  )
}
