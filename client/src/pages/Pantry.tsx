import { useEffect, useState, type FormEvent } from 'react'
import { Link, Navigate } from 'react-router'
import { useTranslation } from 'react-i18next'
import LanguageSwitcher from '../components/LanguageSwitcher'
import {
  addPantryItem,
  deletePantryItem,
  getPantryItems,
  updatePantryItem,
  type PantryItem,
} from '../api/pantryItems'
import { useAuth } from '../auth/useAuth'
import './Pantry.css'

type PantryErrorKey =
  | 'pantry.errors.loadFailed'
  | 'pantry.errors.saveFailed'
  | 'pantry.errors.deleteFailed'

interface ItemForm {
  name: string
  quantity: string
  unit: string
  expirationDate: string
  barcode: string
}

const EMPTY_FORM: ItemForm = {
  name: '',
  quantity: '',
  unit: '',
  expirationDate: '',
  barcode: '',
}

function Pantry() {
  const { t } = useTranslation()
  const { status } = useAuth()
  const [items, setItems] = useState<PantryItem[]>([])
  const [form, setForm] = useState<ItemForm>(EMPTY_FORM)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<PantryErrorKey | null>(null)

  useEffect(() => {
    if (status !== 'authenticated') return

    let cancelled = false
    getPantryItems()
      .then((loadedItems) => {
        if (!cancelled) setItems(loadedItems)
      })
      .catch(() => {
        if (!cancelled) setError('pantry.errors.loadFailed')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [status])

  if (status === 'loading') {
    return (
      <>
        <LanguageSwitcher />
        <section id="center">
          <p>{t('pantry.loading')}</p>
        </section>
      </>
    )
  }

  if (status !== 'authenticated') return <Navigate to="/login" replace />

  function resetForm() {
    setForm(EMPTY_FORM)
    setEditingId(null)
    setError(null)
  }

  function editItem(item: PantryItem) {
    setForm({
      name: item.name,
      quantity: item.quantity,
      unit: item.unit,
      expirationDate: item.expiration_date ?? '',
      barcode: item.barcode ?? '',
    })
    setEditingId(item.id)
    setError(null)
  }

  async function submitForm(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSaving(true)
    setError(null)

    const body = {
      name: form.name.trim(),
      quantity: form.quantity.trim(),
      unit: form.unit.trim(),
      expiration_date: form.expirationDate || null,
      barcode: form.barcode.trim() || null,
    }

    try {
      const saved = editingId
        ? await updatePantryItem(editingId, body)
        : await addPantryItem(body)
      setItems((current) => [saved, ...current.filter((item) => item.id !== saved.id)])
      resetForm()
    } catch {
      setError('pantry.errors.saveFailed')
    } finally {
      setSaving(false)
    }
  }

  async function removeItem(id: string) {
    setDeletingId(id)
    setError(null)
    try {
      await deletePantryItem(id)
      setItems((current) => current.filter((item) => item.id !== id))
      if (editingId === id) resetForm()
    } catch {
      setError('pantry.errors.deleteFailed')
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <>
      <LanguageSwitcher />
      <main className="pantry-page">
        <header className="pantry-header">
          <h1 className="pantry-title">{t('pantry.title')}</h1>
          <Link className="pantry-back-link" to="/">
            {t('pantry.backHome')}
          </Link>
        </header>

        <section className="pantry-panel" aria-labelledby="pantry-form-title">
          <h2 id="pantry-form-title">
            {t(editingId ? 'pantry.editTitle' : 'pantry.addTitle')}
          </h2>
          <form className="form pantry-form" onSubmit={(event) => void submitForm(event)}>
            <label className="field">
              {t('pantry.nameLabel')}
              <input
                className="input"
                required
                maxLength={200}
                value={form.name}
                onChange={(event) => setForm({ ...form, name: event.target.value })}
              />
            </label>

            <div className="pantry-form-grid">
              <label className="field">
                {t('pantry.quantityLabel')}
                <input
                  className="input"
                  type="number"
                  min="0.001"
                  max="9999999.999"
                  step="0.001"
                  required
                  value={form.quantity}
                  onChange={(event) => setForm({ ...form, quantity: event.target.value })}
                />
              </label>

              <label className="field">
                {t('pantry.unitLabel')}
                <input
                  className="input"
                  required
                  maxLength={32}
                  value={form.unit}
                  onChange={(event) => setForm({ ...form, unit: event.target.value })}
                />
              </label>

              <label className="field">
                {t('pantry.expirationDateLabel')}
                <input
                  className="input"
                  type="date"
                  value={form.expirationDate}
                  onChange={(event) => setForm({ ...form, expirationDate: event.target.value })}
                />
              </label>

              <label className="field">
                {t('pantry.barcodeLabel')}
                <input
                  className="input"
                  maxLength={64}
                  value={form.barcode}
                  onChange={(event) => setForm({ ...form, barcode: event.target.value })}
                />
              </label>
            </div>

            {error && (
              <p className="form-error" role="alert">
                {t(error)}
              </p>
            )}

            <div className="pantry-form-actions">
              <button className="btn" type="submit" disabled={saving}>
                {saving
                  ? t('pantry.saving')
                  : t(editingId ? 'pantry.save' : 'pantry.add')}
              </button>
              {editingId && (
                <button className="btn btn-secondary" type="button" onClick={resetForm}>
                  {t('pantry.cancel')}
                </button>
              )}
            </div>
          </form>
        </section>

        <section aria-labelledby="pantry-items-title">
          <h2 id="pantry-items-title">{t('pantry.itemsTitle')}</h2>
          {loading ? (
            <p>{t('pantry.loading')}</p>
          ) : error === 'pantry.errors.loadFailed' ? (
            <p className="form-error" role="alert">{t(error)}</p>
          ) : items.length === 0 ? (
            <p>{t('pantry.empty')}</p>
          ) : (
            <ul className="pantry-items">
              {items.map((item) => (
                <li className="pantry-item" key={item.id}>
                  <div className="pantry-item-details">
                    <h3>{item.name}</h3>
                    <p>
                      {item.quantity} {item.unit}
                    </p>
                    <p>
                      {t('pantry.expirationDateLabel')}: {item.expiration_date ?? t('pantry.noExpiry')}
                    </p>
                    {item.barcode && <p>{t('pantry.barcodeLabel')}: {item.barcode}</p>}
                  </div>
                  <div className="pantry-item-actions">
                    <button
                      className="btn btn-secondary"
                      type="button"
                      onClick={() => editItem(item)}
                    >
                      {t('pantry.edit')}
                    </button>
                    <button
                      className="btn btn-secondary"
                      type="button"
                      disabled={deletingId === item.id}
                      onClick={() => void removeItem(item.id)}
                    >
                      {deletingId === item.id ? t('pantry.deleting') : t('pantry.delete')}
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </main>
    </>
  )
}

export default Pantry
