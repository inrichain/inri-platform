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
    <Link href={href} translate="no" className="notranslate flex min-w-0 items-center gap-3.5 md:gap-4">
      <span className="shrink-0">{icon}</span>
      <div className="min-w-0">
        <p className="truncate text-[15px] font-extrabold uppercase tracking-[0.28em] text-primary sm:text-[1.05rem]" translate="no">
          INRI CHAIN
        </p>
        <p className="truncate text-sm font-semibold text-white/58" translate="no">PoW • Chain 3777</p>
      </div>
    </Link>
  )
}
