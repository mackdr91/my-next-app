import { promises as fs } from 'fs';
import path from 'path';

const filePath = path.join(process.cwd(), 'public', 'sneaker.json');

export async function PUT(req, { params }) {
    try {
        const { id } = params;
        const updatedSneaker = await req.json();

        // Validate required fields if they are present in the update
        const requiredFields = ['brand', 'model', 'price', 'color', 'size'];
        const providedFields = Object.keys(updatedSneaker);
        const invalidFields = providedFields.filter(field => {
            if (!requiredFields.includes(field) && field !== 'inStock') {
                return true;
            }
            if (field === 'price' && (typeof updatedSneaker.price !== 'number' || updatedSneaker.price <= 0)) {
                return true;
            }
            if (field === 'size' && (typeof updatedSneaker.size !== 'number' || updatedSneaker.size < 4 || updatedSneaker.size > 18)) {
                return true;
            }
            return false;
        });

        if (invalidFields.length > 0) {
            return new Response(
                JSON.stringify({
                    error: `Invalid fields or values: ${invalidFields.join(', ')}`
                }),
                { 
                    status: 400,
                    headers: { 'Content-Type': 'application/json' }
                }
            );
        }

        const data = await fs.readFile(filePath, 'utf8');
        const sneakers = JSON.parse(data);

        const index = sneakers.sneakers.findIndex(sneaker => sneaker.id === Number(id));
        if (index === -1) {
            return new Response(
                JSON.stringify({ error: 'Sneaker not found' }), 
                { 
                    status: 404,
                    headers: { 'Content-Type': 'application/json' }
                }
            );
        }

        // Preserve the ID and update only the provided fields
        sneakers.sneakers[index] = { 
            ...sneakers.sneakers[index],
            ...updatedSneaker,
            id: Number(id)
        };

        await fs.writeFile(filePath, JSON.stringify(sneakers, null, 4));
        
        return new Response(
            JSON.stringify(sneakers.sneakers[index]), 
            { 
                status: 200,
                headers: { 'Content-Type': 'application/json' }
            }
        );
    } catch (error) {
        console.error('Error updating sneaker:', error);
        return new Response(
            JSON.stringify({ error: 'Failed to update sneaker' }), 
            { 
                status: 500,
                headers: { 'Content-Type': 'application/json' }
            }
        );
    }
}

export async function DELETE(req, { params }) {
    try {
        const { id } = params;
        
        if (!id || isNaN(Number(id))) {
            return new Response(
                JSON.stringify({ error: 'Invalid sneaker ID provided' }),
                { 
                    status: 400,
                    headers: { 'Content-Type': 'application/json' }
                }
            );
        }

        const data = await fs.readFile(filePath, 'utf8');
        const sneakers = JSON.parse(data);

        const index = sneakers.sneakers.findIndex(sneaker => sneaker.id === Number(id));
        if (index === -1) {
            return new Response(
                JSON.stringify({ error: 'Sneaker not found' }), 
                { 
                    status: 404,
                    headers: { 'Content-Type': 'application/json' }
                }
            );
        }

        // Store the sneaker before deletion for the response
        const deletedSneaker = sneakers.sneakers[index];

        // Remove the sneaker
        sneakers.sneakers.splice(index, 1);
        await fs.writeFile(filePath, JSON.stringify(sneakers, null, 4));

        return new Response(
            JSON.stringify({
                message: 'Sneaker deleted successfully',
                deletedSneaker
            }), 
            { 
                status: 200,
                headers: { 'Content-Type': 'application/json' }
            }
        );
    } catch (error) {
        console.error('Error deleting sneaker:', error);
        return new Response(
            JSON.stringify({ 
                error: 'Failed to delete sneaker',
                details: error.message
            }), 
            { 
                status: 500,
                headers: { 'Content-Type': 'application/json' }
            }
        );
    }
}
