import { INoteForm } from "../interfaces/types"
import { STORAGE_KEY } from "../ui/constants/localStorage"

// Save to localStorage
export const saveToLocalStorage = (data: Partial<INoteForm>) => {
  if (data.title) localStorage.setItem(STORAGE_KEY.TITLE, data.title)
  if (data.content) localStorage.setItem(STORAGE_KEY.CONTENT, data.content)
  localStorage.setItem(STORAGE_KEY.LAST_SAVED, new Date().toISOString())
}
