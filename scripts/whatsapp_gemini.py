"""
WhatsApp + Gemini AI — Procesador automático de comprobantes de pago.

Flujo:
  1. Selenium abre WhatsApp Web y espera mensajes nuevos con adjuntos.
  2. Descarga cada imagen/PDF a una carpeta temporal.
  3. Envía el archivo a Gemini (google-generativeai) con un prompt estructurado.
  4. Parsea el JSON devuelto por la IA.
  5. Guarda el resultado en comprobantes.xlsx (openpyxl).
  6. (Opcional) POST a Supabase REST API para persistirlo en la nube.

Requisitos:
  pip install -r requirements.txt
  Configurar las variables de entorno (ver .env.example).

Uso:
  python scripts/whatsapp_gemini.py

  La primera vez abrirá un navegador Chrome para escanear el QR de WhatsApp.
  Después actúa como "listener" continuo — Ctrl+C para detener.
"""

from __future__ import annotations

import base64
import json
import mimetypes
import os
import re
import sys
import time
from datetime import datetime
from pathlib import Path

import requests
from dotenv import load_dotenv
from openpyxl import Workbook, load_workbook
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.common.by import By
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.support.ui import WebDriverWait
import google.generativeai as genai

# ── Configuración ─────────────────────────────────────────────────────────────

load_dotenv()

GEMINI_API_KEY   = os.environ["GEMINI_API_KEY"]
SUPABASE_URL     = os.getenv("VITE_SUPABASE_URL", "")
SUPABASE_KEY     = os.getenv("SUPABASE_SERVICE_ROLE_KEY", "")
EXCEL_PATH       = Path(os.getenv("EXCEL_PATH", "comprobantes.xlsx"))
DOWNLOADS_DIR    = Path(os.getenv("DOWNLOADS_DIR", "/tmp/whatsapp_adjuntos"))
POLL_INTERVAL    = int(os.getenv("POLL_INTERVAL_SEC", "5"))   # segundos entre lecturas
WHATSAPP_CHAT    = os.getenv("WHATSAPP_CHAT_NAME", "")        # nombre exacto del chat a monitorear

DOWNLOADS_DIR.mkdir(parents=True, exist_ok=True)
genai.configure(api_key=GEMINI_API_KEY)

# ── Prompt para Gemini ────────────────────────────────────────────────────────

EXTRACTION_PROMPT = """
Actúa como un experto contable argentino.
Analiza el comprobante de pago (imagen o PDF) adjunto y extrae exclusivamente:

1. monto          — Número decimal. Si hay moneda, ignorar el símbolo (ej: 15000.00).
2. emisor         — Nombre completo de quien realizó el pago (persona o empresa).
3. fecha          — Formato ISO 8601 YYYY-MM-DD. Si no hay año, asumir el año actual.
4. hora           — Formato HH:MM (24 h). Null si no aparece.
5. nro_transaccion — Código o número de operación tal como figura. Null si no aparece.
6. banco_origen   — Banco o billetera del emisor (ej: "Mercado Pago", "Banco Galicia"). Null si desconocido.
7. banco_destino  — Banco o billetera del receptor. Null si desconocido.
8. tipo           — "transferencia" | "deposito" | "qr" | "efectivo" | "otro".
9. confianza      — Tu nivel de certeza del 0 al 1 (ej: 0.95).

Responde ÚNICAMENTE con un objeto JSON válido, sin explicaciones ni markdown.
Ejemplo de respuesta esperada:
{
  "monto": 15000.00,
  "emisor": "María Rodríguez",
  "fecha": "2025-05-08",
  "hora": "14:32",
  "nro_transaccion": "0004523187",
  "banco_origen": "Mercado Pago",
  "banco_destino": "Banco Galicia",
  "tipo": "transferencia",
  "confianza": 0.97
}
""".strip()

# ── Gemini: extracción de datos ───────────────────────────────────────────────

def extraer_con_gemini(file_path: Path) -> dict:
    """Envía el archivo a Gemini 1.5 Flash y devuelve el JSON extraído."""
    mime_type, _ = mimetypes.guess_type(str(file_path))
    if mime_type is None:
        mime_type = "application/octet-stream"

    with open(file_path, "rb") as f:
        data = f.read()

    model = genai.GenerativeModel("gemini-1.5-flash")

    response = model.generate_content(
        [
            EXTRACTION_PROMPT,
            {"mime_type": mime_type, "data": base64.b64encode(data).decode()},
        ]
    )

    raw = response.text.strip()
    # Eliminar posibles bloques de código markdown que el modelo incluya
    raw = re.sub(r"^```(?:json)?\s*", "", raw)
    raw = re.sub(r"\s*```$", "", raw)

    return json.loads(raw)


