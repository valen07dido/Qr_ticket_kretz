// src/app/api/crear-ticket/route.ts

import { NextResponse, NextRequest } from "next/server";

const ID_EQUIPO_INFRAESTRUCTURA = 6;
const TICKET_TYPE_IDS = { falla: 19, mejora: 20, consulta: 21 };

// --- CORRECCIÓN (1/2): Definimos una interfaz para el objeto ticket ---
// Esto define la "forma" que deben tener los datos del ticket, eliminando la necesidad de 'any'.
interface TicketData {
  name: string;
  description: string;
  team_id: number;
  partner_id: number;
  priority: string;
  ticket_type_id: number;
  user_id: 174;
}

export async function POST(request: NextRequest) {
  const { ODOO_URL, ODOO_DB, ODOO_USER_ID, ODOO_API_KEY } = process.env;

  try {
    const formData = await request.formData();

    const title = formData.get("title") as string | null;
    const description = formData.get("description") as string | null;
    const priority = formData.get("priority") as string | null;
    const tipo_ticket = formData.get("tipo_ticket") as
      | keyof typeof TICKET_TYPE_IDS
      | null;
    const partner_id = formData.get("partner_id") as string | null;
    const equipo_id = formData.get("equipo_id") as string | null;

    if (!title || !description || !priority || !tipo_ticket || !partner_id) {
      return NextResponse.json(
        { message: "Faltan datos requeridos." },
        { status: 400 }
      );
    }

    let equipmentName: string | null = null;
    if (equipo_id) {
      const equipmentPayload = {
        jsonrpc: "2.0",
        params: {
          service: "object",
          method: "execute_kw",
          args: [
            ODOO_DB,
            parseInt(ODOO_USER_ID!),
            ODOO_API_KEY,
            "maintenance.equipment",
            "read",
            [[parseInt(equipo_id)]],
            { fields: ["name"] },
          ],
        },
      };
      const equipmentResponse = await fetch(`${ODOO_URL}/jsonrpc`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(equipmentPayload),
      });
      const equipmentResult = await equipmentResponse.json();
      if (equipmentResult.result && equipmentResult.result.length > 0) {
        equipmentName = equipmentResult.result[0].name;
      }
    }

    // --- CORRECCIÓN (2/2): Usamos la interfaz 'TicketData' en lugar de '{ [key: string]: any }' ---
    const ticketData: TicketData = {
      name: title,
      description: description,
      team_id: ID_EQUIPO_INFRAESTRUCTURA,
      partner_id: parseInt(partner_id),
      priority: priority,
      ticket_type_id: TICKET_TYPE_IDS[tipo_ticket],
      user_id: 174, // Asignado a un usuario específico
    };

    // Modificamos la descripción de forma segura sin que TypeScript se queje
    if (equipmentName) {
      ticketData.description += `\n\n--- Información del Equipo ---\nNombre: ${equipmentName}\nID: ${equipo_id}`;
    } else if (equipo_id) {
      ticketData.description += `\n\n--- Información del Equipo ---\nID: ${equipo_id}`;
    }

    const createPayload = {
      jsonrpc: "2.0",
      params: {
        service: "object",
        method: "execute_kw",
        args: [
          ODOO_DB,
          parseInt(ODOO_USER_ID!),
          ODOO_API_KEY,
          "helpdesk.ticket",
          "create",
          [ticketData], // El objeto ticketData ya tiene el tipo correcto
        ],
      },
    };
    const createResponse = await fetch(`${ODOO_URL}/jsonrpc`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(createPayload),
    });
    const createResult = await createResponse.json();

    if (createResult.error) throw new Error(createResult.error.data?.message);
    const newTicketId = createResult.result;

    const readPayload = {
      jsonrpc: "2.0",
      params: {
        service: "object",
        method: "execute_kw",
        args: [
          ODOO_DB,
          parseInt(ODOO_USER_ID!),
          ODOO_API_KEY,
          "helpdesk.ticket",
          "read",
          [[newTicketId]],
          { fields: ["display_name"] },
        ],
      },
    };
    const readResponse = await fetch(`${ODOO_URL}/jsonrpc`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(readPayload),
    });
    const readResult = await readResponse.json();

    if (readResult.error) throw new Error(readResult.error.data?.message);
    const visibleTicketNumber = readResult.result[0].display_name;

    return NextResponse.json({
      message: "Ticket creado con éxito",
      ticket_id: visibleTicketNumber,
    });
  } catch (error) {
    console.error("Error en la API de crear-ticket:", error);
    const message =
      error instanceof Error ? error.message : "Error desconocido";
    return NextResponse.json(
      { message: `Error del servidor: ${message}` },
      { status: 500 }
    );
  }
}
