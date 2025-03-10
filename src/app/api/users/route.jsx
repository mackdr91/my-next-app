import { promises as fs } from 'fs';
import path from 'path';

const filePath = path.join(process.cwd(), 'public', 'sample_users.json'); // Store JSON in public/

// ✅ Handle API requests
export async function GET() {
    try {
        const data = await fs.readFile(filePath, 'utf8');
        const users = JSON.parse(data);
        return Response.json(users);
    } catch (error) {
        return new Response(JSON.stringify({ error: 'Failed to load data' }), { status: 500 });
    }
}

export async function POST(req) {
    try {
        const newUser = await req.json();
        const data = await fs.readFile(filePath, 'utf8');
        const users = JSON.parse(data);
        newUser.id = users.users.length + 1; // Auto-increment ID
        users.users.push(newUser);

        await fs.writeFile(filePath, JSON.stringify(users, null, 4));
        return new Response(JSON.stringify(newUser), { status: 201 });
    } catch (error) {
        return new Response(JSON.stringify({ error: 'Failed to add user' }), { status: 500 });
    }
}

export async function PUT(req) {
    try {
        const updatedUser = await req.json();
        const data = await fs.readFile(filePath, 'utf8');
        const users = JSON.parse(data);

        const index = users.users.findIndex(user => user.id === updatedUser.id);
        if (index === -1) return new Response(JSON.stringify({ error: 'User not found' }), { status: 404 });

        users.users[index] = { ...users.users[index], ...updatedUser };
        await fs.writeFile(filePath, JSON.stringify(users, null, 4));
        return new Response(JSON.stringify(users.users[index]), { status: 200 });
    } catch (error) {
        return new Response(JSON.stringify({ error: 'Failed to update user' }), { status: 500 });
    }
}

export async function DELETE(req) {
    try {
        const { id } = await req.json();
        const data = await fs.readFile(filePath, 'utf8');
        let users = JSON.parse(data);

        users.users = users.users.filter(user => user.id !== id);
        await fs.writeFile(filePath, JSON.stringify(users, null, 4));

        return new Response(JSON.stringify({ message: 'User deleted successfully' }), { status: 200 });
    } catch (error) {
        return new Response(JSON.stringify({ error: 'Failed to delete user' }), { status: 500 });
    }
}