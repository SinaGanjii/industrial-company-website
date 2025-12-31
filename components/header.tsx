"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Building2, Menu, X } from "lucide-react"
import { MobileMenu } from "@/components/mobile-menu"

interface HeaderProps {
  variant?: "transparent" | "solid"
}

export function Header({ variant = "solid" }: HeaderProps) {
  const pathname = usePathname()
  const [isVisible, setIsVisible] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const isHomePage = pathname === "/"

  useEffect(() => {
    if (isHomePage) {
      setIsVisible(true)
    }
  }, [isHomePage])

  const isActive = (path: string) => pathname === path

  if (isHomePage && variant === "transparent") {
    return (
      <>
      <header
        className="fixed top-0 left-0 right-0 z-50 transition-all duration-300 h-16 md:h-20"
        style={{
          backgroundColor: isVisible ? "rgba(20, 20, 20, 0.95)" : "transparent",
          backdropFilter: isVisible ? "blur(10px)" : "none",
        }}
      >
        <div className="container mx-auto px-4 h-full flex items-center w-full">
          <nav className="flex items-center justify-between w-full">
            <div className="flex items-center gap-2 transition-transform hover:scale-105 duration-300">
              <Building2 className="h-7 w-7 md:h-9 md:w-9 text-accent" />
              <span className="text-base md:text-xl font-bold text-white">صنایع ساختمانی پیشرو</span>
            </div>

            <div className="hidden md:flex items-center gap-8">
              <Link href="/" className="text-white font-semibold relative group">
                خانه
                <span className="absolute -bottom-1 left-0 w-full h-0.5 bg-accent transform scale-x-100 transition-transform"></span>
              </Link>
              <Link href="/about" className="text-white/80 hover:text-white transition-colors relative group">
                درباره ما
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-accent group-hover:w-full transition-all duration-300"></span>
              </Link>
              <Link href="/products" className="text-white/80 hover:text-white transition-colors relative group">
                محصولات
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-accent group-hover:w-full transition-all duration-300"></span>
              </Link>
              <Link href="/contact" className="text-white/80 hover:text-white transition-colors relative group">
                تماس با ما
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-accent group-hover:w-full transition-all duration-300"></span>
              </Link>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="text-white hover:bg-white/10 md:hidden rounded-lg transition-all duration-200"
              >
                {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </Button>
            </div>
          </nav>
        </div>
      </header>
      {mobileMenuOpen && (
        <>
          <div 
            className="fixed inset-0 top-16 bg-gradient-to-b from-primary via-primary/98 to-primary/95 backdrop-blur-xl z-50 animate-in fade-in slide-in-from-top-5 duration-300 md:hidden"
            onClick={() => setMobileMenuOpen(false)}
          >
            <nav className="flex flex-col items-stretch gap-3 p-6 pt-8 max-w-sm mx-auto" onClick={(e) => e.stopPropagation()}>
              <Link
                href="/"
                className={`group relative flex items-center justify-between px-6 py-4 rounded-xl bg-primary-foreground/10 hover:bg-primary-foreground/20 border border-primary-foreground/20 hover:border-accent/50 transition-all duration-300 hover:scale-[1.02] hover:shadow-lg hover:shadow-accent/20 ${
                  isActive("/") ? "bg-accent/20 border-accent/50 shadow-md shadow-accent/10" : ""
                }`}
                onClick={() => setMobileMenuOpen(false)}
              >
                <span className={`text-lg font-semibold transition-colors ${
                  isActive("/") ? "text-accent" : "text-primary-foreground"
                }`}>
                  خانه
                </span>
                <div className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  isActive("/") ? "bg-accent scale-150" : "bg-primary-foreground/30 group-hover:bg-accent/50"
                }`} />
              </Link>
              <Link
                href="/about"
                className={`group relative flex items-center justify-between px-6 py-4 rounded-xl bg-primary-foreground/10 hover:bg-primary-foreground/20 border border-primary-foreground/20 hover:border-accent/50 transition-all duration-300 hover:scale-[1.02] hover:shadow-lg hover:shadow-accent/20 ${
                  isActive("/about") ? "bg-accent/20 border-accent/50 shadow-md shadow-accent/10" : ""
                }`}
                onClick={() => setMobileMenuOpen(false)}
              >
                <span className={`text-lg font-semibold transition-colors ${
                  isActive("/about") ? "text-accent" : "text-primary-foreground"
                }`}>
                  درباره ما
                </span>
                <div className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  isActive("/about") ? "bg-accent scale-150" : "bg-primary-foreground/30 group-hover:bg-accent/50"
                }`} />
              </Link>
              <Link
                href="/products"
                className={`group relative flex items-center justify-between px-6 py-4 rounded-xl bg-primary-foreground/10 hover:bg-primary-foreground/20 border border-primary-foreground/20 hover:border-accent/50 transition-all duration-300 hover:scale-[1.02] hover:shadow-lg hover:shadow-accent/20 ${
                  isActive("/products") ? "bg-accent/20 border-accent/50 shadow-md shadow-accent/10" : ""
                }`}
                onClick={() => setMobileMenuOpen(false)}
              >
                <span className={`text-lg font-semibold transition-colors ${
                  isActive("/products") ? "text-accent" : "text-primary-foreground"
                }`}>
                  محصولات
                </span>
                <div className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  isActive("/products") ? "bg-accent scale-150" : "bg-primary-foreground/30 group-hover:bg-accent/50"
                }`} />
              </Link>
              <Link
                href="/contact"
                className={`group relative flex items-center justify-between px-6 py-4 rounded-xl bg-primary-foreground/10 hover:bg-primary-foreground/20 border border-primary-foreground/20 hover:border-accent/50 transition-all duration-300 hover:scale-[1.02] hover:shadow-lg hover:shadow-accent/20 ${
                  isActive("/contact") ? "bg-accent/20 border-accent/50 shadow-md shadow-accent/10" : ""
                }`}
                onClick={() => setMobileMenuOpen(false)}
              >
                <span className={`text-lg font-semibold transition-colors ${
                  isActive("/contact") ? "text-accent" : "text-primary-foreground"
                }`}>
                  تماس با ما
                </span>
                <div className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  isActive("/contact") ? "bg-accent scale-150" : "bg-primary-foreground/30 group-hover:bg-accent/50"
                }`} />
              </Link>
            </nav>
          </div>
        </>
      )}
    </>
    )
  }

  return (
    <>
      <header className="border-b bg-card/80 backdrop-blur-md sticky top-0 z-50 h-16 md:h-20">
        <div className="container mx-auto px-4 h-full flex items-center w-full">
          <nav className="flex items-center justify-between w-full">
            <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
              <Building2 className="h-6 w-6 md:h-8 md:w-8 text-primary" />
              <span className="text-base md:text-xl font-bold text-foreground">صنایع ساختمانی پیشرو</span>
            </Link>
            <div className="hidden md:flex items-center gap-6 lg:gap-8">
              <Link
                href="/"
                className={`transition-colors text-sm lg:text-base ${
                  isActive("/")
                    ? "text-foreground font-medium"
                    : "text-muted-foreground hover:text-primary"
                }`}
              >
                خانه
              </Link>
              <Link
                href="/about"
                className={`transition-colors text-sm lg:text-base ${
                  isActive("/about")
                    ? "text-foreground font-medium"
                    : "text-muted-foreground hover:text-primary"
                }`}
              >
                درباره ما
              </Link>
              <Link
                href="/products"
                className={`transition-colors text-sm lg:text-base ${
                  isActive("/products")
                    ? "text-foreground font-medium"
                    : "text-muted-foreground hover:text-primary"
                }`}
              >
                محصولات
              </Link>
              <Link
                href="/contact"
                className={`transition-colors text-sm lg:text-base ${
                  isActive("/contact")
                    ? "text-foreground font-medium"
                    : "text-muted-foreground hover:text-primary"
                }`}
              >
                تماس با ما
              </Link>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                className="md:hidden rounded-lg transition-all duration-200 hover:bg-muted"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>
            </div>
          </nav>
        </div>
      </header>
      {mobileMenuOpen && (
        <>
          <div 
            className="fixed inset-0 top-16 bg-gradient-to-b from-primary via-primary/98 to-primary/95 backdrop-blur-xl z-50 animate-in fade-in slide-in-from-top-5 duration-300 md:hidden"
            onClick={() => setMobileMenuOpen(false)}
          >
            <nav className="flex flex-col items-stretch gap-3 p-6 pt-8 max-w-sm mx-auto" onClick={(e) => e.stopPropagation()}>
              <Link
                href="/"
                className={`group relative flex items-center justify-between px-6 py-4 rounded-xl bg-primary-foreground/10 hover:bg-primary-foreground/20 border border-primary-foreground/20 hover:border-accent/50 transition-all duration-300 hover:scale-[1.02] hover:shadow-lg hover:shadow-accent/20 ${
                  isActive("/") ? "bg-accent/20 border-accent/50 shadow-md shadow-accent/10" : ""
                }`}
                onClick={() => setMobileMenuOpen(false)}
              >
                <span className={`text-lg font-semibold transition-colors ${
                  isActive("/") ? "text-accent" : "text-primary-foreground"
                }`}>
                  خانه
                </span>
                <div className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  isActive("/") ? "bg-accent scale-150" : "bg-primary-foreground/30 group-hover:bg-accent/50"
                }`} />
              </Link>
              <Link
                href="/about"
                className={`group relative flex items-center justify-between px-6 py-4 rounded-xl bg-primary-foreground/10 hover:bg-primary-foreground/20 border border-primary-foreground/20 hover:border-accent/50 transition-all duration-300 hover:scale-[1.02] hover:shadow-lg hover:shadow-accent/20 ${
                  isActive("/about") ? "bg-accent/20 border-accent/50 shadow-md shadow-accent/10" : ""
                }`}
                onClick={() => setMobileMenuOpen(false)}
              >
                <span className={`text-lg font-semibold transition-colors ${
                  isActive("/about") ? "text-accent" : "text-primary-foreground"
                }`}>
                  درباره ما
                </span>
                <div className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  isActive("/about") ? "bg-accent scale-150" : "bg-primary-foreground/30 group-hover:bg-accent/50"
                }`} />
              </Link>
              <Link
                href="/products"
                className={`group relative flex items-center justify-between px-6 py-4 rounded-xl bg-primary-foreground/10 hover:bg-primary-foreground/20 border border-primary-foreground/20 hover:border-accent/50 transition-all duration-300 hover:scale-[1.02] hover:shadow-lg hover:shadow-accent/20 ${
                  isActive("/products") ? "bg-accent/20 border-accent/50 shadow-md shadow-accent/10" : ""
                }`}
                onClick={() => setMobileMenuOpen(false)}
              >
                <span className={`text-lg font-semibold transition-colors ${
                  isActive("/products") ? "text-accent" : "text-primary-foreground"
                }`}>
                  محصولات
                </span>
                <div className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  isActive("/products") ? "bg-accent scale-150" : "bg-primary-foreground/30 group-hover:bg-accent/50"
                }`} />
              </Link>
              <Link
                href="/contact"
                className={`group relative flex items-center justify-between px-6 py-4 rounded-xl bg-primary-foreground/10 hover:bg-primary-foreground/20 border border-primary-foreground/20 hover:border-accent/50 transition-all duration-300 hover:scale-[1.02] hover:shadow-lg hover:shadow-accent/20 ${
                  isActive("/contact") ? "bg-accent/20 border-accent/50 shadow-md shadow-accent/10" : ""
                }`}
                onClick={() => setMobileMenuOpen(false)}
              >
                <span className={`text-lg font-semibold transition-colors ${
                  isActive("/contact") ? "text-accent" : "text-primary-foreground"
                }`}>
                  تماس با ما
                </span>
                <div className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  isActive("/contact") ? "bg-accent scale-150" : "bg-primary-foreground/30 group-hover:bg-accent/50"
                }`} />
              </Link>
            </nav>
          </div>
        </>
      )}
    </>
  )
}

