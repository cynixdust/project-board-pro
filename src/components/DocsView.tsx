import { useAppStore } from '../store'
import { FileText, Plus, Trash2, Save } from 'lucide-react'
import { useState } from 'react'
import type { DocPage } from '../types'

export default function DocsView() {
  const { docPages, currentProject, addDocPage, updateDocPage, deleteDocPage } = useAppStore()
  const [selectedDoc, setSelectedDoc] = useState<DocPage | null>(null)
  const [editorContent, setEditorContent] = useState('')
  const [newDocTitle, setNewDocTitle] = useState('')
  const [showNewDoc, setShowNewDoc] = useState(false)

  const projectDocs = docPages.filter(d => d.projectId === currentProject)

  const handleSelectDoc = (doc: DocPage) => {
    setSelectedDoc(doc)
    setEditorContent(doc.content)
  }

  const handleSave = () => {
    if (!selectedDoc) return
    updateDocPage(selectedDoc.id, { content: editorContent })
    setSelectedDoc({ ...selectedDoc, content: editorContent })
  }

  const handleNewDoc = () => {
    if (!newDocTitle.trim()) return
    addDocPage({
      title: newDocTitle,
      content: '# ' + newDocTitle + '\n\nStart writing here...',
      projectId: currentProject || undefined,
      children: [],
      authorId: 'u1',
    })
    setNewDocTitle('')
    setShowNewDoc(false)
  }

  return (
    <div className="flex h-full">
      <div className="w-64 border-r border-gray-700 flex flex-col">
        <div className="p-3 border-b border-gray-700 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-white">Documents</h3>
          <button onClick={() => setShowNewDoc(!showNewDoc)} className="text-gray-400 hover:text-white">
            <Plus size={16} />
          </button>
        </div>

        {showNewDoc && (
          <div className="p-3 border-b border-gray-700">
            <input
              value={newDocTitle}
              onChange={e => setNewDocTitle(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleNewDoc()}
              placeholder="Document title..."
              className="w-full bg-gray-700 border border-gray-600 rounded px-2 py-1 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
            />
          </div>
        )}

        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {projectDocs.map(doc => (
            <div
              key={doc.id}
              onClick={() => handleSelectDoc(doc)}
              className={`flex items-center gap-2 p-2 rounded cursor-pointer text-sm ${
                selectedDoc?.id === doc.id ? 'bg-gray-700 text-white' : 'text-gray-300 hover:bg-gray-700/50'
              }`}
            >
              <FileText size={14} />
              <span className="truncate flex-1">{doc.title}</span>
              <button
                onClick={e => { e.stopPropagation(); deleteDocPage(doc.id) }}
                className="text-gray-500 hover:text-red-400"
              >
                <Trash2 size={12} />
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="flex-1 flex flex-col">
        {selectedDoc ? (
          <>
            <div className="p-4 border-b border-gray-700 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-white">{selectedDoc.title}</h2>
              <button
                onClick={handleSave}
                className="flex items-center gap-1 bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded text-sm"
              >
                <Save size={14} /> Save
              </button>
            </div>
            <textarea
              value={editorContent}
              onChange={e => setEditorContent(e.target.value)}
              className="flex-1 bg-gray-800 text-gray-200 p-4 font-mono text-sm resize-none focus:outline-none"
              placeholder="Write your documentation in Markdown..."
            />
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-500">
            <div className="text-center">
              <FileText size={48} className="mx-auto mb-3 opacity-30" />
              <p>Select a document or create a new one</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
