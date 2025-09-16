// src/app/api/get-employees/route.ts
import { NextResponse } from "next/server";

export async function GET() {
  const { ODOO_URL, ODOO_DB, ODOO_USER_ID, ODOO_API_KEY } = process.env;

  if (!ODOO_URL || !ODOO_DB || !ODOO_USER_ID || !ODOO_API_KEY) {
    return NextResponse.json(
      { message: "Error de configuración del servidor." },
      { status: 500 }
    );
  }

  const payload = {
    jsonrpc: "2.0",
    method: "call",
    params: {
      service: "object",
      method: "execute_kw",
      args: [
        ODOO_DB,
        parseInt(ODOO_USER_ID),
        ODOO_API_KEY,
        "res.partner",
        "search_read",
        [[["employee_ids", "!=", false]]],
        {
          fields: ["id", "name"],
          limit: 150,
        },
      ],
    },
    id: null,
  };

  try {
    const response = await fetch(`${ODOO_URL}/jsonrpc`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const result = await response.json();

    if (result.error) {
      throw new Error(result.error.data?.message || "Error en Odoo");
    }

    return NextResponse.json(result.result);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Error desconocido";
    return NextResponse.json(
      { message: `Error al obtener empleados: ${message}` },
      { status: 500 }
    );
  }
}
