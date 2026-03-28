import { useState, useEffect } from 'react'
import { Download, X } from 'lucide-react'

/**
 * PWAInstallPrompt
 * Listens for the browser's `beforeinstallprompt` event and shows
 * a non-intrusive install banner at the bottom of the screen.
 * The banner dismisses permanently (session) once the user taps
 * "Install" or "Not now".
 */
export default function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null)
  const [visible, setVisible] = useState(false)
  const [installing, setInstalling] = useState(false)

  useEffect(() => {
    const handler = (e) => {
      e.preventDefault()
      setDeferredPrompt(e)
      setVisible(true)
    }

    window.addEventListener('beforeinstallprompt', handler)

    // If already installed (standalone mode), never show
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setVisible(false)
    }

    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  const handleInstall = async () => {
    if (!deferredPrompt) return
    setInstalling(true)
    deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice
    setDeferredPrompt(null)
    setVisible(false)
    setInstalling(false)
  }

  const handleDismiss = () => {
    setVisible(false)
    setDeferredPrompt(null)
  }

  if (!visible) return null

  return (
    <div className="pwa-install-banner" role="banner" aria-label="Install ARKA app">
      <div className="pwa-install-left">
        <div className="pwa-install-icon">
          <Download size={18} />
        </div>
        <div className="pwa-install-text">
          <span className="pwa-install-title">Add ARKA to Home Screen</span>
          <span className="pwa-install-sub">Works offline. No app store needed.</span>
        </div>
      </div>
      <div className="pwa-install-actions">
        <button className="pwa-install-btn" onClick={handleInstall} disabled={installing}>
          {installing ? 'Installing...' : 'Install'}
        </button>
        <button className="pwa-install-dismiss" onClick={handleDismiss} aria-label="Dismiss">
          <X size={16} />
        </button>
      </div>
    </div>
  )
}
