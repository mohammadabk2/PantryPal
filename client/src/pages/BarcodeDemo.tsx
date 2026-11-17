import { useRef, useState } from 'react'
import { Link } from 'react-router'
import BarcodeScanner from '../components/BarcodeScanner'
import { ApiError } from '../api/client'
import { getProductByBarcode } from '../api/products'
import type { Product } from '../api/products'

export default function BarcodeDemo() {
  const [product, setProduct] = useState<Product | null>(null)
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const requestId = useRef(0)

  async function handleScan(barcode: string) {
    const id = ++requestId.current
    setProduct(null)
    setLoading(true)
    setMessage(`Looking up barcode ${barcode}...`)
    try {
      const result = await getProductByBarcode(barcode)
      if (id !== requestId.current) return
      setProduct(result)
      setMessage('Product found!')
    } catch (error) {
      if (id !== requestId.current) return
      setMessage(error instanceof ApiError && error.status === 404
        ? `Barcode ${barcode}: Product not found`
        : 'Product lookup failed. Please try again.')
    } finally {
      if (id === requestId.current) setLoading(false)
    }
  }

  return (
    <main style={{ padding: '30px' }}>
      <Link to="/">PantryPal</Link>
      <h1>PantryPal Barcode Demo</h1>
      <BarcodeScanner onScan={handleScan} disabled={loading} />
      <p role="status">{message}</p>
      {product && <div><h3>{product.name}</h3><p>Barcode: {product.barcode}</p></div>}
    </main>
  )
}
