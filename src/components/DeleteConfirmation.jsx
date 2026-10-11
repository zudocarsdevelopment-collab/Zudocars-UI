import { useEffect, useRef } from 'react'
import { Trash2, X } from 'lucide-react'

export default function DeleteConfirmation({ name, kind, loading, error, onClose, onConfirm, description }) {
  const dialogRef = useRef(null)
  useEffect(() => {
    const dialog = dialogRef.current
    dialog.showModal()
    return () => dialog.close()
  }, [])

  return <dialog ref={dialogRef} aria-labelledby="delete-title" aria-describedby="delete-description"
    onCancel={event => { event.preventDefault(); if (!loading) onClose() }}
    className="m-auto w-[calc(100%_-_2rem)] max-w-md rounded-2xl border-0 bg-white p-0 text-slate-800 shadow-2xl backdrop:bg-slate-900/50 backdrop:backdrop-blur-sm">
    <div className="relative p-6">
      <button type="button" aria-label="Close confirmation" disabled={loading} onClick={onClose}
        className="absolute right-4 top-4 rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 disabled:opacity-50"><X size={20} /></button>
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-red-600"><Trash2 size={24} /></div>
      <h3 id="delete-title" className="text-xl font-bold">Delete {kind}?</h3>
      <p id="delete-description" className="mt-2 break-words text-sm leading-6 text-slate-500">Are you sure you want to delete <strong className="text-slate-800">{name}</strong>? This action cannot be undone.</p>
      {description && <p className="mt-3 text-sm leading-6 text-slate-500">{description}</p>}
      {error && <p role="alert" className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}
      <div className="mt-6 flex justify-end gap-3">
        <button type="button" autoFocus disabled={loading} onClick={onClose} className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold hover:bg-slate-50 disabled:opacity-50">Cancel</button>
        <button type="button" disabled={loading} onClick={onConfirm} className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:cursor-wait disabled:opacity-60">{loading ? 'Deleting…' : `Delete ${kind}`}</button>
      </div>
    </div>
  </dialog>
}