# ── Excel: guardado de resultados ─────────────────────────────────────────────

HEADERS = [
    "timestamp_proceso", "archivo_origen", "emisor", "monto",
    "fecha", "hora", "nro_transaccion", "banco_origen", "banco_destino",
    "tipo", "confianza", "estado",
]

def guardar_en_excel(datos: dict, archivo_origen: str) -> None:
    if EXCEL_PATH.exists():
        wb = load_workbook(EXCEL_PATH)
        ws = wb.active
    else:
        wb = Workbook()
        ws = wb.active
        ws.title = "Comprobantes"
        ws.append(HEADERS)

    fila = [
        datetime.now().isoformat(timespec="seconds"),
        archivo_origen,
        datos.get("emisor"),
        datos.get("monto"),
        datos.get("fecha"),
        datos.get("hora"),
        datos.get("nro_transaccion"),
        datos.get("banco_origen"),
        datos.get("banco_destino"),
        datos.get("tipo"),
        datos.get("confianza"),
        "verificado" if (datos.get("confianza") or 0) >= 0.8 else "revisar",
    ]
    ws.append(fila)
    wb.save(EXCEL_PATH)
    print(f"  [Excel] Guardado en {EXCEL_PATH}")


# ── Supabase: persistencia opcional ───────────────────────────────────────────

def guardar_en_supabase(datos: dict, archivo_origen: str) -> None:
    if not SUPABASE_URL or not SUPABASE_KEY:
        return

    payload = {
        "archivo_origen":  archivo_origen,
        "emisor":          datos.get("emisor"),
        "monto":           datos.get("monto"),
        "fecha_pago":      datos.get("fecha"),
        "hora_pago":       datos.get("hora"),
        "nro_transaccion": datos.get("nro_transaccion"),
        "banco_origen":    datos.get("banco_origen"),
        "banco_destino":   datos.get("banco_destino"),
        "tipo":            datos.get("tipo"),
        "confianza_ia":    datos.get("confianza"),
        "estado":          "verificado" if (datos.get("confianza") or 0) >= 0.8 else "revisar",
        "raw_ia":          json.dumps(datos),
    }

    resp = requests.post(
        f"{SUPABASE_URL}/rest/v1/comprobantes_pago",
        headers={
            "apikey":        SUPABASE_KEY,
            "Authorization": f"Bearer {SUPABASE_KEY}",
            "Content-Type":  "application/json",
            "Prefer":        "return=minimal",
        },
        json=payload,
        timeout=10,
    )
    if resp.ok:
        print(f"  [Supabase] Registro insertado correctamente.")
    else:
        print(f"  [Supabase] Error {resp.status_code}: {resp.text[:200]}")


# ── Selenium: monitoreo de WhatsApp Web ───────────────────────────────────────

def build_driver() -> webdriver.Chrome:
    opts = Options()
    opts.add_argument("--no-sandbox")
    opts.add_argument("--disable-dev-shm-usage")
    opts.add_argument("--user-data-dir=/tmp/whatsapp_session")  # mantiene la sesión
    prefs = {
        "download.default_directory": str(DOWNLOADS_DIR),
        "download.prompt_for_download": False,
        "plugins.always_open_pdf_externally": True,
    }
    opts.add_experimental_option("prefs", prefs)
    driver = webdriver.Chrome(options=opts)
    driver.maximize_window()
    return driver


def esperar_whatsapp(driver: webdriver.Chrome) -> None:
    print("[WhatsApp] Esperando carga inicial (escanea el QR si es la primera vez)...")
    WebDriverWait(driver, 120).until(
        EC.presence_of_element_located((By.CSS_SELECTOR, '[data-testid="chat-list"]'))
    )
    print("[WhatsApp] Sesión activa.")


