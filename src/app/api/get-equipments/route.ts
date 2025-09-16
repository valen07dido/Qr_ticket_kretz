// src/app/api/get-equipments/route.ts
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const { ODOO_URL, ODOO_DB, ODOO_USER_ID, ODOO_API_KEY } = process.env;

    if (!ODOO_URL || !ODOO_DB || !ODOO_USER_ID || !ODOO_API_KEY) {
      console.error("Error de servidor: Faltan variables de entorno de Odoo.");
      throw new Error("Configuración del servidor incompleta.");
    }

    const fields = ["id", "name", "category_id", "serial_no"];
    const domain = [["maintenance_team_id", "in", [5]]];

    const payload = {
      jsonrpc: "2.0",
      params: {
        method: "execute_kw",
        service: "object",
        args: [
          ODOO_DB,
          parseInt(ODOO_USER_ID),
          ODOO_API_KEY,
          "maintenance.equipment",
          "search_read",
          [domain],
          { fields: fields, limit: 500 },
        ],
      },
    };

    console.log("Enviando petición a Odoo para obtener equipos...");
    const odooResponse = await fetch(`${ODOO_URL}/jsonrpc`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!odooResponse.ok) {
      // Captura errores de red o HTTP (ej: 404, 503)
      throw new Error(`Error de red con Odoo: ${odooResponse.statusText}`);
    }

    const result = await odooResponse.json();

    if (result.error) {
      // Captura errores específicos devueltos por la API de Odoo
      console.error(
        "Error específico de Odoo (equipos):",
        JSON.stringify(result.error, null, 2)
      );
      const errorMessage =
        result.error.data?.message ||
        result.error.message ||
        "Error desconocido de Odoo.";
      throw new Error(errorMessage);
    }

    // Si llegamos aquí, todo fue exitoso
    console.log(`Éxito: Se obtuvieron ${result.result.length} equipos.`);
    return NextResponse.json(result.result || []); // Devolvemos el resultado o un array vacío por seguridad
  } catch (error) {
    // Este es el "atrapa-todo" final.
    const message =
      error instanceof Error ? error.message : "Un error inesperado ocurrió.";
    console.error("Error fatal en get-equipments:", message);

    // Siempre devolvemos una respuesta JSON válida con el status 500
    return NextResponse.json(
      { message: `Error interno del servidor: ${message}` },
      { status: 500 }
    );
  }
}
