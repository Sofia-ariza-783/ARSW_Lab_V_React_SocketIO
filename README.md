# 🎨 Canvas Colaborativo en Tiempo Real con React y Socket.IO

**Autor:** Sofía Nicolle Ariza Goenaga  
**Laboratorio:** 5 - React y Socket.IO

---

## 📋 Descripción

Aplicación web de canvas colaborativo en tiempo real que permite a múltiples usuarios dibujar simultáneamente sobre un lienzo compartido. Cada usuario inicia con un color aleatorio y puede personalizarlo mediante un selector de color integrado. La comunicación en tiempo real se gestiona a través de **Socket.IO**, con un backend desarrollado en **Java SpringBoot** que actúa como servidor de broadcast hacia todos los clientes conectados.

La interfaz de dibujo está construida con la librería **p5.js**, que proporciona herramientas de canvas interactivas y fluidas.

---

## 🗂️ Estructura del Proyecto

```
canvas-colaborativo/
├── frontend/               # Aplicación React + Vite
│   ├── src/
│   │   ├── App.jsx         # Componente principal con lógica de p5 y socket
│   │   └── App.css
│   ├── package.json
│   └── vite.config.js
└── backend/                # Servidor Java SpringBoot
    ├── src/
    │   └── main/java/edu/eci/arsw/canvas/
    │       ├── CanvasBroadcastServer.java
    │       └── models/
    │           └── DrawEvent.java
    └── pom.xml
```

---

## ⚙️ Requisitos Previos

