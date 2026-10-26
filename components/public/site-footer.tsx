import Link from 'next/link'
import { getTranslations } from 'next-intl/server'
import { getSettings } from '@/server/db/queries/settings'
import {
  ICP_REGISTRATION_URL,
  PUBLIC_SECURITY_REGISTRATION_URL,
  normalizePublicSecurityRegistrationUrl,
} from '@/lib/registration'
import styles from './site-footer.module.css'

interface SiteFooterProps {
  locale: string
}

export async function SiteFooter({ locale }: SiteFooterProps) {
  const [settings, t] = await Promise.all([
    getSettings(),
    getTranslations({ locale, namespace: 'footer' }),
  ])
  const icpRegistration = settings.icpRegistration.trim()
  const publicSecurityRegistration = settings.publicSecurityRegistration.trim()
  const publicSecurityUrl = normalizePublicSecurityRegistrationUrl(
    settings.publicSecurityRegistrationUrl,
  ) || PUBLIC_SECURITY_REGISTRATION_URL

  return (
    <footer className={styles.footer} aria-label={t('label')}>
      <div className={styles.inner}>
        <div className={styles.main}>
          <Link href={`/${locale}`} className={styles.brand}>
            <span className={styles.mark} aria-hidden="true">✳</span>
            {settings.blogName}
          </Link>
          <p className={styles.note}>{t('note')}</p>
          <p className={styles.copyright}>
            © {new Date().getFullYear()} {settings.authorName || settings.blogName}
          </p>
        </div>

        {(icpRegistration || publicSecurityRegistration) && (
          <nav className={styles.registrations} aria-label={t('registration')}>
            {icpRegistration && (
              <a href={ICP_REGISTRATION_URL} target="_blank" rel="noopener noreferrer">
                {icpRegistration}
                <span className="sr-only">{t('opensInNewTab')}</span>
              </a>
            )}
            {publicSecurityRegistration && (
              <a href={publicSecurityUrl} target="_blank" rel="noopener noreferrer">
                {publicSecurityRegistration}
                <span className="sr-only">{t('opensInNewTab')}</span>
              </a>
            )}
          </nav>
        )}
      </div>
    </footer>
  )
}
