# Mazen Chef Frontend

Projet vitrine responsive pour le restaurant Mazen Chef, restructuré en architecture frontend modulaire.

## Structure

```txt
.
├── index.html
├── menu.html
├── assets/
│   ├── css/
│   │   ├── main.css
│   │   ├── components.css
│   │   ├── responsive.css
│   │   └── menu.css
│   ├── js/
│   │   ├── app.js
│   │   ├── menu.js
│   │   ├── utils.js
│   │   ├── config/
│   │   └── components/
│   ├── images/
│   ├── videos/
│   └── fonts/
├── components/
│   ├── header.html
│   ├── footer.html
│   └── modal.html
├── manifest.json
└── sw.js
```

## Organisation

- `assets/css/main.css` : reset, variables, bases globales et utilitaires de section.
- `assets/css/components.css` : blocs visuels réutilisables de la page principale.
- `assets/css/responsive.css` : adaptations tablette et mobile.
- `assets/js/app.js` : point d'entrée de la page principale.
- `assets/js/components/` : logique UI isolée par responsabilité.
- `assets/js/config/app-config.js` : valeurs de configuration centralisées.
- `assets/js/utils.js` : helpers DOM et formatage.

## Lancer le projet

Le site est statique. Ouvrir `index.html` directement dans un navigateur suffit, ou servir le dossier avec un serveur statique local pour tester le service worker.
