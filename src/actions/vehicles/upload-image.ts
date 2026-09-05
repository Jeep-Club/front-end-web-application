'use server';

import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';

/**
 * Salva uma imagem enviada pelo usuário no servidor Next.js
 * e retorna a URL relativa (ex: /images/vehicles/vehicle_1725489123_abc.jpg).
 *
 * Isso evita enviar strings Base64 gigantescas para o backend Spring Boot,
 * que possui restrição de tamanho (@Size(max = 255) / VARCHAR(255)).
 */
export async function uploadVehicleImageAction(data: FormData | string): Promise<string> {
    const uploadsDir = path.join(process.cwd(), 'public', 'images', 'vehicles');
    await fs.mkdir(uploadsDir, { recursive: true });

    if (typeof data === 'string') {
        // Se já for uma URL externa ou caminho relativo existente, retorna direto
        if (data.startsWith('http://') || data.startsWith('https://') || data.startsWith('/images/')) {
            return data;
        }

        // Se for data URL em Base64
        if (data.startsWith('data:image/')) {
            const matches = data.match(/^data:image\/([a-zA-Z0-9+]+);base64,(.+)$/);
            if (!matches) {
                throw new Error('Formato de imagem Base64 inválido');
            }

            const rawExt = matches[1].toLowerCase();
            const ext = rawExt === 'jpeg' ? '.jpg' : `.${rawExt}`;
            const base64Data = matches[2];
            const buffer = Buffer.from(base64Data, 'base64');

            const filename = `vehicle_${Date.now()}_${crypto.randomUUID().slice(0, 8)}${ext}`;
            const filePath = path.join(uploadsDir, filename);
            await fs.writeFile(filePath, buffer);

            return `/images/vehicles/${filename}`;
        }

        return data;
    }

    // Se for FormData
    const file = data.get('file');
    if (!file || !(file instanceof File)) {
        throw new Error('Nenhum arquivo de imagem encontrado');
    }

    if (!file.type.startsWith('image/')) {
        throw new Error('O arquivo selecionado não é uma imagem válida');
    }

    const extensionMap: Record<string, string> = {
        'image/jpeg': '.jpg',
        'image/jpg': '.jpg',
        'image/png': '.png',
        'image/webp': '.webp',
        'image/gif': '.gif',
    };

    const ext = extensionMap[file.type] || path.extname(file.name) || '.jpg';
    const filename = `vehicle_${Date.now()}_${crypto.randomUUID().slice(0, 8)}${ext}`;

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const filePath = path.join(uploadsDir, filename);
    await fs.writeFile(filePath, buffer);

    return `/images/vehicles/${filename}`;
}
