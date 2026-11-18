// Servidor MCP de la tienda. Expone la API como herramientas para Claude Code.
// Necesita la API arrancada (npm run dev). Se conecta como el usuario de TIENDA_EMAIL.
// Se registra en Claude Code con: claude mcp add --scope project tienda -- node mcp/servidor.ts
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';

const API_URL = process.env.TIENDA_URL ?? 'http://localhost:3000';
const EMAIL = process.env.TIENDA_EMAIL ?? 'ana@tienda.test';
const PASSWORD = process.env.TIENDA_PASSWORD ?? 'ana-1234';

let token: string | null = null;

async function request(method: string, path: string, body?: unknown) {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) headers.Authorization = `Bearer ${token}`;
  const res = await fetch(`${API_URL}/api${path}`, {
    method,
    headers,
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  return { ok: res.ok, data: (await res.json()) as unknown };
}

async function login() {
  const res = await request('POST', '/auth/login', { email: EMAIL, password: PASSWORD });
  if (!res.ok) throw new Error(`No se pudo iniciar sesión como ${EMAIL}`);
  token = (res.data as { token: string }).token;
}

/** Llama a la API y devuelve el resultado como texto para Claude. */
async function call(method: string, path: string, body?: unknown) {
  try {
    if (!token) await login();
    const res = await request(method, path, body);
    return {
      content: [{ type: 'text' as const, text: JSON.stringify(res.data, null, 2) }],
      isError: !res.ok,
    };
  } catch (error) {
    const reason = error instanceof Error ? error.message : String(error);
    return {
      content: [
        {
          type: 'text' as const,
          text: `No se puede contactar con la API en ${API_URL} (${reason}). ¿Está arrancada con npm run dev?`,
        },
      ],
      isError: true,
    };
  }
}

const server = new McpServer({ name: 'tienda', version: '1.0.0' });

server.registerTool(
  'buscar_productos',
  {
    title: 'Buscar productos',
    description:
      'Busca en el catálogo de la tienda por texto en el nombre o por categoría. Devuelve id, nombre, ' +
      'categoría, precio en céntimos y stock.',
    inputSchema: {
      texto: z.string().optional().describe('Texto que debe aparecer en el nombre'),
      categoria: z.string().optional().describe('electronica, papeleria, hogar o libros'),
    },
    annotations: { readOnlyHint: true },
  },
  async ({ texto, categoria }) => {
    const res = await call('GET', '/products');
    if (res.isError) return res;
    const products = JSON.parse(res.content[0]!.text) as { name: string; category: string }[];
    const found = products.filter(
      (p) =>
        (!texto || p.name.toLowerCase().includes(texto.toLowerCase())) &&
        (!categoria || p.category === categoria),
    );
    return { content: [{ type: 'text', text: JSON.stringify(found, null, 2) }] };
  },
);

server.registerTool(
  'ver_carrito',
  {
    title: 'Ver el carrito',
    description: 'Devuelve el carrito del usuario conectado, con sus líneas y totales en céntimos.',
    annotations: { readOnlyHint: true },
  },
  () => call('GET', '/cart'),
);

server.registerTool(
  'mis_pedidos',
  {
    title: 'Mis pedidos',
    description: 'Lista los pedidos del usuario conectado, del más reciente al más antiguo.',
    annotations: { readOnlyHint: true },
  },
  () => call('GET', '/orders'),
);

server.registerTool(
  'ver_pedido',
  {
    title: 'Ver un pedido',
    description: 'Devuelve un pedido por su id, con sus líneas, totales y estado.',
    inputSchema: { id: z.number().int().positive() },
    annotations: { readOnlyHint: true },
  },
  ({ id }) => call('GET', `/orders/${id}`),
);

server.registerTool(
  'anadir_al_carrito',
  {
    title: 'Añadir al carrito',
    description: 'Añade unidades de un producto al carrito del usuario conectado.',
    inputSchema: {
      productId: z.number().int().positive(),
      quantity: z.number().int().min(1).max(99).default(1),
    },
  },
  ({ productId, quantity }) => call('POST', '/cart/items', { productId, quantity }),
);

server.registerTool(
  'hacer_pedido',
  {
    title: 'Hacer el pedido',
    description:
      'Crea un pedido con todo el contenido del carrito, descuenta el stock y vacía el carrito.',
    annotations: { destructiveHint: true },
  },
  () => call('POST', '/orders'),
);

await server.connect(new StdioServerTransport());
console.error(`Servidor MCP de la tienda listo (API: ${API_URL}, usuario: ${EMAIL})`);
