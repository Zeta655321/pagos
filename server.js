require("dotenv").config();
const express = require("express");
const mercadopago = require("mercadopago");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 3000;

// Verificar si el ACCESS_TOKEN está presente
if (!process.env.ACCESS_TOKEN) {
    console.error("ACCESS_TOKEN de Mercado Pago no configurado.");
    process.exit(1); // Salir si no está configurado el token
}

// Configurar Mercado Pago
const client = new mercadopago.MercadoPagoConfig({
    accessToken: process.env.ACCESS_TOKEN
});

// Middleware para parsear JSON y habilitar CORS
app.use(express.json());
app.use(cors());

// Ruta para crear una preferencia de pago
app.post("/crear-preferencia", async (req, res) => {
    try {
        const { items } = req.body;

        const preference = {
            items: items.map(item => ({
                title: item.nombre,
                unit_price: parseFloat(item.precio),
                quantity: 1,
                currency_id: "ARS"
            })),
            back_urls: {
                success: "https://pagos-u8dl.onrender.com/redirigir",
                failure: "https://pagos-u8dl.onrender.com/redirigir",
                pending: "https://pagos-u8dl.onrender.com/redirigir"
            },
            auto_return: "approved"
        };

        const preferenceClient = new mercadopago.Preference(client);
        const response = await preferenceClient.create({ body: preference });

        res.json({ id: response.id });

    } catch (error) {
        console.error("Error al crear la preferencia:", error);
        res.status(500).json({ error: "Error al procesar el pago" });
    }
});

// Ruta para recibir notificaciones de pago
app.post("/notificacion", (req, res) => {
    console.log("Notificación recibida:", req.body);
    res.sendStatus(200);
});

// Ruta de redirección post-pago
app.get("/redirigir", (req, res) => {
    res.redirect("https://sites.google.com/view/bienestarbiencr/tiendatest");
});

// Iniciar el servidor
app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
