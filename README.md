# Horas Mágicas

**Horas Mágicas** es un pequeño proyecto web estático que combina HTML, CSS y JavaScript para crear una experiencia interactiva en el navegador. Está pensado como un ejemplo sencillo de página web con interactividad básica.

## Estructura del proyecto

- `index.html` – Página principal del sitio.
- `styles.css` – Hojas de estilo para el diseño visual.
- `script.js` – Lógica de JavaScript que añade comportamiento interactivo.

## Instalación y ejecución 🚀

1. Asegúrate de tener un navegador web moderno instalado (Chrome, Firefox, Edge, Safari, etc.).
2. Clona el repositorio o descarga los archivos en tu máquina:
   ```sh
   git clone https://github.com/rgarcial1983/horas-magicas.git
   ```
3. Abre `index.html` en tu navegador (doble clic o arrastra el archivo a la ventana del navegador).

> No se necesita servidor ni dependencias adicionales, todo corre de forma estática.

## Despliegue en GitHub Pages 🌐

1. Publica el repositorio en GitHub bajo tu cuenta (por ejemplo, ya debería estar en https://github.com/rgarcial1983/horas-magicas).
2. Ve a la configuración del repositorio → **Pages** y selecciona la rama `main` como fuente (carpeta `/` o `/docs` si usas otra).
3. Después de un par de minutos, tu sitio estará disponible en `https://<usuario>.github.io/horas-magicas/`.

La PWA y el service worker funcionarán directamente en la versión de GitHub Pages, permitiendo instalación y uso offline. Si usas un dominio personalizado, asegúrate de mantener las rutas relativas (el manifiesto usa `start_url: "."`).

## Uso ✨

Una vez abierta la página en el navegador, interactúa con los elementos para ver cómo funcionan los estilos y el JavaScript. El comportamiento específico depende del contenido implementado en `script.js`.

> 📱 La aplicación funciona como Progressive Web App (PWA). Puedes instalarla en tu tablet, móvil o escritorio desde el navegador y usarla sin conexión una vez cargada.



## Personalización y desarrollo 🛠️

- Edita `styles.css` para cambiar colores, tipografías o diseño.
- Modifica `script.js` para añadir nuevas funcionalidades o ajustar la lógica existente.
- Puedes alojar el proyecto en cualquier servidor web estático o un servicio como GitHub Pages.

## Contribuciones 🤝

¡Las contribuciones son bienvenidas! Si deseas mejorar el proyecto:

1. Haz un fork del repositorio.
2. Crea una rama con tu mejora (`git checkout -b mi-mejora`).
3. Commita tus cambios y empuja tu rama.
4. Abre un pull request describiendo tus cambios.

## Licencia 📄

Este proyecto está bajo la licencia MIT. Consulta el archivo `LICENSE` para más detalles (si existe).

---

Gracias por visitar Horas Mágicas. ¡Disfruta creando y experimentando! 😊