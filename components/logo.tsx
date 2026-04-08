import Link from 'next/link'
import { withBasePath } from '@/lib/site'

type LogoProps = {
  size?: number
  className?: string
  href?: string
  showText?: boolean
}

export function Logo({
  size = 52,
  className = '',
  href = '/',
  showText = false,
}: LogoProps) {
  const icon = (
    <img
      src={withBasePath('/inri-logo.png')}
      alt="INRI CHAIN"
      width={size}
      height={size}
      className={className || 'object-contain'}
      style={{ width: size, height: size, objectFit: 'contain' }}
    />
  )

  if (!showText) return icon

  return (
    <Link href={href} translate="no" className="notranslate flex min-w-0 items-center gap-3.5 md:gap-4">
      <span className="shrink-0">{icon}</span>
      <div className="min-w-0">
        <p className="truncate text-[1rem] font-extrabold uppercase tracking-[0.26em] text-primary sm:text-[1.12rem]" translate="no">
          INRI CHAIN
        </p>
        <p className="truncate text-[0.95rem] font-semibold text-white/65" translate="no">
          PoW • Chain 3777
        </p>
      </div>
    </Link>
  )
}
