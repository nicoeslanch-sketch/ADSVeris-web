import { StrictMode, useCallback, useEffect, useState } from 'react'
import { createRoot } from 'react-dom/client'
import KommoContactForm from './components/KommoContactForm'

const WIDGET_ID = 'ads-veris-kommo-widget-root'

function KommoWidget() {
  const [isOpen, setIsOpen] = useState(false)
  const [defaultService, setDefaultService] = useState('Planilla Excel Personalizada')

  const openModal = useCallback((serviceType) => {
    if (serviceType) setDefaultService(serviceType)
    setIsOpen(true)
  }, [])

  useEffect(() => {
    window.openKommoContactForm = openModal
    window.dispatchEvent(new CustomEvent('adsveris:kommo-widget-ready'))

    return () => {
      if (window.openKommoContactForm === openModal) {
        delete window.openKommoContactForm
      }
    }
  }, [openModal])

  return (
    <KommoContactForm
      isOpen={isOpen}
      onClose={() => setIsOpen(false)}
      defaultService={defaultService}
    />
  )
}

function ensureRoot() {
  let root = document.getElementById(WIDGET_ID)
  if (!root) {
    root = document.createElement('div')
    root.id = WIDGET_ID
    document.body.appendChild(root)
  }
  return root
}

createRoot(ensureRoot()).render(
  <StrictMode>
    <KommoWidget />
  </StrictMode>
)
