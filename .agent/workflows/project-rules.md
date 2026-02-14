---
description: Project-wide rules for Caddy, server structure, and cross-project operations
---

# 🛡️ PROJE KURALLARI VE YASAKLAR

Bu kurallar tüm Eagle Engine projeleri için geçerlidir.

## ⛔ 1. CADDY YASAKLARI

1. **CADDY GLOBAL AYARLAR DOKUNULMAZ:** `/opt/apps/caddy/Caddyfile` içindeki global ayarları (TLS, ACME, log, admin) kesinlikle değiştirme.
2. **DİĞER SİTELERİN BLOKLARINA DOKUNMA:** Caddyfile'daki diğer uygulamalara ait domain bloklarını (CustomizerApp, SSActiveWear, vb.) kesinlikle düzenleme veya silme.
3. **SADECE EAGLE BLOKLARINA EKLEME YAP:** Yeni subdomain gerekiyorsa sadece Eagle projelerine ait yeni bloklar ekleyebilirsin. Mevcut blokların yapısını değiştirme.
4. **CADDY RELOAD DİKKATLİ YAPILMALI:** Caddyfile değişikliğinden sonra `caddy reload` çalıştırmadan önce `caddy validate` ile doğrulama yap.

## ⛔ 2. SUNUCU YAPISI YASAKLARI

1. **KAYNAK SINIRLARINI KALDIRMA:** `docker-compose.yml` dosyalarındaki `deploy.resources.limits` (CPU/RAM kısıtları) kesinlikle kaldırılmaz veya yükseltilmez.
2. **DİĞER UYGULAMALARA DOKUNMA:** `/opt/apps/custom/customizerapp/` ve `/opt/apps/custom/ssactivewear/` dizinlerine müdahale etme.
3. **HOST SEVİYESİNDE PM2 ÇALIŞTIRMA:** Sunucunun kendisinde PM2 süreci başlatma. Tüm servisler Docker container'ı içinde çalışmalıdır.
4. **LOKAL DB KULLANMA:** Sunucu üzerindeki yerel Docker PostgreSQL container'larını prod için kullanma. Prod datası Managed DB üzerindedir.
5. **DOCKER NETWORK:** `appnet` dış (external) ağını silme veya yeniden oluşturma.
6. **CONTAINER İSİMLERİ:** Container isimlerini değiştirme — Caddy reverse proxy bu isimlere bağımlıdır.

## ⛔ 3. PROJELER ARASI İŞLEM KURALLARI

1. **ANA KLASÖRLER ARASI İŞLEM YASAK:** `eagledtfsupply` ve `eagledtfprint` ve diğer ana klasörler arasında benden (kullanıcıdan) açık ve yazılı Türkçe izin almadan kesinlikle dosya kopyalama, taşıma veya silme yapma.
2. **SUPPLY-FIRST İLKESİ:** Tüm kod değişiklikleri önce `eagledtfsupply` projesinde yapılır. Onaylandıktan sonra sadece değişen dosyalar diğer projelere kopyalanır.
3. **HER PROJE KENDİ GIT REPO'SUNDAN:** Her proje kendi git repo'su üzerinden commit ve push yapılır. Çapraz git işlemi yapılmaz.
4. **PROJE-ÖZEL DOSYALARA DOKUNMA:** Kopyalama işlemlerinde şu dosyalar korunmalıdır:
   - `.git/` (farklı repo)
   - `.env` (farklı ortam değişkenleri)
   - `node_modules/` (rebuild gerekir)
   - `.shopify/` (farklı app config)
   - `shopify.app.toml` (farklı app config)
   - `docker-compose.yml` (farklı container config)
   - `.agent/` (farklı workflow'lar)
   - `.gemini/` (farklı AI config)