def abrir_chat_objetivo(driver: webdriver.Chrome) -> bool:
    """Abre el chat especificado en WHATSAPP_CHAT. Devuelve True si tuvo éxito."""
    if not WHATSAPP_CHAT:
        print("[WhatsApp] Sin chat objetivo — monitoreando chat activo.")
        return True

    try:
        search = driver.find_element(By.CSS_SELECTOR, '[data-testid="search"]')
        search.click()
        search.send_keys(WHATSAPP_CHAT)
        time.sleep(1.5)
        result = driver.find_element(
            By.XPATH, f'//span[@title="{WHATSAPP_CHAT}"]'
        )
        result.click()
        time.sleep(1)
        return True
    except Exception as exc:
        print(f"[WhatsApp] No se pudo abrir el chat '{WHATSAPP_CHAT}': {exc}")
        return False


def obtener_adjuntos_nuevos(driver: webdriver.Chrome, vistos: set) -> list[Path]:
    """
    Busca mensajes entrantes con imagen o documento que no hayamos procesado.
    Devuelve las rutas de los archivos descargados.
    """
    nuevos: list[Path] = []

    # Selector genérico: mensajes recibidos que contienen imagen o documento
    msgs_img = driver.find_elements(
        By.CSS_SELECTOR,
        'div[data-testid="msg-container"] img[src*="blob:"]'
    )
    msgs_doc = driver.find_elements(
        By.CSS_SELECTOR,
        'div[data-testid="document-thumb"]'
    )

    # ── Imágenes ──────────────────────────────────────────────────────────────
    for img in msgs_img:
        src = img.get_attribute("src")
        if src in vistos:
            continue
        vistos.add(src)

        try:
            # Descarga vía fetch en el contexto del navegador
            b64 = driver.execute_script("""
                const url = arguments[0];
                const resp = await fetch(url);
                const buf  = await resp.arrayBuffer();
                const arr  = Array.from(new Uint8Array(buf));
                return btoa(arr.map(b => String.fromCharCode(b)).join(''));
            """, src)

            ts   = datetime.now().strftime("%Y%m%d_%H%M%S_%f")
            dest = DOWNLOADS_DIR / f"img_{ts}.jpg"
            dest.write_bytes(base64.b64decode(b64))
            nuevos.append(dest)
            print(f"  [Captura] Imagen descargada: {dest.name}")
        except Exception as exc:
            print(f"  [Captura] Error al descargar imagen: {exc}")

    # ── Documentos (clic para descargar) ──────────────────────────────────────
    for doc in msgs_doc:
        msg_id = doc.get_attribute("data-id") or doc.id
        if msg_id in vistos:
            continue
        vistos.add(msg_id)

        try:
            btn = doc.find_element(By.CSS_SELECTOR, 'button[aria-label]')
            btn.click()
            time.sleep(3)  # esperar descarga automática
            # El archivo más reciente en DOWNLOADS_DIR
            archivos = sorted(DOWNLOADS_DIR.glob("*"), key=lambda p: p.stat().st_mtime)
            if archivos:
                nuevos.append(archivos[-1])
                print(f"  [Captura] Documento descargado: {archivos[-1].name}")
        except Exception as exc:
            print(f"  [Captura] Error al descargar documento: {exc}")

    return nuevos


# ── Loop principal ────────────────────────────────────────────────────────────

def main() -> None:
    print("=" * 60)
    print("  WhatsApp + Gemini — Procesador de Comprobantes")
    print("=" * 60)

    driver = build_driver()
    driver.get("https://web.whatsapp.com")

    esperar_whatsapp(driver)
    abrir_chat_objetivo(driver)

    vistos: set[str] = set()
    print(f"\n[Listener] Escuchando mensajes cada {POLL_INTERVAL}s. Ctrl+C para salir.\n")

    try:
        while True:
            adjuntos = obtener_adjuntos_nuevos(driver, vistos)

            for archivo in adjuntos:
                print(f"\n[Gemini] Procesando {archivo.name}…")
                try:
                    datos = extraer_con_gemini(archivo)
                    print(f"  Resultado: {json.dumps(datos, ensure_ascii=False, indent=2)}")
                    guardar_en_excel(datos, archivo.name)
                    guardar_en_supabase(datos, archivo.name)
                except json.JSONDecodeError as exc:
                    print(f"  [Error] Gemini devolvió JSON inválido: {exc}")
                except Exception as exc:
                    print(f"  [Error] {exc}")

            time.sleep(POLL_INTERVAL)

    except KeyboardInterrupt:
        print("\n[Listener] Detenido por el usuario.")
    finally:
        driver.quit()


if __name__ == "__main__":
    main()
