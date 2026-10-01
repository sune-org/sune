# Android app

Sune for Android is a [Trusted Web Activity](https://developer.chrome.com/docs/android/trusted-web-activity) wrapper around https://sune.chat, built with [Bubblewrap](https://github.com/GoogleChromeLabs/bubblewrap). It contains no app code, only the config in `twa-manifest.json`.

| | New app | Legacy app (v0.x) |
|---|---|---|
| Package | `chat.sune` | `com.planetrenox.sune` |
| Host | `sune.chat` (also trusts `sune.planetrenox.com`) | `sune.planetrenox.com` |
| Signing cert SHA-256 | `09:85:1F:7B:BB:40:67:9C:F8:70:1C:7D:9F:65:72:77:78:0E:C0:58:CF:34:09:9A:97:D2:8A:74:FB:CE:87:2A` | `E8:7D:70:60:C2:7D:EF:CB:4D:4D:2B:E2:2E:5E:37:ED:F7:0B:1E:F5:77:D7:04:1F:6B:07:EC:B8:1D:78:6D:43` (**leaked**) |

Both are listed for both domains in [`public/.well-known/assetlinks.json`](../public/.well-known/assetlinks.json); that file is what makes Chrome hide the address bar. Remove the legacy entry once nobody uses the old app (a leaked key can sign a fake `com.planetrenox.sune` that Chrome would trust).

## Releasing

Actions → **Release APK** → Run workflow on `master` → enter the tag, e.g. `v1.0.0`.

It builds `sune-v1.0.0.apk`, signs it, checks the signing cert against `assetlinks.json`, attests build provenance, then creates the tag and release. `versionCode` is `major*10000 + minor*100 + patch`. Run it from any other branch to do a dry run: it builds and verifies but publishes nothing.

## Verifying a download

```bash
gh attestation verify sune-v1.0.0.apk --repo sune-org/sune
```

This proves the file was built by this repo's workflow at the commit named in the release, and not modified since. The APK is only a wrapper; the app itself is served live from sune.chat and is not covered by it.

## Signing key

Never in the repo (`*.jks` is gitignored). Repo secrets, read only by `.github/workflows/apk.yml`:

| Secret | What |
|---|---|
| `ANDROID_KEYSTORE_B64` | base64 of the PKCS12 keystore (RSA 4096, alias `sune`, valid to 2054) |
| `ANDROID_KEYSTORE_PASS` | keystore password (also used as the key password) |
| `ANDROID_KEY_ALIAS` | `sune` |

Losing this key means users can't update `chat.sune` and would have to uninstall and reinstall. Keep an offline copy.
