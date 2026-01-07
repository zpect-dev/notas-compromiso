# Notas Compromiso - Módulo Jurídico

## 📖 Visión General

Este proyecto es una aplicación web empresarial desarrollada en **Laravel 12** con **Inertia.js** y **React**, diseñada para la gestión de cobranza y seguimiento jurídico de clientes. Su función principal es permitir al departamento de cobranza y administradores gestionar carteras de clientes morosos, enviar casos a cobranza jurídica y recuperar deudas.

El sistema destaca por su arquitectura híbrida de bases de datos, conectándose simultáneamente a un sistema legacy en **SQL Server** (para lectura de facturación y clientes) y una base de datos local **MySQL** (para el seguimiento del estado jurídico y auditoría).

---

## 🛠 Stack Tecnológico

-   **Backend**: Laravel 12 (PHP 8.2+)
-   **Frontend**: React 19 + Inertia.js 2.0
-   **Estilos**: TailwindCSS 4.0 + Lucide React (Iconos)
-   **Base de Datos**:
    -   **SQL Server**: Fuente de verdad para Clientes, Facturas (Documentos), Vendedores y Segmentos.
    -   **MySQL**: Gestión de estados jurídicos, usuarios del sistema y auditoría de envíos.
-   **Build Tool**: Vite 7.0

---

## 🏛 Arquitectura de Datos

El sistema implementa una arquitectura de **Lectura Cruzada**:

1.  **Lectura en Tiempo Real (SQL Server)**:

    -   La información financiera (saldo, días de mora, facturas vencidas) se consulta en tiempo real desde el ERP legacy.
    -   Modelos: `Cliente`, `Documento` (Facturas), `Vendedor`, `Segmento`.
    -   Conexión: `sqlsrv`.

2.  **Persistencia de Estado (MySQL)**:
    -   Cuando un cliente es "enviado a jurídico", se crea un registro en MySQL.
    -   Se toma una "foto" (snapshot) del estado de las facturas en ese momento para congelar el "Saldo Inicial".
    -   Modelos: `JuridicoCliente`, `JuridicoFactura`, `JuridicoFacturaRecuperada`.
    -   Conexión: `mysql` (default).

---

## 🚀 Funcionalidades Principales

### 1. Tablero Principal de Cobranza (`/juridico`)

-   **Filtrado Inteligente de Clientes**:
    -   Clasificación automática basada en métricas financieras:
        -   🟣 **Pérdida Total**: Saldo > $2000 y Mora > 60 días.
        -   🔴 **Crítico**: Mora > 60 días.
        -   🟠 **Advertencia**: Mora entre 30-60 días.
        -   🔵 **Alto Valor**: Saldo > $2000 y Mora < 30 días.
        -   🟢 **Sano**: Resto de la cartera.
-   **Buscador Global**: Búsqueda por Código de Cliente, RIF o Nombre.
-   **Filtros de Admin**: Los administradores ven una cartera segmentada específica (excluyendo segmentos internos/inactivos) o pueden ver la lista completa.

### 2. Gestión de "Enviados a Jurídico"

-   **Acción de Envío**:
    -   Al enviar un cliente, el sistema registra el evento y congela las facturas pendientes.
    -   El cliente pasa a estar "En Jurídico" y es visible en la lista de Enviados.
-   **Vista de Enviados (`/juridico/enviados`)**:
    -   Lista exclusiva de clientes que han sido procesados.
    -   Permite a los administradores monitorear la cartera que ya está en manos legales.
    -   Sincronizada con `juridico_clientes` en MySQL pero enriquecida con datos en vivo de SQL Server.

### 3. Recuperación de Cartera (`/juridico/recuperadas`)

-   **Gestión de Facturas**:
    -   Dentro del detalle del cliente, se pueden marcar facturas individuales como "Recuperadas".
    -   Se registra el motivo/observación de la recuperación.
-   **Panel de Recuperadas**:
    -   Vista consolidada de todas las facturas que han sido recuperadas exitosamente.
    -   Muestra el "Saldo Inicial" (snapshot) vs "Saldo Actual" (vivo), permitiendo ver la efectividad de la cobranza.

### 4. Expediente Digital (`/juridico/{cliente}`)

-   **Detalle 360°**: Muestra información fiscal, vendedor asignado y métricas de deuda.
-   **Tabla de Facturas**: Listado de todas las facturas pendientes con semáforo de antigüedad.
-   **Historial de Pagos**: Últimos cobros realizados por el cliente.
-   **Gestión de Archivos**: Carga y visualización de soportes digitales (PDFs, imágenes) asociados al expediente.

---

## 🔌 API Endpoints Clave

| Método | Endpoint                 | Controlador                           | Descripción                                             |
| :----- | :----------------------- | :------------------------------------ | :------------------------------------------------------ |
| `GET`  | `/juridico`              | `JuridicoController@index`            | Lista principal con filtros y métricas calculadas.      |
| `POST` | `/juridico/enviar`       | `JuridicoController@enviar`           | Envía cliente a jurídico y guarda snapshot de facturas. |
| `GET`  | `/juridico/enviados`     | `JuridicoController@enviados`         | Lista de clientes ya gestionados.                       |
| `POST` | `/juridico/recuperar`    | `JuridicoController@marcarRecuperado` | Marca una factura específica como recuperada.           |
| `GET`  | `/juridico/recuperadas`  | `JuridicoController@recuperadas`      | Reporte de efectividad de cobranza.                     |
| `POST` | `/juridico/{id}/archivo` | `JuridicoController@subirArchivo`     | Sube documentos al expediente del cliente.              |

---

## 📦 Instalación y Despliegue

1.  **Requisitos**: PHP 8.2, SQL Server Driver, Composer, Node.js 20+.
2.  **Configuración**:
    -   Configurar `.env` con doble conexión (`DB_CONNECTION=mysql` y `DB_SQLSRV_...`).
3.  **Instalación**:
    ```bash
    composer install
    npm install
    php artisan migrate
    php artisan db:seed
    npm run build
    ```

---

> **Nota**: Este sistema es crítico para la operación financiera. Cualquier cambio en la lógica de clasificación de clientes (`PERDIDA_TOTAL`, `CRITICO`, etc.) debe ser validado con la gerencia de cobranza.
