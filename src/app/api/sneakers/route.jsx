import { promises as fs } from 'fs';
import path from 'path';

const filePath = path.join(process.cwd(), 'public', 'sneaker.json'); // Store JSON in public/

// ✅ Handle API requests
export async function GET() {
    try {
        const data = await fs.readFile(filePath, 'utf8');
        const sneakers = JSON.parse(data);
        
        if (!sneakers || !Array.isArray(sneakers.sneakers)) {
            return new Response(
                JSON.stringify({ 
                    error: 'Invalid data format', 
                    sneakers: [] 
                }), 
                { status: 400 }
            );
        }

        return Response.json(sneakers);
    } catch (error) {
        console.error('Error loading sneakers:', error);
        return new Response(
            JSON.stringify({ 
                error: 'Failed to load data', 
                sneakers: [] 
            }), 
            { status: 500 }
        );
    }
}

export async function POST(req) {
    try {
        const newSneaker = await req.json();
        const data = await fs.readFile(filePath, 'utf8');
        const sneakers = JSON.parse(data);
        newSneaker.id = sneakers.sneakers.length + 1; // Auto-increment ID
        sneakers.sneakers.push(newSneaker);

        await fs.writeFile(filePath, JSON.stringify(sneakers, null, 4));
        return new Response(JSON.stringify(newSneaker), { status: 201 });
    } catch (error) {
        return new Response(JSON.stringify({ error: 'Failed to add sneaker' }), { status: 500 });
    }
}

export async function PUT(req) {
    try {
        const updatedSneaker = await req.json();
        const data = await fs.readFile(filePath, 'utf8');
        const sneakers = JSON.parse(data);

        const index = sneakers.sneakers.findIndex(sneaker => sneaker.id === updatedSneaker.id);
        if (index === -1) return new Response(JSON.stringify({ error: 'Sneaker not found' }), { status: 404 });

        sneakers.sneakers[index] = { ...sneakers.sneakers[index], ...updatedSneaker };
        await fs.writeFile(filePath, JSON.stringify(sneakers, null, 4));
        return new Response(JSON.stringify(sneakers.sneakers[index]), { status: 200 });
    } catch (error) {
        return new Response(JSON.stringify({ error: 'Failed to update sneaker' }), { status: 500 });
    }
}

export async function DELETE(req) {
    try {
        const { id } = await req.json();
        const data = await fs.readFile(filePath, 'utf8');
        let sneakers = JSON.parse(data);

        sneakers.sneakers = sneakers.sneakers.filter(sneaker => sneaker.id !== id);
        await fs.writeFile(filePath, JSON.stringify(sneakers, null, 4));

        return new Response(JSON.stringify({ message: 'Sneaker deleted successfully' }), { status: 200 });
    } catch (error) {
        return new Response(JSON.stringify({ error: 'Failed to delete sneaker' }), { status: 500 });
    }
}
