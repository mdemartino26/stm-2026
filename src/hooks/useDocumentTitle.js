import { useEffect } from 'react'

const BASE_TITLE = 'Set The Mood'

export default function useDocumentTitle(title) {
  useEffect(() => {
    document.title = title ? `${title} · ${BASE_TITLE}` : BASE_TITLE
  }, [title])
}
