
import { useEffect, useRef, useState } from "react";
import { Html5Qrcode,Html5QrcodeSupportedFormats } from "html5-qrcode";
import { BrowserMultiFormatReader } from "@zxing/browser";
import { BarcodeFormat, DecodeHintType } from "@zxing/library";

type Product = {
  id: number;
  barcode: string;
  name: string;
};

export default function BarcodeScanner() {
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const busyRef = useRef(false);

  const [running, setRunning] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [product, setProduct] = useState<Product | null>(null);

  useEffect(() => {
    return () => {
      const scanner = scannerRef.current;
      scannerRef.current = null;
      if (scanner) {
        void scanner.stop().catch(() => {});
      }
    };
  }, []);

  async function startCamera() {
    if (loading || running) return;

    setLoading(true);
    setMessage("");
    setProduct(null);
    busyRef.current = false;

    try {
      const cameras = await Html5Qrcode.getCameras();

      console.log("Available cameras:", cameras);

      if (cameras.length === 0) {
        throw new Error("No camera found");
      }

      const scanner = new Html5Qrcode("barcode-reader", {
        formatsToSupport: [
          Html5QrcodeSupportedFormats.EAN_8,
          Html5QrcodeSupportedFormats.EAN_13,
        ],
        verbose: false,
      });

      scannerRef.current = scanner;

      await scanner.start(
        cameras[0].id,
        {
          fps: 10,
          qrbox: { width: 250, height: 150 },
        },
        async (barcode) => {
          if (busyRef.current) return;
          busyRef.current = true;

          setMessage(`Scanned: ${barcode}`);

          await scanner.stop().catch(() => {});
          setRunning(false);

          try {
            const response = await fetch(
              `/api/products/${encodeURIComponent(barcode)}`
            );

            if (!response.ok) {
              setMessage(`Barcode ${barcode}: Product not found`);
              return;
            }

            const data = (await response.json()) as Product;
            setProduct(data);
            setMessage("Product found!");
          } catch (error) {
            console.error(error);
            setMessage("Backend connection failed");
          }
        },
        () => {}
      );

      setRunning(true);
      setMessage("Camera is ready. Scan a barcode.");
    } catch (error) {
      console.error("Camera error:", error);
      setMessage(
        error instanceof Error ? error.message : String(error)
      );
    } finally {
      setLoading(false);
    }
  }

  async function stopCamera() {
    const scanner = scannerRef.current;
    if (!scanner) return;

    try {
      await scanner.stop();
      setRunning(false);
      setMessage("Camera stopped");
    } catch (error) {
      console.error("Stop error:", error);
    }
  }
  async function uploadBarcodeImage(
    event: React.ChangeEvent<HTMLInputElement>
  ) {
    const file = event.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setMessage("Please select an image file");
      return;
    }

    if (running || loading) {
      setMessage("Stop the camera before uploading an image");
      return;
    }

    setLoading(true);
    setProduct(null);
    setMessage("Scanning uploaded image...");

    try {
      const hints = new Map();
      hints.set(DecodeHintType.POSSIBLE_FORMATS, [
        BarcodeFormat.EAN_8,
        BarcodeFormat.EAN_13,
      ]);

      const reader = new BrowserMultiFormatReader(hints);

      const imageUrl = URL.createObjectURL(file);
      const img = new Image();
      img.src = imageUrl;

      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = () => reject(new Error("Could not load image"));
      });

      const result = await reader.decodeFromImageElement(img);
      const barcode = result.getText();

      setMessage(`Scanned barcode: ${barcode}`);

      const response = await fetch(
        `/api/products/${encodeURIComponent(barcode)}`
      );

      if (response.status === 404) {
        setMessage(`Barcode ${barcode}: Product not found`);
        URL.revokeObjectURL(imageUrl);
        event.target.value = "";
        setLoading(false);
        return;
      }

      if (!response.ok) {
        throw new Error("Product lookup failed");
      }

      const data = await response.json();
      setProduct(data);
      setMessage("Product found!");

      URL.revokeObjectURL(imageUrl);
    } catch (error) {
      console.error("Upload scan error:", error);
      setMessage("Could not detect a barcode from the uploaded image");
    } finally {
      setLoading(false);
      event.target.value = "";
    }
  }

  return (
    <div style={{ padding: 20, maxWidth: 500 }}>
      <h2>PantryPal Barcode Scanner</h2>

      <button
        onClick={startCamera}
        disabled={running || loading}
      >
        {loading ? "Opening..." : "Start Camera"}
      </button>

      <button onClick={stopCamera} disabled={!running}>
        Stop Camera
      </button>


      <div style={{ marginTop: 20 }}>
        <label htmlFor="barcode-upload">
          <strong>Upload Barcode Image</strong>
        </label>

        <input
          id="barcode-upload"
          type="file"
          accept="image/*"
          disabled={running || loading}
          onChange={uploadBarcodeImage}
          style={{ display: "block", marginTop: 10 }}
        />

        <div
          id="barcode-image-reader"
          style={{
            width: "100%",
            maxWidth: 400,
            marginTop: 15,
          }}
        />
      </div>


      <div
        id="barcode-reader"
        style={{
          width: "100%",
          minHeight: 250,
          marginTop: 20,
        }}
      />

      <p>{message}</p>

      {product && (
        <div>
          <h3>{product.name}</h3>
          <p>Barcode: {product.barcode}</p>
        </div>
      )}
    </div>
  );
}
