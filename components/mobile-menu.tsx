"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Menu, X } from "lucide-react"
import { Button } from "@/components/ui/button"

interface MobileMenuProps {
  isOpen?: boolean
  onClose?: () => void
  buttonClassName?: string
}

export function MobileMenu({ isOpen: controlledIsOpen, onClose, buttonClassName = "" }: MobileMenuProps = {}) {
  const [internalIsOpen, setInternalIsOpen] = useState(false)
  const isControlled = controlledIsOpen !== undefined
  const isOpen = isControlled ? controlledIsOpen : internalIsOpen
  const setIsOpen = isControlled ? (onClose || (() => {})) : setInternalIsOpen

  useEffect(() => {
    if (isControlled && !controlledIsOpen) {
      setInternalIsOpen(false)
    }
  }, [controlledIsOpen, isControlled])

  const handleToggle = () => {
    if (isControlled) {
      // Toggle the controlled state
      if (onClose) {
        // If we have onClose, we need to toggle - but we only have onClose, not onToggle
        // So we'll use a workaround: if it's open, close it; if it's closed, we need to open it
        // But we don't have onOpen, so we'll just toggle the internal state for now
        if (controlledIsOpen) {
          onClose()
        } else {
          setInternalIsOpen(true)
        }
      } else {
        setInternalIsOpen(!internalIsOpen)
      }
    } else {
      setInternalIsOpen(!internalIsOpen)
    }
  }

  const handleClose = () => {
    if (isControlled && onClose) {
      onClose()
    } else {
      setInternalIsOpen(false)
    }
  }

  return (
    <>
      <div className="md:hidden">
        <Button
          variant="ghost"
          size="icon"
          onClick={handleToggle}
          className={buttonClassName || "text-white hover:bg-white/10"}
        >
          {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </Button>
      </div>

      {isOpen && (
        <div className="fixed inset-0 top-16 bg-primary/95 backdrop-blur-lg z-50 animate-in fade-in slide-in-from-top-5 duration-300 md:hidden">
          <nav className="flex flex-col items-center gap-6 p-8">
            <Link
              href="/"
              className="text-xl text-primary-foreground hover:text-accent transition-colors"
              onClick={handleClose}
            >
              خانه
            </Link>
            <Link
              href="/about"
              className="text-xl text-primary-foreground/80 hover:text-accent transition-colors"
              onClick={handleClose}
            >
              درباره ما
            </Link>
            <Link
              href="/products"
              className="text-xl text-primary-foreground/80 hover:text-accent transition-colors"
              onClick={handleClose}
            >
              محصولات
            </Link>
            <Link
              href="/contact"
              className="text-xl text-primary-foreground/80 hover:text-accent transition-colors"
              onClick={handleClose}
            >
              تماس با ما
            </Link>
          </nav>
        </div>
      )}
    </>
  )
}
