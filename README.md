# Polla JCG 2026 ⚽

App de polla para 40 jugadores — predice marcadores de 17 partidos seleccionados del Mundial 2026.
Construida con React (sin compilador), Firebase Realtime Database, y publicada en GitHub Pages.

---

## Cómo funciona

| | |
|---|---|
| **Jugadores** | Ingresan su PIN de 3 caracteres → predicen marcadores de los partidos abiertos |
| **Puntos** | 1 pt resultado correcto (G/E/P) + 3 pts marcador exacto = máximo 4 pts por partido |
| **Cierre** | Cada partido se bloquea automáticamente a la hora del kickoff |
| **Tabla** | Oculta hasta que empiece el primer partido, luego en vivo |
| **Admin** | Panel con contraseña para ingresar resultados, gestionar PINs y ajustar configuración |

---

## Estructura de archivos

```
polla-jcg1/
├── index.html
├── README.md
├── css/
│   └── styles.css
└── js/
    ├── data.js             ← Lista de partidos, nombres de equipos, configuración
    ├── logic.js            ← isOpen(), scoreMatch(), calcScore()
    ├── setup.js            ← React, Firebase, temas, helpers de PIN
    ├── components.js       ← UI compartida: Btn, Card, MatchInputRow, etc.
    ├── nav.js              ← Barra de navegación
    ├── app.js              ← Componente raíz, estado, inicio de Firebase
    ├── view-home.js        ← Página de inicio
    ├── view-predict.js     ← Formulario de predicciones (PIN → marcadores)
    ├── view-leaderboard.js ← Tabla de clasificación
    └── view-admin.js       ← Panel de administración
```

---

## Paso 1 — Publicar en GitHub Pages

### 1.1 Subir los archivos al repositorio

1. Ve a [github.com/julimendeza/polla_jcg1](https://github.com/julimendeza/polla_jcg1)
2. Sube todos los archivos del zip manteniendo la estructura de carpetas:
   - Puedes arrastrar y soltar la carpeta completa en la interfaz web de GitHub
   - O usar Git desde la terminal: `git add . && git commit -m "initial" && git push`

### 1.2 Activar GitHub Pages

1. En el repositorio, ve a **Settings** (pestaña superior)
2. En el menú izquierdo, haz clic en **Pages**
3. En **Source**, selecciona **Deploy from a branch**
4. En **Branch**, selecciona `main` y la carpeta `/ (root)`
5. Haz clic en **Save**

Después de ~2 minutos, la app estará disponible en:
```
https://julimendeza.github.io/polla_jcg1
```

> GitHub Pages puede tardar hasta 5 minutos la primera vez. Si ves error 404, espera un poco y recarga.

---

## Paso 2 — Configurar Firebase

### 2.1 Crear la base de datos

1. Ve a [console.firebase.google.com](https://console.firebase.google.com)
2. Abre el proyecto **polla-jcg1**
3. En el menú izquierdo: **Compilación → Realtime Database**
4. Haz clic en **Crear base de datos**
5. Elige una región (cualquiera está bien) → selecciona **Iniciar en modo de prueba** → **Siguiente**

La URL ya está configurada en el código:
```
https://polla-jcg1-default-rtdb.firebaseio.com
```

### 2.2 Configurar las reglas de seguridad

1. En la base de datos, haz clic en la pestaña **Reglas**
2. Reemplaza todo el contenido con esto:

```json
{
  "rules": {
    ".read": true,
    ".write": true
  }
}
```

3. Haz clic en **Publicar**

> **¿Por qué reglas abiertas?** Esta app no usa autenticación de Firebase — la seguridad está en la contraseña del admin y el sistema de PINs. Para un grupo cerrado de 40 personas con un enlace privado, esto es suficiente.

---

## Paso 3 — Configuración inicial del admin

1. Abre la app en el navegador
2. Haz clic en **Admin** → ingresa la contraseña por defecto: `admin2026!`
3. Ve a **⚙️ Ajustes** y actualiza:
   - **Cuota por participante** (por defecto: 20,000)
   - **Moneda** (por defecto: COP)
   - **Contraseña admin** — ¡cámbiala antes de compartir el link!
4. Guarda los ajustes

---

## Paso 4 — Crear los PINs de los jugadores

1. En el admin, ve a la pestaña **🔑 PINs**
2. Tienes dos opciones:

**Opción A — Uno a uno** (recomendado para personalizar nombres):
- Escribe el PIN (3 caracteres, ej: `A7K`) y el nombre del jugador
- Haz clic en **Agregar**
- Repite para cada jugador

**Opción B — Automático**:
- Haz clic en **⚡ Generar 40 PINs automáticos**
- Genera 40 PINs con nombres genéricos ("Participante 1"... "Participante 40")
- Puedes editar los nombres directamente en la consola de Firebase si necesitas

3. Comparte cada PIN de forma privada con su jugador (WhatsApp, etc.)

---

## Antes del torneo — verificar los kickoffs

Los horarios en `js/data.js` son **aproximados en UTC**. Verifica cada partido antes de compartir el link — si el horario es incorrecto, las predicciones se bloquean a la hora equivocada.

La app muestra los horarios en hora Colombia **(UTC−5)** automáticamente.

Para corregir un kickoff, edita `js/data.js` en GitHub y cambia el campo `kickoff`:
```js
{ id:"m01", ..., kickoff:"2026-06-12T23:00:00Z" }
//                                   ↑ hora UTC
// Colombia = UTC-5, entonces 23:00 UTC = 18:00 COL
```

---

## Durante el torneo

- Cuando termina un partido: **Admin → ✅ Resultados** → ingresa el marcador → **Guardar resultados**
- La tabla se actualiza en tiempo real para todos los jugadores
- Los jugadores pueden seguir editando predicciones de partidos futuros en cualquier momento

---

## Agregar partidos de eliminatoria más adelante

Cuando se conozcan los cruces, agrega una línea en el array `MATCHES` de `js/data.js`:

```js
{ id:"ko01", num:18, phase:"Eliminatoria", home:"Colombia", away:"Brazil", kickoff:"2026-07-05T23:00:00Z" },
```

Sube el archivo a GitHub — listo. Las predicciones existentes no se ven afectadas.

---

## Datos almacenados en Firebase

| Clave | Contenido |
|---|---|
| `jcg_p` | Array de participantes `[{ id, name, pin, preds: { m01:{h,a}, ... } }]` |
| `jcg_r` | Resultados `{ m01:{h,a}, m02:{h,a}, ... }` |
| `jcg_s` | Configuración `{ adminPw, entryFee, currency, firebase, scoring }` |
| `jcg_pins` | Lista de PINs `[{ pin, name, used, usedAt, createdAt }]` |

---

## Temas visuales

Usa el botón en la barra de navegación para cambiar entre **🌙 Noche** (azul) y **🔥 Pasión** (naranja). La preferencia de cada usuario se guarda en su navegador.
