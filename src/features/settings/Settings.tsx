import { useState, useRef } from 'react'
import { Layout } from '@/components/Layout'
import { Card } from '@/components/Card'
import { Button } from '@/components/Button'
import { Modal } from '@/components/Modal'
import { Input } from '@/components/Input'
import { useAppData } from '@/context/AppDataContext'
import { encryptToFile, decryptFromFile } from '@/lib/crypto'
import { exportAll } from '@/lib/storage'
import type { AppData } from '@/lib/types'

export function Settings() {
  const { restoreAll } = useAppData()
  const [exportModal, setExportModal] = useState(false)
  const [importModal, setImportModal] = useState(false)
  const [passphrase, setPassphrase] = useState('')
  const [confirm, setConfirm] = useState('')
  const [status, setStatus] = useState('')
  const [error, setError] = useState('')
  const [importFile, setImportFile] = useState<File | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  const resetModal = () => {
    setPassphrase('')
    setConfirm('')
    setStatus('')
    setError('')
    setImportFile(null)
  }

  const handleExport = async () => {
    setError('')
    if (passphrase.length < 8) { setError('Passphrase must be at least 8 characters.'); return }
    if (passphrase !== confirm) { setError('Passphrases do not match.'); return }
    try {
      setStatus('Encrypting…')
      const data = exportAll()
      const blob = await encryptToFile(data, passphrase)
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `hearth-backup-${new Date().toISOString().split('T')[0]}.enc`
      a.click()
      URL.revokeObjectURL(url)
      setStatus('Backup downloaded successfully.')
      setError('')
    } catch {
      setError('Encryption failed. Please try again.')
      setStatus('')
    }
  }

  const handleImport = async () => {
    setError('')
    if (!importFile) { setError('Please select a backup file.'); return }
    if (!passphrase) { setError('Please enter your passphrase.'); return }
    try {
      setStatus('Decrypting…')
      const data = await decryptFromFile(importFile, passphrase) as AppData
      restoreAll(data)
      setStatus('Data restored successfully. Reloading…')
      setTimeout(() => window.location.reload(), 1200)
    } catch {
      setError('Decryption failed. Wrong passphrase or corrupted file.')
      setStatus('')
    }
  }

  return (
    <Layout title="Settings">
      <div className="space-y-3">
        <Card>
          <div className="font-medium text-white mb-1">Data Backup</div>
          <p className="text-sm text-muted mb-3">
            Export all your data as an encrypted file. Store it anywhere — Google Drive, iCloud, USB drive.
            You'll need your passphrase to restore it.
          </p>
          <Button onClick={() => { resetModal(); setExportModal(true) }} className="w-full">
            Export Encrypted Backup
          </Button>
        </Card>

        <Card>
          <div className="font-medium text-white mb-1">Restore from Backup</div>
          <p className="text-sm text-muted mb-3">
            Import a previously exported <code className="text-gray-400">.enc</code> backup file.
            This will overwrite all current data.
          </p>
          <Button variant="ghost" onClick={() => { resetModal(); setImportModal(true) }} className="w-full border border-border">
            Import Backup File
          </Button>
        </Card>

        <Card>
          <div className="font-medium text-white mb-1">Install as App</div>
          <p className="text-sm text-muted">
            <strong className="text-white">Desktop (Chrome):</strong> Click the install icon (⊕) in the address bar to install Hearth as a desktop app.
          </p>
          <p className="text-sm text-muted mt-2">
            <strong className="text-white">iPhone:</strong> Open this URL in Safari, tap the Share button, then "Add to Home Screen".
          </p>
        </Card>

        <Card>
          <div className="font-medium text-white mb-1">About</div>
          <div className="text-sm text-muted space-y-1">
            <p>Hearth — Personal Finance Manager</p>
            <p>All data stored locally on your device.</p>
            <p>No server. No account. No tracking.</p>
          </div>
        </Card>
      </div>

      {exportModal && (
        <Modal
          title="Export Encrypted Backup"
          onClose={() => { setExportModal(false); resetModal() }}
          footer={
            <>
              <Button variant="ghost" onClick={() => { setExportModal(false); resetModal() }}>Cancel</Button>
              <Button onClick={handleExport} disabled={!passphrase || !confirm}>Export</Button>
            </>
          }
        >
          <div className="space-y-3">
            <p className="text-sm text-muted">Choose a strong passphrase. You'll need it to restore your data.</p>
            <Input label="Passphrase" type="password" value={passphrase} onChange={(e) => setPassphrase(e.target.value)} placeholder="At least 8 characters" />
            <Input label="Confirm Passphrase" type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} />
            {error && <p className="text-accent-red text-sm">{error}</p>}
            {status && <p className="text-accent-green text-sm">{status}</p>}
          </div>
        </Modal>
      )}

      {importModal && (
        <Modal
          title="Restore from Backup"
          onClose={() => { setImportModal(false); resetModal() }}
          footer={
            <>
              <Button variant="ghost" onClick={() => { setImportModal(false); resetModal() }}>Cancel</Button>
              <Button variant="danger" onClick={handleImport} disabled={!importFile || !passphrase}>Restore</Button>
            </>
          }
        >
          <div className="space-y-3">
            <p className="text-sm text-accent-red font-medium">⚠ This will overwrite all current data.</p>
            <input
              ref={fileRef}
              type="file"
              accept=".enc"
              className="hidden"
              onChange={(e) => setImportFile(e.target.files?.[0] ?? null)}
            />
            <Button variant="ghost" onClick={() => fileRef.current?.click()} className="w-full border border-border">
              {importFile ? importFile.name : 'Select .enc backup file'}
            </Button>
            <Input label="Passphrase" type="password" value={passphrase} onChange={(e) => setPassphrase(e.target.value)} placeholder="Enter your passphrase" />
            {error && <p className="text-accent-red text-sm">{error}</p>}
            {status && <p className="text-accent-green text-sm">{status}</p>}
          </div>
        </Modal>
      )}
    </Layout>
  )
}
