import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import Sneaker from '../../../../models/Sneaker';
import User from '../../../../models/User';
import { dbConnect } from '../../../../utils/db';

export async function GET(req, { params }) {
    try {
        await dbConnect();
        const session = await getServerSession(authOptions);
        
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const user = await User.findOne({ email: session.user.email });
        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        const { id } = params;
        const sneaker = await Sneaker.findOne({ _id: id, userId: user._id });

        if (!sneaker) {
            return NextResponse.json({ error: 'Sneaker not found or unauthorized' }, { status: 404 });
        }

        return NextResponse.json(sneaker);
    } catch (error) {
        console.error('Error fetching sneaker:', error);
        return NextResponse.json({ 
            error: 'Failed to fetch sneaker',
            details: error.message
        }, { status: 500 });
    }
}

export async function PUT(req, { params }) {
    try {
        await dbConnect();
        const session = await getServerSession(authOptions);
        
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const user = await User.findOne({ email: session.user.email });
        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        const { id } = params;
        let updates;
        try {
            updates = await req.json();
            
            // Validate required fields
            if (!updates || typeof updates !== 'object') {
                return NextResponse.json({ 
                    error: 'Invalid request body',
                    details: 'Request body must be a valid object'
                }, { status: 400 });
            }

            // Remove any attempt to modify userId
            delete updates.userId;
            
            // Ensure at least one valid field is being updated
            const validFields = ['brand', 'model', 'price', 'color', 'size', 'inStock'];
            const hasValidUpdate = validFields.some(field => field in updates);
            
            if (!hasValidUpdate) {
                return NextResponse.json({ 
                    error: 'Invalid update data',
                    details: 'At least one valid field must be provided for update',
                    validFields
                }, { status: 400 });
            }

            // Validate field types if present
            if (updates.price !== undefined && typeof updates.price !== 'number') {
                return NextResponse.json({ 
                    error: 'Invalid field type',
                    details: 'Price must be a number'
                }, { status: 400 });
            }

            if (updates.size !== undefined && typeof updates.size !== 'number') {
                return NextResponse.json({ 
                    error: 'Invalid field type',
                    details: 'Size must be a number'
                }, { status: 400 });
            }

            if (updates.inStock !== undefined && typeof updates.inStock !== 'boolean') {
                return NextResponse.json({ 
                    error: 'Invalid field type',
                    details: 'inStock must be a boolean'
                }, { status: 400 });
            }
        } catch (parseError) {
            return NextResponse.json({ 
                error: 'Invalid JSON data',
                details: 'The request body must be valid JSON'
            }, { status: 400 });
        }

        // Ensure user owns the sneaker
        const sneaker = await Sneaker.findOne({ _id: id, userId: user._id });
        if (!sneaker) {
            return NextResponse.json({ error: 'Sneaker not found or unauthorized' }, { status: 404 });
        }

        // Update the sneaker
        const updatedSneaker = await Sneaker.findByIdAndUpdate(
            id,
            { ...updates, userId: user._id },
            { 
                new: true,
                runValidators: true
            }
        );

        if (!updatedSneaker) {
            return NextResponse.json({ error: 'Sneaker not found' }, { status: 404 });
        }
        
        return NextResponse.json(updatedSneaker);
    } catch (error) {
        console.error('Error updating sneaker:', error);
        return NextResponse.json({ 
            error: 'Failed to update sneaker',
            details: error.message
        }, { status: 500 });
    }
}

export async function DELETE(req, { params }) {
    try {
        await dbConnect();
        const session = await getServerSession(authOptions);
        
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const user = await User.findOne({ email: session.user.email });
        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        const { id } = params;

        // Ensure user owns the sneaker
        const sneaker = await Sneaker.findOne({ _id: id, userId: user._id });
        if (!sneaker) {
            return NextResponse.json({ error: 'Sneaker not found or unauthorized' }, { status: 404 });
        }

        const deletedSneaker = await Sneaker.findOneAndDelete({ _id: id, userId: user._id });

        if (!deletedSneaker) {
            return NextResponse.json({ error: 'Sneaker not found or unauthorized' }, { status: 404 });
        }

        return NextResponse.json({
            message: 'Sneaker deleted successfully',
            deletedSneaker
        }, { status: 200 });
    } catch (error) {
        console.error('Error deleting sneaker:', error);
        return NextResponse.json({ 
            error: 'Failed to delete sneaker',
            details: error.message
        }, { status: 500 });
    }
}
