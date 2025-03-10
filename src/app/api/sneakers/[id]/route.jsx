import { promises as fs } from 'fs';
import path from 'path';

const filePath = path.join(process.cwd(), 'public', 'sneaker.json');

export async function PUT(req, { params }) {
    try {
        const { id } = params;
        const updatedSneaker = await req.json();
        const data = await fs.readFile(filePath, 'utf8');
        const sneakers = JSON.parse(data);

        const index = sneakers.sneakers.findIndex(sneaker => sneaker.id === Number(id));
        if (index === -1) {
            return new Response(
                JSON.stringify({ error: 'Sneaker not found' }), 
                { status: 404 }
            );
        }

        // Preserve the ID and update other fields
        sneakers.sneakers[index] = { 
            ...updatedSneaker,
            id: Number(id)
        };

        await fs.writeFile(filePath, JSON.stringify(sneakers, null, 4));
        
        return new Response(
            JSON.stringify(sneakers.sneakers[index]), 
            { status: 200 }
        );
    } catch (error) {
        console.error('Error updating sneaker:', error);
        return new Response(
            JSON.stringify({ error: 'Failed to update sneaker' }), 
            { status: 500 }
        );
    }
}

export async function DELETE(req, { params }) {
    try {
        const { id } = params;
        const data = await fs.readFile(filePath, 'utf8');
        const sneakers = JSON.parse(data);

        const index = sneakers.sneakers.findIndex(sneaker => sneaker.id === Number(id));
        if (index === -1) {
            return new Response(
                JSON.stringify({ error: 'Sneaker not found' }), 
                { status: 404 }
            );
        }

        sneakers.sneakers.splice(index, 1);
        await fs.writeFile(filePath, JSON.stringify(sneakers, null, 4));

        return new Response(
            JSON.stringify({ message: 'Sneaker deleted successfully' }), 
            { status: 200 }
        );
    } catch (error) {
        console.error('Error deleting sneaker:', error);
        return new Response(
            JSON.stringify({ error: 'Failed to delete sneaker' }), 
            { status: 500 }
        );
    }
}
