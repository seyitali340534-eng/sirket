# Nakliye Web Uygulaması (Ücretsiz)

Bu proje; müşteri talep formu, yönetici paneli, araç atama ve WhatsApp/E-posta ile bilgilendirme iş akışını **tamamen ücretsiz** çözen statik bir web uygulamasıdır.

## Özellikler
- Müşteri formu (detaylı alanlar, Firestore'a kayıt)
- Yönetici girişi (Firebase Auth – e-posta/şifre)
- Talep listesi, durum yönetimi (pending → approved → done)
- Araç atama (15 araçlık örnek filo; `vehicles.json`)
- Otomatik araç öneri (ağırlık/hacme göre en uygun)
- WhatsApp "click-to-chat" ve `mailto:` ile anında bilgilendirme (ücretsiz)

## Ücretsiz Bileşenler
- **Barındırma:** GitHub Pages (ya da dilediğiniz statik hosting)
- **Veritabanı & Kimlik Doğrulama:** Firebase (Spark – ücretsiz kota)
- **Bildirim:** WhatsApp click-to-chat ve `mailto:` (müşteri cihazında açılır)

> Not: Tam otomatik WhatsApp/e-posta gönderimi için ücretli API gerekir. Bu projede **tamamen ücretsiz** kalmak adına sohbet/e-posta penceresini hazır metinle açıyoruz.

---

## Kurulum Adımları (10 Dakika)

1) **Firebase Projesi Aç**
- https://console.firebase.google.com
- Yeni proje → Firestore Database (test mode) → Authentication (Email/Password açık)

2) **Web Uygulaması Ekle ve Config'i Al**
- Build → Authentication → Sign-in method: Email/Password **Enabled**
- Project settings → Your apps → Web app → Config objesini kopyala.

3) **Config'i Doldur**
- `assets/app.js` içindeki `firebaseConfig` alanını kendi değerlerinle değiştir:

```js
const firebaseConfig = {
  apiKey: "xxx",
  authDomain: "xxx.firebaseapp.com",
  projectId: "xxx",
  storageBucket: "xxx.appspot.com",
  messagingSenderId: "xxx",
  appId: "xxx"
};
```

4) **Güvenlik Kuralları (Önerilen Basit Başlangıç)**
- Firestore Rules (Development için):
```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /requests/{docId} {
      allow read, write: if true; // Demo için açık — canlıda sıkılaştırın
    }
  }
}
```
> Canlıya alırken `requests` için sadece eklemeye izin verip okumayı engellemek, `admin` kullanıcılara özel kurallar yazmak önerilir.

5) **Yayınlama (GitHub Pages)**
- Bu klasörü bir GitHub repo olarak yükleyin.
- Settings → Pages → Branch: `main` / root seçin.
- Adres: `https://kullaniciadi.github.io/repo-adi/`

6) **İlk Admin Girişi**
- `admin.html` sayfasına gidin.
- E-posta ve şifre ile giriş yapın.
- Eğer kullanıcı yoksa **ilk girişte otomatik oluşturulur** (kolay başlangıç).

## Kullanım
- Müşteri: `index.html` → formu doldurur → kayıt Firestore'a düşer.
- Admin: `admin.html` → talebi seçer → araç atar → **WhatsApp'ta Aç** / **E-posta Gönder**.

## Düzenleme
- Filo: `vehicles.json` dosyası.
- Tasarım: `assets/styles.css`
- İş mantığı: `assets/*.js`

## Notlar
- Telefon formatı için mümkünse uluslararası (örn. `+905xxxxxxxxx`) alın.
- `formatPhoneForWa` basit düzeltme yapar; ülke kodu içermesi önerilir.
- Firestore kotaları ücretsiz planda yeterlidir (günlük limitlere dikkat).

---

**Hazırlayan:** Timeon Logistics • Demo scaffold