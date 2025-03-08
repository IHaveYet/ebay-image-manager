# eBay Image Manager

Aplikacja do zarządzania zdjęciami aukcji eBay z nowoczesnym interfejsem w trybie ciemnym.

## Funkcje

- Przesyłanie zdjęć do aukcji eBay
- Automatyczne generowanie linków HTTPS do zdjęć
- Organizacja zdjęć według ID aukcji
- Podgląd zdjęć przed wysłaniem
- Kopiowanie linków i tagów HTML
- Interfejs w trybie ciemnym
- Responsywny design

## Wymagania

- Node.js 18+
- Docker
- Dostęp do serwera HTTPS dla hostowania zdjęć

## Instalacja

1. Sklonuj repozytorium:
```bash
git clone https://github.com/IHaveYet/ebay-image-manager.git
cd ebay-image-manager
```

2. Zainstaluj zależności:
```bash
npm install
```

3. Uruchom aplikację:
```bash
npm start
```

Aplikacja będzie dostępna pod adresem `http://localhost:4003`

## Konfiguracja Docker

1. Zbuduj obraz:
```bash
docker build -t ebay-image-manager .
```

2. Uruchom kontener:
```bash
docker run -p 4003:4003 -v $(pwd)/images:/app/images ebay-image-manager
```

## Użycie

1. Wprowadź ID aukcji eBay
2. Wybierz numer zdjęcia (1-12)
3. Przeciągnij lub wybierz zdjęcie
4. Kliknij "Dodaj zdjęcie"
5. Skopiuj wygenerowany link lub tag HTML

## Licencja

MIT