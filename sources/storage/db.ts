import { PrismaClient } from "@prisma/client";
import { PGlite } from "@electric-sql/pglite";
import { PrismaPGlite } from "pglite-prisma-adapter";
import * as fs from "fs";
import * as path from "path";

let pgliteInstance: PGlite | null = null;

type WebAssemblyModuleCtor = new (bytes: Buffer) => WebAssembly.Module;
type QueryRawResult = {
    rows?: unknown[][];
    columnTypes?: unknown[];
    [key: string]: unknown;
};
type DriverAdapter = {
    queryRaw?: (query: unknown) => Promise<QueryRawResult>;
    [key: string]: unknown;
};
type DriverAdapterFactory = {
    connect: () => Promise<DriverAdapter>;
    connectToShadowDb?: () => Promise<DriverAdapter>;
    [key: string]: unknown;
};

function getWebAssemblyModuleCtor(): WebAssemblyModuleCtor | null {
    const moduleCtor = (globalThis as { WebAssembly?: { Module?: unknown } }).WebAssembly?.Module;
    return typeof moduleCtor === "function"
        ? (moduleCtor as WebAssemblyModuleCtor)
        : null;
}

function findPGliteWasm(): { wasmModule: WebAssembly.Module; fsBundle: Blob } | null {
    const wasmModuleCtor = getWebAssemblyModuleCtor();
    if (!wasmModuleCtor) {
        return null;
    }
    const searchPaths = [
        process.cwd(),
        path.dirname(process.execPath),
    ];
    for (const dir of searchPaths) {
        const wasmPath = path.join(dir, "pglite.wasm");
        const dataPath = path.join(dir, "pglite.data");
        if (fs.existsSync(wasmPath) && fs.existsSync(dataPath)) {
            const wasmModule = new wasmModuleCtor(fs.readFileSync(wasmPath));
            const fsBundle = new Blob([fs.readFileSync(dataPath)]);
            return { wasmModule, fsBundle };
        }
    }
    return null;
}

function isByteObject(value: unknown): value is Record<string, number> {
    if (!value || typeof value !== "object" || Buffer.isBuffer(value) || value instanceof Uint8Array) {
        return false;
    }

    const entries = Object.entries(value as Record<string, unknown>);
    if (entries.length === 0) {
        return false;
    }

    const indexes = entries.map(([key]) => Number(key)).sort((a, b) => a - b);
    return entries.every(([key, byte]) => {
        const index = Number(key);
        return Number.isInteger(index)
            && index >= 0
            && String(index) === key
            && Number.isInteger(byte)
            && (byte as number) >= 0
            && (byte as number) <= 255;
    }) && indexes.every((index, pos) => index === pos);
}

function normalizePGliteBytes(value: unknown): unknown {
    if (Buffer.isBuffer(value)) {
        return [...value];
    }
    if (value instanceof Uint8Array) {
        return [...value];
    }
    if (isByteObject(value)) {
        return Object.entries(value)
            .sort(([a], [b]) => Number(a) - Number(b))
            .map(([, byte]) => byte);
    }
    return value;
}

function isBytesColumnType(columnType: unknown): boolean {
    return columnType === "bytes" || columnType === "Bytes" || columnType === 13;
}

function withPGliteByteNormalization(factory: DriverAdapterFactory): DriverAdapterFactory {
    async function wrapAdapter(adapter: DriverAdapter): Promise<DriverAdapter> {
        if (typeof adapter.queryRaw !== "function") {
            return adapter;
        }

        const queryRaw = adapter.queryRaw.bind(adapter);
        adapter.queryRaw = async (query: unknown) => {
            const result = await queryRaw(query);
            if (!Array.isArray(result.rows) || !Array.isArray(result.columnTypes)) {
                return result;
            }

            const bytesColumnIndexes = result.columnTypes
                .map((columnType, index) => isBytesColumnType(columnType) ? index : -1)
                .filter(index => index >= 0);
            if (bytesColumnIndexes.length === 0) {
                return result;
            }

            return {
                ...result,
                rows: result.rows.map(row => {
                    const nextRow = [...row];
                    for (const index of bytesColumnIndexes) {
                        nextRow[index] = normalizePGliteBytes(nextRow[index]);
                    }
                    return nextRow;
                })
            };
        };

        return adapter;
    }

    const connect = factory.connect.bind(factory);
    factory.connect = async () => wrapAdapter(await connect());

    if (typeof factory.connectToShadowDb === "function") {
        const connectToShadowDb = factory.connectToShadowDb.bind(factory);
        factory.connectToShadowDb = async () => wrapAdapter(await connectToShadowDb());
    }

    return factory;
}

function createClient(): PrismaClient {
    const provider = process.env.DB_PROVIDER || "postgres";

    if (provider === "pglite") {
        const pgliteDir = process.env.PGLITE_DIR || "./data/pglite";
        const wasmOpts = findPGliteWasm();
        if (wasmOpts) {
            pgliteInstance = new PGlite({ dataDir: pgliteDir, ...wasmOpts });
        } else {
            pgliteInstance = new PGlite(pgliteDir);
        }
        const adapter = withPGliteByteNormalization(new PrismaPGlite(pgliteInstance) as unknown as DriverAdapterFactory);
        return new PrismaClient({ adapter } as any);
    }

    return new PrismaClient();
}

export const db = createClient();

export function getPGlite(): PGlite | null {
    return pgliteInstance;
}
