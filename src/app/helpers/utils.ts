import { LOCAL_STORAGE_KEY } from "../constants/localStorage"
import { INoteForm } from "../interfaces/types"


// Save to localStorage
export const saveToLocalStorage = (data: Partial<INoteForm>) => {
  if (data.title) localStorage.setItem(LOCAL_STORAGE_KEY.TITLE, data.title)
  if (data.content) localStorage.setItem(LOCAL_STORAGE_KEY.CONTENT, data.content)
  localStorage.setItem(LOCAL_STORAGE_KEY.LAST_SAVED, new Date().toISOString())
}
