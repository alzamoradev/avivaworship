'use client'

import { X } from 'lucide-react'
import { ReactNode, useEffect } from 'react'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  children: ReactNode
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full'
}

export function Modal({ isOpen, onClose, title, children, size = 'md' }: ModalProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])
  
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }
    
    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
    }
    
    return () => {
      document.removeEventListener('keydown', handleEscape)
    }
  }, [isOpen, onClose])
  
  if (!isOpen) return null
  
  const sizes = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    full: 'max-w-full mx-4'
  }
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/70 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className={`relative w-full ${sizes[size]} bg-aviva-dark border border-aviva-gray rounded-2xl shadow-2xl animate-slide-up overflow-hidden`}>
        {/* Header */}
        {title && (
          <div className="flex items-center justify-between px-6 py-4 border-b border-aviva-gray">
            <h2 className="text-xl font-bold text-aviva-text">{title}</h2>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-aviva-gray transition-colors text-aviva-text-muted hover:text-aviva-text"
            >
              <X size={20} />
            </button>
          </div>
        )}
        
        {/* Content */}
        <div className={`${!title ? 'pt-4' : ''} px-6 pb-6 max-h-[80vh] overflow-y-auto`}>
          {!title && (
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 rounded-lg hover:bg-aviva-gray transition-colors text-aviva-text-muted hover:text-aviva-text"
            >
              <X size={20} />
            </button>
          )}
          {children}
        </div>
      </div>
    </div>
  )
}

