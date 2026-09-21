# GlassClip

GlassClip ist ein erster testbarer Prototyp eines Clipboard-Managers im Liquid-Glass-Stil.

## In VS Code starten

Voraussetzung: Node.js 20.19+.

1. Öffne den Projektordner in VS Code.
2. Öffne das Terminal.
3. Führe npm install aus.
4. Führe npm run dev aus.
5. Öffne die angezeigte lokale Adresse im Browser.

## Funktionen

- Clipboard über die Browser-Clipboard-API einlesen
- Clipboard-Einträge lokal in localStorage speichern
- Suche
- Kategorien: Kurz, Text, Links
- Favoriten
- Kopieren und Löschen
- maximal 100 Einträge
- PWA-Manifest und einfacher Offline-Service-Worker
- Liquid-Glass-Oberfläche für Desktop und Handy

## Wichtig für die spätere iPhone-App

Das ist bewusst die erste testbare Version für VS Code. Eine Browser/PWA darf auf iOS nicht wie eine native App dauerhaft jede Clipboard-Änderung im Hintergrund überwachen. Für die echte iOS-Version bauen wir später eine native Clipboard-Schicht und die passende App-Struktur.
