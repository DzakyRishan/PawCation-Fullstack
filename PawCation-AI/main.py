from flask import Flask, request, jsonify
from flask_cors import CORS
import pandas as pd
import json
import io
from PIL import Image
from google import genai
from google.genai import types
import tensorflow as tf
import numpy as np

app = Flask(__name__)
CORS(app)

import os
from dotenv import load_dotenv
# Muat .env dari folder yang sama dengan file ini (anti-gagal walau dijalankan dari direktori lain)
_ENV_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), '.env')
load_dotenv(_ENV_PATH, override=True)
API_KEY = os.getenv('API_KEY')
if not API_KEY:
    print(f"⚠️  API_KEY kosong! Cek file: {_ENV_PATH}")
client = genai.Client(api_key=API_KEY)

# --- 1. MUAT OTAK AI KLASIFIKASI (TENSORFLOW) ---
print("Memuat otak AI Klasifikasi Ras Hewan...")
try:
    model_klasifikasi = tf.keras.models.load_model('model_ras_hewan_terbaik.h5')
    class_names = [
        'abyssinian', 'american shorthair', 'beagle', 'boxer', 'bulldog',
        'chihuahua', 'corgi', 'dachshund', 'german shepherd', 'golden retriever',
        'husky', 'labrador', 'maine coon', 'mumbai cat', 'persian cat',
        'pomeranian', 'pug', 'ragdoll cat', 'rottwiler', 'shiba inu',
        'siamese cat', 'sphynx', 'yorkshire terrier'
    ]
    print("✅ Otak AI Klasifikasi Siap!")
except Exception as e:
    print(f"❌ Error memuat model klasifikasi: {e}")

# --- 2. MUAT DATA MEDIS (GEMINI) ---
try:
    df = pd.read_csv('pet-health-symptoms-dataset.csv')
    konteks_medis = df.head(50).to_string()

    instruksi_sistem = f"""
    Kamu adalah PawBot, asisten virtual kesehatan hewan untuk layanan PawCation.
    Tugasmu memberikan informasi awal terkait gejala hewan peliharaan berdasarkan data medis ini:
    {konteks_medis}

    ATURAN PENTING:
    1. Jawab dalam Bahasa Indonesia yang ramah, berempati, SINGKAT, PADAT, dan JELAS (maksimal 3 paragraf).
    2. JANGAN PERNAH menampilkan angka indeks, nomor referensi, atau ID data.
    3. Berikan langkah pertolongan pertama secara singkat (1-2 poin).
    4. Tutup dengan SATU pesan pengingat singkat: sarankan pantau via CCTV realtime PawCation (jika dititipkan) atau bawa ke klinik.
    5. Jika ada foto yang dikirim, ANALISIS foto tersebut secara visual. Sebutkan apa yang kamu lihat dan kemungkinan kondisi/penyakit berdasarkan foto + data medis yang kamu punya.
    """
    print("✅ Otak AI Medis (Gemini) siap! Menunggu pesan dari website...")
except Exception as e:
    print(f"❌ Error memuat data medis: {e}")


@app.route('/chat', methods=['POST'])
def tanya_pawbot():
    try:
        # Ambil data dari form
        pertanyaan_user = request.form.get('pesan', '')
        is_first = request.form.get('is_first', 'true').lower() == 'true'
        riwayat_raw = request.form.get('riwayat', '[]')
        riwayat_obrolan = json.loads(riwayat_raw)

        # Cek apakah ada foto yang dikirim
        foto_file = request.files.get('foto')
        ada_foto = foto_file is not None

        if not pertanyaan_user and not ada_foto:
            return jsonify({"error": "Pesan atau foto tidak boleh kosong"}), 400

        # Susun riwayat obrolan
        teks_riwayat = ""
        for obrolan in riwayat_obrolan:
            teks_riwayat += f"{obrolan['pengirim']}: {obrolan['teks']}\n"

        # Aturan sapaan
        if is_first:
            aturan_sapaan = "Ini chat PERTAMA. Ucapkan salam pembuka (misal: 'Halo! Saya PawBot...')."
        else:
            aturan_sapaan = "Ini chat LANJUTAN. DILARANG KERAS mengucapkan salam pembuka. Langsung to-the-point!"

        info_ras_tambahan = ""
        image_bytes = None
        mime_type = 'image/jpeg'

        # --- JIKA ADA FOTO: PREDIKSI DULU PAKAI TENSORFLOW ---
        if ada_foto:
            image_bytes = foto_file.read()
            mime_type = foto_file.content_type or 'image/jpeg'

            try:
                # Buka gambar di memori dan proses untuk model TensorFlow
                img = Image.open(io.BytesIO(image_bytes))
                if img.mode != 'RGB':
                    img = img.convert('RGB')
                img = img.resize((224, 224))
                img_array = np.array(img)
                img_array = tf.expand_dims(img_array, 0)

                # Prediksi Ras
                predictions = model_klasifikasi.predict(img_array)
                persentase = np.max(predictions[0]) * 100
                indeks = np.argmax(predictions[0])
                ras_tebakan = class_names[indeks].upper()

                # Tambahkan instruksi rahasia ke Gemini
                info_ras_tambahan = f"\n[INFO SISTEM KLASIFIKASI INTERNAL]: Beritahu user di awal jawaban bahwa sistem mendeteksi ras hewan ini sebagai **{ras_tebakan}** (Keyakinan: {persentase:.2f}%)."
            except Exception as e:
                print(f"Error saat klasifikasi ras: {e}")

        # Susun prompt untuk Gemini
        if ada_foto and not pertanyaan_user:
            konteks_user = "User mengirimkan foto hewan peliharaannya tanpa teks tambahan. Tolong analisis foto ini."
        elif ada_foto and pertanyaan_user:
            konteks_user = f"User: {pertanyaan_user} (disertai foto hewan peliharaan)"
        else:
            konteks_user = f"User: {pertanyaan_user}"

        prompt_lengkap = f"""
        {instruksi_sistem}

        Aturan Sapaan: {aturan_sapaan}
        {info_ras_tambahan}

        [RIWAYAT OBROLAN SEBELUMNYA]
        {teks_riwayat}

        [PERTANYAAN/INPUT BARU DARI USER]
        {konteks_user}
        """

        # Kirim ke Gemini
        if ada_foto:
            response = client.models.generate_content(
                model='gemini-flash-lite-latest',
                contents=[
                    types.Content(
                        role="user",
                        parts=[
                            types.Part(text=prompt_lengkap),
                            types.Part(
                                inline_data=types.Blob(
                                    mime_type=mime_type,
                                    data=image_bytes
                                )
                            )
                        ]
                    )
                ]
            )
        else:
            response = client.models.generate_content(
                model='gemini-flash-lite-latest',
                contents=prompt_lengkap
            )

        return jsonify({"jawaban": response.text})

    except Exception as e:
        print(f"❌ Error pada server: {e}")
        return jsonify({"error": str(e)}), 500


if __name__ == '__main__':
    app.run(debug=True, port=5000)