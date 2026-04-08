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
      className={className || 'object-contain drop-shadow-[0_0_22px_rgba(19,164,255,0.20)]'}
      style={{ width: size, height: size, objectFit: 'contain' }}
    />
  )

  if (!showText) return icon

  return (
    <Link href={href} className="flex min-w-0 items-center gap-3 md:gap-4">
      <span className="shrink-0">{icon}</span>
      <div className="min-w-0">
        <p className="truncate text-sm font-extrabold uppercase tracking-[0.26em] text-primary sm:text-base">
          INRI CHAIN
        </p>
        <p className="truncate text-[11px] font-medium text-white/58 sm:text-xs">PoW • Chain 3777</p>
      </div>
    </Link>
  )
}
