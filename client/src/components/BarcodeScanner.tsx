import { useTranslation } from 'react-i18next'

import { useEffect, useId, useRef, useState } from "react";
import "../styles/BarcodeScanner.css";
import { Html5Qrcode,Html5QrcodeSupportedFormats } from "html5-qrcode";
import { BrowserMultiFormatReader } from "@zxing/browser";
import { BarcodeFormat, DecodeHintType } from "@zxing/library";

interface BarcodeScannerProps {
  onScan: (barcode: string) => void
  disabled?: boolean
}

export default function BarcodeScanner({ onScan, disabled = false }: BarcodeScannerProps) {
  const { t } = useTranslation()
  const readerId = useId();
  const uploadId = useId();
  const [cameras, setCameras] = useState<{ id: string; label: string }[]>([]);
  const [cameraId, setCameraId] = useState("");
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const busyRef = useRef(false);

  const [running, setRunning] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ key: keyof typeof import("../locales/en/translation.json").barcode.messages; barcode?: string } | null>(null);
  const [manualBarcode, setManualBarcode] = useState("");

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
    if (disabled || loading || running) return;

    setLoading(true);
    setMessage(null);
    busyRef.current = false;

    try {
      if (!window.isSecureContext || !navigator.mediaDevices?.getUserMedia) {
        setMessage({ key: "secure" });
        return;
      }
      scannerRef.current?.clear();

      const scanner = new Html5Qrcode(readerId, {
        formatsToSupport: [
          Html5QrcodeSupportedFormats.EAN_8,
          Html5QrcodeSupportedFormats.EAN_13,
        ],
        verbose: false,
      });

      scannerRef.current = scanner;

      await scanner.start(
        cameraId || { facingMode: "environment" },
        {
          fps: 10,
          qrbox: (width, height) => ({
            width: Math.max(1, Math.floor(Math.min(300, width * 0.85))),
            height: Math.max(1, Math.floor(Math.min(150, height * 0.65))),
          }),
        },
        async (barcode) => {
          if (busyRef.current) return;
          busyRef.current = true;

          setMessage({ key: "scanned", barcode });

          await scanner.stop().catch(() => {});
          setRunning(false);

          onScan(barcode);
        },
        () => {}
      );

      setRunning(true);
      setMessage({ key: "cameraReady" });
      void Html5Qrcode.getCameras().then(setCameras).catch(() => {});
    } catch (error) {
      console.error("Camera error:", error);
      const name = error instanceof Error ? error.name : "";
      setMessage({ key: name === "NotAllowedError" ? "denied"
        : name === "NotFoundError" ? "noCamera"
        : name === "NotReadableError" ? "unavailable" : "cameraError" });
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
      setMessage({ key: "stopped" });
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
      setMessage({ key: "imageOnly" });
      return;
    }

    if (disabled || running || loading) {
      setMessage({ key: "stopFirst" });
      return;
    }

    setLoading(true);
    setMessage({ key: "scanningImage" });

    let imageUrl: string | undefined;
    try {
      const hints = new Map();
      hints.set(DecodeHintType.POSSIBLE_FORMATS, [
        BarcodeFormat.EAN_8,
        BarcodeFormat.EAN_13,
      ]);

      const reader = new BrowserMultiFormatReader(hints);

      imageUrl = URL.createObjectURL(file);
      const img = new Image();

      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = () => reject(new Error("Could not load image"));
        img.src = imageUrl!;
      });

      const result = await reader.decodeFromImageElement(img);
      const barcode = result.getText();

      setMessage({ key: "scanned", barcode });

      onScan(barcode);
    } catch (error) {
      console.error("Upload scan error:", error);
      setMessage({ key: "noBarcode" });
    } finally {
      if (imageUrl) URL.revokeObjectURL(imageUrl);
      setLoading(false);
      event.target.value = "";
    }
  }

  function submitManualBarcode(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (disabled || running || loading) return;

    const barcode = manualBarcode.trim();
    if (!/^(?:\d{8}|\d{13})$/.test(barcode)) {
      setMessage({ key: "invalid" });
      return;
    }

    setMessage({ key: "searching", barcode });
    setManualBarcode("");
    onScan(barcode);
  }

  return (
    <section className={`barcode-scanner${running ? " barcode-scanner--running" : ""}`} aria-label={t("barcode.title")}>
      <div className="barcode-scanner__heading">
        <div><span className="barcode-scanner__eyebrow">{t("barcode.eyebrow")}</span><h2>{t("barcode.title")}</h2></div>
        <span className="barcode-scanner__badge"><i aria-hidden="true" />{t(loading ? "barcode.working" : running ? "barcode.cameraOn" : "barcode.ready")}</span>
      </div>

      <div className="barcode-scanner__viewfinder">
        <div id={readerId} className="barcode-scanner__reader" />
        {!running && !loading && (
          <div className="barcode-scanner__placeholder" aria-hidden="true">
            <div className="barcode-scanner__target"><div className="barcode-scanner__bars" /></div>
            <span>{t("barcode.frame")}</span>
          </div>
        )}
      </div>

      <p className="barcode-scanner__hint">{t("barcode.hint")}</p>

      {cameras.length > 1 && (
        <div className="barcode-scanner__camera-choice">
          <label htmlFor={`${readerId}-camera`}>{t("barcode.camera")}</label>
          <select id={`${readerId}-camera`} value={cameraId} disabled={running || loading} onChange={(event) => setCameraId(event.target.value)}>
            <option value="">{t("barcode.automatic")}</option>
            {cameras.map((camera, index) => <option key={camera.id} value={camera.id}>{camera.label || t("barcode.cameraNumber", { number: index + 1 })}</option>)}
          </select>
          <small>{t("barcode.switchHint")}</small>
        </div>
      )}
      <div className="barcode-scanner__actions">
        <button className="barcode-scanner__button" onClick={startCamera} disabled={disabled || running || loading}>
          {t(loading ? "barcode.wait" : "barcode.start")}
        </button>
        <button className="barcode-scanner__button barcode-scanner__button--secondary" onClick={stopCamera} disabled={!running}>
          {t("barcode.stop")}
        </button>
      </div>

      <details className="barcode-scanner__manual-disclosure">
        <summary>{t("barcode.manualToggle")}</summary>
        <form className="barcode-scanner__manual" onSubmit={submitManualBarcode}>
          <label htmlFor={`${readerId}-manual`}>{t("barcode.manualLabel")}</label>
          <div className="barcode-scanner__manual-row">
            <input
              id={`${readerId}-manual`}
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={13}
              autoComplete="off"
              placeholder={t("barcode.placeholder")}
              value={manualBarcode}
              onChange={(event) => setManualBarcode(event.target.value)}
              disabled={disabled || running || loading}
            />
            <button
              className="barcode-scanner__button"
              type="submit"
              disabled={disabled || running || loading}
            >
              {t("barcode.search")}
            </button>
          </div>
        </form>
        <p className="barcode-scanner__formats">{t("barcode.formats")}</p>
      </details>

      <details className="barcode-scanner__manual-disclosure">
        <summary>{t("barcode.uploadToggle")}</summary>
        <div className="barcode-scanner__upload">
          <label htmlFor={uploadId}>{t("barcode.uploadLabel")}</label>
          <p>{t("barcode.uploadHint")}</p>
          <input id={uploadId} type="file" accept="image/*" disabled={disabled || running || loading} onChange={uploadBarcodeImage} />
        </div>
      </details>

      <p className="barcode-scanner__message" role="status">{message && t(`barcode.messages.${message.key}`, { barcode: message.barcode })}</p>
    </section>
  );
}
