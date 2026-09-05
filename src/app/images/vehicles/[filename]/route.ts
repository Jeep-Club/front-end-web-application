import fs from 'node:fs/promises';
import path from 'node:path';

export async function GET(
    _request: Request,
    props: { params: Promise<{ filename: string }> }
) {
    const { filename } = await props.params;
    const safeFilename = path.basename(filename);
    const filePath = path.join(process.cwd(), 'public', 'images', 'vehicles', safeFilename);

    try {
        const fileBuffer = await fs.readFile(filePath);
        const ext = path.extname(safeFilename).toLowerCase();
        const mimeTypes: Record<string, string> = {
            '.jpg': 'image/jpeg',
            '.jpeg': 'image/jpeg',
            '.png': 'image/png',
            '.webp': 'image/webp',
            '.gif': 'image/gif',
        };
        const contentType = mimeTypes[ext] || 'application/octet-stream';

        return new Response(fileBuffer, {
            headers: {
                'Content-Type': contentType,
                'Cache-Control': 'public, max-age=31536000, immutable',
            },
        });
    } catch {
        return new Response('Imagem não encontrada', { status: 404 });
    }
}
