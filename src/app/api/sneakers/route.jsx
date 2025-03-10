import { NextResponse } from 'next/server';
import { withProtectedSession } from '../auth/[...nextauth]/route';
import Sneaker from '../../../models/Sneaker';
import { dbConnect } from '../../../utils/db';



// Cache control headers for better performance
const cacheHeaders = {
    'Cache-Control': 'no-store, must-revalidate',
    'Pragma': 'no-cache',
    'Expires': '0'
};

// ✅ Handle API requests
export async function GET(req) {
    const startTime = Date.now();
    try {
        await dbConnect();
        const { error, user } = await withProtectedSession(req);
        if (error) return error;

        // Use lean() for better performance and only select needed fields
        const sneakers = await Sneaker.find({ userId: user._id })
            .select('brand model price color size inStock createdAt')
            .sort({ createdAt: -1 })
            .lean()
            .exec();

        const responseTime = Date.now() - startTime;
        console.log(`GET /api/sneakers completed in ${responseTime}ms`);

        return NextResponse.json({ sneakers }, { headers: cacheHeaders });
    } catch (error) {
        console.error('Error loading sneakers:', error);
        return NextResponse.json({ 
            error: 'Failed to load data', 
            sneakers: [] 
        }, { status: 500 });
    }
}

export async function POST(req) {
    try {
        await dbConnect();
        const { error, user } = await withProtectedSession(req);
        if (error) return error;

        let sneakerData;
        try {
            sneakerData = await req.json();
            
            // Validate required fields
            if (!sneakerData || typeof sneakerData !== 'object') {
                return NextResponse.json({ 
                    error: 'Invalid request body',
                    details: 'Request body must be a valid object'
                }, { status: 400 });
            }

            // Validate required fields
            const requiredFields = ['brand', 'model'];
            const missingFields = requiredFields.filter(field => !sneakerData[field]);
            
            if (missingFields.length > 0) {
                return NextResponse.json({ 
                    error: 'Missing required fields',
                    details: `The following fields are required: ${missingFields.join(', ')}`
                }, { status: 400 });
            }

            // Validate field types
            if (sneakerData.price !== undefined && typeof sneakerData.price !== 'number') {
                return NextResponse.json({ 
                    error: 'Invalid field type',
                    details: 'Price must be a number'
                }, { status: 400 });
            }

            if (sneakerData.size !== undefined && typeof sneakerData.size !== 'number') {
                return NextResponse.json({ 
                    error: 'Invalid field type',
                    details: 'Size must be a number'
                }, { status: 400 });
            }

            if (sneakerData.inStock !== undefined && typeof sneakerData.inStock !== 'boolean') {
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
        sneakerData.inStock = sneakerData.inStock ?? true;
        sneakerData.userId = user._id; // Associate sneaker with user

        const newSneaker = new Sneaker(sneakerData);
        await newSneaker.save();

        return NextResponse.json(newSneaker, { status: 201, headers: cacheHeaders });
    } catch (error) {
        console.error('Error adding sneaker:', error);
        return NextResponse.json(
            { error: 'Failed to add sneaker', details: error.message },
            { status: 500 }
        );
    }
}

export async function PUT(req) {
    try {
        await dbConnect();
        const { error, user } = await withProtectedSession(req);
        if (error) return error;

        let data;
        try {
            data = await req.json();
            
            // Validate request body
            if (!data || typeof data !== 'object') {
                return NextResponse.json({ 
                    error: 'Invalid request body',
                    details: 'Request body must be a valid object'
                }, { status: 400 });
            }

            // Validate id field
            if (!data.id) {
                return NextResponse.json({ 
                    error: 'Missing required field',
                    details: 'The id field is required'
                }, { status: 400 });
            }

            if (!data.id || typeof data.id !== 'string') {
                return NextResponse.json({ 
                    error: 'Invalid id field',
                    details: 'The id field must be a valid string'
                }, { status: 400 });
            }

            const { id, ...updates } = data;

            // Remove any attempt to modify userId or _id
            delete updates.userId;
            delete updates._id;
            
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

        const updatedSneaker = await Sneaker.findByIdAndUpdate(
            id,
            updates,
            { new: true, runValidators: true }
        );

        if (!updatedSneaker) {
            return NextResponse.json({ error: 'Sneaker not found' }, { status: 404 });
        }

        return NextResponse.json(updatedSneaker, { headers: cacheHeaders });
    } catch (error) {
        console.error('Error updating sneaker:', error);
        return NextResponse.json(
            { error: 'Failed to update sneaker', details: error.message },
            { status: 500 }
        );
    }
}

export async function DELETE(req) {
    try {
        await dbConnect();
        const { error, user } = await withProtectedSession(req);
        if (error) return error;

        let data;
        try {
            data = await req.json();
        } catch (parseError) {
            return NextResponse.json({ 
                error: 'Invalid JSON data',
                details: 'The request body must be valid JSON'
            }, { status: 400 });
        }
        const { ids } = data;

        if (!Array.isArray(ids) || ids.length === 0) {
            return NextResponse.json(
                { error: 'Invalid or empty sneaker IDs provided' },
                { status: 400 }
            );
        }

        // Only find sneakers that belong to the user
        const sneakersToDelete = await Sneaker.find({ 
            _id: { $in: ids },
            userId: user._id
        });

        if (sneakersToDelete.length !== ids.length) {
            return NextResponse.json({ 
                error: 'Some sneaker IDs were not found',
                deletedCount: sneakersToDelete.length,
                requestedCount: ids.length,
                deletedSneakers: sneakersToDelete
            }, { status: 400 });
        }

        await Sneaker.deleteMany({ _id: { $in: ids }, userId: user._id });

        return NextResponse.json({
            message: 'Sneakers deleted successfully',
            count: sneakersToDelete.length,
            deletedSneakers: sneakersToDelete
        });
    } catch (error) {
        console.error('Error deleting sneakers:', error);
        return NextResponse.json({ 
            error: 'Failed to delete sneakers',
            details: error.message
        }, { status: 500 });
    }
}