### Frontend
- [Node.js](https://nodejs.org/) v18 o superior
- npm v9 o superior

### Backend
- [Java JDK 17](https://adoptium.net/) o superior
- [Apache Maven](https://maven.apache.org/) 3.8 o superior

---

## 🚀 Correr el Proyecto en Local

### 1. Backend — Java SpringBoot con Maven

Clona el repositorio y navega a la carpeta del backend:

```bash
cd backend
```

Compila y ejecuta el servidor con Maven:

```bash
mvn clean install
mvn spring-boot:run
```

El servidor Socket.IO quedará corriendo en:

```
http://localhost:9092
```

> **Nota:** El servidor acepta conexiones desde cualquier origen (`setOrigin("*")`), lo que permite el acceso desde el frontend en desarrollo local.

---

### 2. Frontend — React con Vite

Navega a la carpeta del frontend e instala las dependencias:

```bash
cd frontend
npm install
```

Inicia el servidor de desarrollo:

```bash
npm run dev
```

La aplicación estará disponible en:

```
http://localhost:5173
```

> **Importante:** Asegúrate de que el backend esté corriendo antes de iniciar el frontend. El cliente se conecta automáticamente a `http://localhost:9092`.

---

## 🔌 Configuración de Socket.IO

La comunicación en tiempo real entre el frontend y el backend se realiza mediante **Socket.IO**.

### Eventos definidos

| Evento           | Dirección            | Descripción                                                  |
|------------------|----------------------|--------------------------------------------------------------|
| `drawEvent`      | Cliente → Servidor   | Envía un evento de dibujo (línea o limpieza de canvas)       |
| `drawBroadcast`  | Servidor → Clientes  | Reenvía el evento a todos los demás clientes conectados      |

### Estructura del evento `drawEvent`

```json
{
  "type": "draw",
  "x1": 120,
  "y1": 340,
  "x2": 125,
  "y2": 345,
  "color": "rgba(255, 100, 50, 1)"
}
```

Para limpiar el canvas:

```json
{
  "type": "clear"
}
```

### Configuración del servidor (Java)

El servidor Socket.IO se configura en `CanvasBroadcastServer.java`:

```java
Configuration config = new Configuration();
config.setHostname("0.0.0.0");
config.setPort(9092);
config.setOrigin("*");
```

### Configuración del cliente (React)

La conexión al servidor se establece en `App.jsx`:

```javascript
socket.current = io('http://localhost:9092');
```

> Para producción o despliegue en AWS, reemplaza `localhost:9092` con la IP pública o el DNS de tu instancia EC2.

---

## ☁️ Despliegue en AWS

### Arquitectura

```
Internet
   │
   ▼
[EC2 Instance]
   ├── Puerto 80/443  →  Frontend (servido con Nginx o directamente)
   └── Puerto 9092    →  Backend Socket.IO (Java)
```

### Pasos de despliegue

#### 1. Crear una instancia EC2

1. Inicia sesión en [AWS Console](https://console.aws.amazon.com/).
2. Lanza una instancia EC2 con **Amazon Linux 2** o **Ubuntu 22.04**.
3. Selecciona el tipo de instancia (recomendado: `t2.micro` para pruebas).
4. Configura el **Security Group** para abrir los siguientes puertos de entrada:

   | Puerto | Protocolo | Propósito              |
      |--------|-----------|------------------------|
   | 22     | TCP       | SSH                    |
   | 80     | TCP       | HTTP (Frontend)        |
   | 9092   | TCP       | Socket.IO (Backend)    |

5. Genera o selecciona un par de claves `.pem` para acceso SSH.

---

#### 2. Preparar la instancia

Conéctate por SSH:

```bash
ssh -i "tu-clave.pem" ec2-user@<IP-PUBLICA-EC2>
```

Instala Java y Maven (Ubuntu):

```bash
sudo apt update
sudo apt install -y openjdk-17-jdk maven
```

Instala Node.js:

```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs
```

---

#### 3. Desplegar el Backend

Copia el proyecto al servidor (desde tu máquina local):

```bash
scp -i "tu-clave.pem" -r backend/ ec2-user@<IP-PUBLICA-EC2>:~/canvas-backend
```

En la instancia EC2, compila y ejecuta:

```bash
cd ~/canvas-backend
mvn clean install
mvn spring-boot:run &
```

> Usa `nohup mvn spring-boot:run &` para mantener el proceso corriendo después de cerrar la sesión SSH.

---

#### 4. Desplegar el Frontend

Actualiza la URL del socket en `App.jsx` con la IP pública de tu instancia:

```javascript
socket.current = io('http://<IP-PUBLICA-EC2>:9092');
```

Construye el frontend para producción:

```bash
cd frontend
npm install
npm run build
```

Esto genera la carpeta `dist/` con los archivos estáticos listos para servir.

Copia los archivos al servidor:

```bash
scp -i "tu-clave.pem" -r dist/ ec2-user@<IP-PUBLICA-EC2>:~/canvas-frontend
```

Instala y configura **Nginx** para servir el frontend:

```bash
sudo apt install -y nginx
sudo cp -r ~/canvas-frontend/* /var/www/html/
sudo systemctl start nginx
sudo systemctl enable nginx
```

---

#### 5. Verificar el despliegue

- **Frontend:** Abre `http://<IP-PUBLICA-EC2>` en el navegador.
- **Backend:** Verifica que el puerto 9092 esté activo:

```bash
curl http://<IP-PUBLICA-EC2>:9092/socket.io/
```

---

## 🛠️ Tecnologías Utilizadas

| Capa      | Tecnología                          |
|-----------|-------------------------------------|
| Frontend  | React, Vite, JavaScript             |
| Dibujo    | p5.js                               |
| Sockets   | Socket.IO (cliente JS + servidor Java) |
| Backend   | Java, SpringBoot, Netty Socket.IO   |
| Despliegue| AWS EC2, Nginx                      |

---

## 🐛 Solución de Problemas Comunes

**El frontend no se conecta al backend**
- Verifica que el backend esté corriendo en el puerto `9092`.
- Comprueba que el Security Group de EC2 permita tráfico en ese puerto.
- Asegúrate de que la URL en `App.jsx` apunte a la IP correcta.

**El canvas no sincroniza entre usuarios**
- Abre la consola del navegador y verifica que no haya errores de conexión Socket.IO.
- Confirma que ambos usuarios están conectados al mismo servidor.

**Maven no compila el proyecto**
- Verifica que tienes Java 17+ instalado: `java -version`.
- Ejecuta `mvn clean` antes de `mvn install`.