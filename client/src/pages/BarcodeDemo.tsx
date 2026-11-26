import { useTranslation } from 'react-i18next'
import { useRef, useState } from 'react'
import { Link } from 'react-router'
import BarcodeScanner from '../components/BarcodeScanner'
import { ApiError } from '../api/barcodeclient'
import { getProductByBarcode } from '../api/products'
import type { Product } from '../api/products'
import appLogo from '../assets/logo-wordmark.svg'
import '../styles/BarcodeDemo.css'

export default function BarcodeDemo() {
  const { t, i18n } = useTranslation()
  const [product, setProduct] = useState<Product | null>(null)
  const [message, setMessage] = useState<{ key: keyof typeof import('../locales/en/translation.json').barcode.messages; barcode?: string } | null>(null)
  const [loading, setLoading] = useState(false)
  const requestId = useRef(0)

  async function handleScan(barcode: string) {
    const id = ++requestId.current
    setProduct(null)
    setLoading(true)
    setMessage({ key: "lookup", barcode })
    try {
      const result = await getProductByBarcode(barcode)
      if (id !== requestId.current) return
      setProduct(result)
      setMessage({ key: "found" })
    } catch (error) {
      if (id !== requestId.current) return
      setMessage({ key: error instanceof ApiError && error.status === 404 ? 'notFound' : 'lookupFailed', barcode })
    } finally {
      if (id === requestId.current) setLoading(false)
    }
  }

  return (
    <main className="barcode-page">
      <nav className="barcode-page__nav" aria-label={t("barcode.nav")}>
        <Link to="/" aria-label={t("barcode.home")}>
          <img src={appLogo} alt="PantryPal" width="150" />
        </Link>
        <Link to="/" className="barcode-page__back"><span aria-hidden="true">{i18n.dir() === "rtl" ? "→" : "←"}</span> {t("barcode.back")}</Link>
      </nav>
      <div className="barcode-page__content">
        <header className="barcode-page__intro">
          <span className="barcode-page__eyebrow">{t("barcode.tagline")}</span>
          <h1>{t("barcode.headline")}<br /><em>{t("barcode.scan")}</em></h1>
          <p>{t("barcode.intro")}</p>
          <div className="barcode-page__steps" aria-label={t("barcode.steps")}>
            <span><b>01</b> {t("barcode.stepScan")}</span>
            <span><b>02</b> {t("barcode.stepFind")}</span>
          </div>
        </header>
        <div className="barcode-page__workspace" role="region" aria-label={t("barcode.region")} tabIndex={0}>
          <BarcodeScanner onScan={handleScan} disabled={loading} />
          <div role="status" aria-live="polite" aria-atomic="true">
            {message && (
              <section className={`barcode-page__result${product ? ' barcode-page__result--found' : ''}`} aria-label={t("barcode.result")} aria-busy={loading}>
                {product && <h2>{product.name}</h2>}
                <p>{message && t(`barcode.messages.${message.key}`, { barcode: message.barcode })}</p>
                {product && <p className="barcode-page__barcode">{product.barcode}</p>}
              </section>
            )}
          </div>
          <p className="barcode-page__note">{t("barcode.note")}</p>
        </div>
      </div>
    </main>
  )
}
