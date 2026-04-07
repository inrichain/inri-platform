import Link from 'next/link'
import { withBasePath } from '@/lib/site'

type LogoProps = {
  size?: number
  className?: string
  href?: string
  showText?: boolean
}

export function Logo({
  size = 56,
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
    <Link href={href} className="flex min-w-0 items-center gap-3 md:gap-4">
      <span className="shrink-0">{icon}</span>
      <div className="min-w-0">
        <p className="truncate text-sm font-bold uppercase tracking-[0.24em] text-primary sm:text-base">
          INRI CHAIN
        </p>
        <p className="truncate text-[11px] text-white/56 sm:text-xs">PoW • Chain 3777</p>
      </div>
    </Link>
  )
}
