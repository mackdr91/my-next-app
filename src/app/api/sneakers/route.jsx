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

        // Validate required fields
        const requiredFields = ['brand', 'model', 'price', 'color', 'size'];
        const missingFields = requiredFields.filter(field => !newSneaker[field]);
        
        if (missingFields.length > 0) {
            return new Response(
                JSON.stringify({
                    error: `Missing required fields: ${missingFields.join(', ')}`
                }),
                { status: 400 }
            );
        }

        // Validate data types and ranges
        if (typeof newSneaker.price !== 'number' || newSneaker.price <= 0) {
            return new Response(
                JSON.stringify({ error: 'Price must be a positive number' }),
                { status: 400 }
            );
        }

        if (typeof newSneaker.size !== 'number' || newSneaker.size < 4 || newSneaker.size > 18) {
            return new Response(
                JSON.stringify({ error: 'Size must be a number between 4 and 18' }),
                { status: 400 }
            );
        }

        const data = await fs.readFile(filePath, 'utf8');
        const sneakers = JSON.parse(data);

        // Find the highest ID and increment by 1
        const maxId = sneakers.sneakers.reduce((max, sneaker) => Math.max(max, sneaker.id), 0);
        newSneaker.id = maxId + 1;

        // Set inStock to true by default if not provided
        newSneaker.inStock = newSneaker.inStock ?? true;

        sneakers.sneakers.push(newSneaker);
        await fs.writeFile(filePath, JSON.stringify(sneakers, null, 4));

        return new Response(JSON.stringify(newSneaker), { 
            status: 201,
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (error) {
        console.error('Error adding sneaker:', error);
        return new Response(
            JSON.stringify({ error: 'Failed to add sneaker' }),
            { 
                status: 500,
                headers: { 'Content-Type': 'application/json' }
            }
        );
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
