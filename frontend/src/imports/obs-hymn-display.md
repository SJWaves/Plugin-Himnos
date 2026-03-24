Necesito desarrollar una **herramienta o plugin para OBS Studio** que permita mostrar la **letra de himnos** en pantalla durante una transmisión, funcionando de manera similar a **subtítulos**.

La herramienta estará pensada para mostrar himnos del himnario **“Celebremos Su Gloria”** y también del **“Suplementario”**.

---

# Objetivo

Mostrar la letra de los himnos en la parte inferior de la pantalla durante la transmisión, permitiendo avanzar **párrafo por párrafo o línea por línea**, de forma manual.

Debe ser una herramienta **muy fácil de usar**, pensada para personas que operan OBS durante un culto o evento.

---

# Integración con OBS

La herramienta debe funcionar de manera similar a otros plugins como los de **Biblia para OBS**, usando dos partes:

### 1. Fuente dentro de la escena (Browser Source)

OBS cargará una **página web mediante un link** o archivo local.

Ruta típica en OBS:

Fuentes → Agregar → **Browser Source** → pegar el link.

Esa página será la que muestre el texto del himno en pantalla como **subtítulos**.

El texto debe poder:

* colocarse en la parte inferior
* cambiar tamaño
* tener estilo elegante
* adaptarse a la escena.

---

### 2. Panel de control (Dock dentro de OBS)

También debe existir una **interfaz de control**, que se pueda abrir como:

**OBS → Docks → Custom Browser Dock**

Ese panel permitirá controlar:

* qué himno se muestra
* qué párrafo se muestra
* ajustes visuales.

---

# Diseño de interfaz

La interfaz debe ser:

* **Minimalista**
* **Elegante**
* **Muy clara para usuarios no técnicos**

### Colores

Usar una paleta simple:

* **Blanco**
* **Dorado**
* **Negro**

Estilo tipo:

* iglesias
* presentaciones elegantes
* lectura clara en transmisión.

---

# Sistema de selección de himnos

Debe haber un sistema organizado para evitar tener todos los himnos desordenados.

### Paso 1: Seleccionar himnario

Primero el usuario debe poder elegir entre:

* **Celebremos Su Gloria**
* **Suplementario**

Esto puede ser un **selector desplegable**.

---

### Paso 2: Búsqueda rápida

Debe existir un campo de búsqueda donde el usuario pueda:

* escribir **el número del himno**
* escribir **parte del título**

Al escribir, deben aparecer **resultados debajo automáticamente**.

Ejemplo:

Buscar:

```
3
```

Resultados:

```
3 - Castillo Fuerte es Nuestro Dios
30 - Cristo Vive
```

O

Buscar:

```
gracia
```

Resultados:

```
45 - Sublime Gracia
112 - Gracia Admirable
```

El usuario **solo hace clic en el resultado** para seleccionarlo.

---

# Ventana de control del himno

Cuando se selecciona un himno, debe abrirse una sección donde se vea:

* número
* nombre
* letra dividida por **párrafos o estrofas**

Ejemplo:

```
Himno 45
Sublime Gracia
```

Y debajo:

```
[Mostrar]

1. Sublime gracia del Señor
   que a un infeliz salvó

2. Fui ciego mas hoy miro yo
   perdido y Él me halló
```

Cada párrafo debe tener un botón para:

**Mostrar ese párrafo en pantalla**

De esta forma el operador puede **avanzar manualmente** durante el canto.

---

# Paneles o ventanas dentro del control

La interfaz debe tener **secciones claras**:

### 1. Ventana de búsqueda

Para:

* elegir himnario
* buscar himno
* seleccionar himno.

---

### 2. Ventana de himno activo

Para:

* ver la letra
* seleccionar párrafos
* avanzar estrofas.

---

### 3. Ventana de configuración visual

Para ajustar:

* tamaño de letra
* tipo de fuente
* color
* posición
* fondo o sombra
* estilo visual del subtítulo.

---

# Estructura de datos

Los himnos se almacenarán en un archivo **YAML** para facilitar la edición.

Ejemplo:

```yaml
himnarios:
  celebremos_su_gloria:
    - numero: 1
      nombre: "Santo, Santo, Santo"
      letra:
        - "Santo, santo, santo, Señor omnipotente"
        - "Siempre el labio mío loores te dará"
        - "Santo, santo, santo, te adoro reverente"
        - "Dios en tres personas, bendita Trinidad"

  suplementario:
    - numero: 1
      nombre: "Cristo Vive"
      letra:
        - "Cristo vive hoy"
        - "Aleluya vive hoy"
```

---

# Resultado esperado

Una herramienta que permita:

* buscar himnos **rápidamente**
* seleccionarlos con **un clic**
* mostrar **párrafos específicos**
* controlar todo desde **un panel simple**
* mostrar el texto en OBS como **subtítulos elegantes**.

El sistema debe ser **rápido, ordenado y fácil para operadores de iglesia**.
