import React from 'react'
import Link from 'next/link'
import { Camera, Globe, Mail } from 'lucide-react'

import Logo from '@/components/Logo'
import CopyRight from './CopyRIght'

const Footer = () => {
  return (
    <footer className="w-full border-t border-on-surface/5 bg-background dark:bg-inverse-surface dark:text-inverse-on-surface">
      <div className="mx-auto flex max-w-7xl flex-col items-center gap-10 px-8 py-16">
        <div className="font-headline text-2xl text-on-surface dark:text-inverse-on-surface">
          <Logo />
        </div>
        <nav
          className="flex flex-wrap justify-center gap-8 text-sm tracking-wide md:gap-10"
          aria-label="Footer"
        >
          {[
            ['Journal', '#'],
            ['Ethical Sourcing', '#'],
            ['Shipping Policy', '#'],
            ['Privacy', '#'],
            ['Contact', '/contact'],
          ].map(([label, href]) => (
            <Link
              key={label}
              href={href}
              className="text-on-surface/50 transition-opacity hover:text-on-surface dark:text-inverse-on-surface/50 dark:hover:text-inverse-on-surface"
            >
              {label}
            </Link>
          ))}
        </nav>
        <div className="mt-2 flex gap-6">
          <button
            type="button"
            className="flex size-10 items-center justify-center rounded-full bg-surface-container-high text-primary transition-all hover:bg-primary hover:text-on-primary"
            aria-label="Website"
          >
            <Globe className="size-4" />
          </button>
          <button
            type="button"
            className="flex size-10 items-center justify-center rounded-full bg-surface-container-high text-primary transition-all hover:bg-primary hover:text-on-primary"
            aria-label="Email"
          >
            <Mail className="size-4" />
          </button>
          <button
            type="button"
            className="flex size-10 items-center justify-center rounded-full bg-surface-container-high text-primary transition-all hover:bg-primary hover:text-on-primary"
            aria-label="Social"
          >
            <Camera className="size-4" />
          </button>
        </div>
        <CopyRight />
      </div>
    </footer>
  )
}

export default Footer
