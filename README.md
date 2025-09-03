# Book Discovery & Review Platform

Plataforma para descubrir libros y dejar reseñas. Construida con *Next.js*, TypeScript y React, con soporte de reseñas persistentes en localStorage.

---

## URL de la aplicación desplegada

books-review-pi.vercel.app

---

## Deploy local

Para correr la aplicación localmente:

1. Clonar el repositorio:

```bash
git clone [https://github.com/tu-usuario/tu-repo.git](https://github.com/nuria8824/books-review)
cd books-review
```
---

Instalar dependencias:

npm install

Ejecutar en modo desarrollo:

npm run dev

---

## Tests Unitarios

Se utilizan Vitest y React Testing Library.

Para ejecutar los tests:

npm run test


Para ejecutar con reporte de cobertura:

npm run test -- --coverage

### Docker
Construir imagen localmente
docker build -t book-app:latest .

Ejecutar contenedor
docker run -p 3000:3000 book-app:latest


La aplicación estará disponible en http://localhost:3000.

## GitHub Actions
### 1. Build en Pull Requests

Archivo: .github/workflows/build.yml

Se ejecuta automáticamente en cada Pull Request a main.

Instala dependencias y realiza el build de Next.js.

Falla el PR si el build falla.

### 2. Tests en Pull Requests

Archivo: .github/workflows/test.yml

Se ejecuta automáticamente en cada Pull Request a main.

Corre todos los tests unitarios con Vitest.

Falla el PR si algún test falla.

### 3. Docker Container

Archivo: .github/workflows/docker.yml

Se ejecuta en cada push a main.

Construye una imagen Docker de la aplicación.

Publica la imagen en GitHub Container Registry (ghcr.io).

Etiqueta la imagen como latest y con el hash del commit.

La app correrá en http://localhost:3000.
