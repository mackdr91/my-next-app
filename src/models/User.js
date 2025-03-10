import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  // We'll use MongoDB's default _id and store Google ID separately
  username: {
    type: String,
    required: [true, 'Username is required'],
    unique: true,
    trim: true,
    minlength: [3, 'Username must be at least 3 characters long']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters long'],
    select: false // Don't include password in query results by default
  },
  googleId: {
    type: String,
    sparse: true,
    unique: true,
    validate: {
      validator: function(v) {
        // Allow null/undefined (sparse index) or non-empty string
        return v === null || v === undefined || (typeof v === 'string' && v.length > 0);
      },
      message: 'Google ID must be a non-empty string'
    }
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});



// Don't save the password if it hasn't been modified or is already hashed
UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const bcrypt = (await import('bcryptjs')).default;
    this.password = await bcrypt.hash(this.password, 10);
    next();
  } catch (error) {
    next(error);
  }
});

// Add static method to find user by either ObjectId or Google ID
UserSchema.statics.findByIdOrGoogleId = async function(id) {
  if (!id) return null;
  
  try {
    // First try as MongoDB ObjectId
    if (mongoose.Types.ObjectId.isValid(id)) {
      const userById = await this.findById(id);
      if (userById) return userById;
    }
    
    // Then try as Google ID if it's a non-empty string
    if (typeof id === 'string' && id.length > 0) {
      return await this.findOne({ googleId: id });
    }
    
    return null;
  } catch (error) {
    console.error('Error in findByIdOrGoogleId:', error);
    return null;
  }
};

// Add static method to find user by either ObjectId or Google ID and select specific fields
UserSchema.statics.findByIdOrGoogleIdSelect = async function(id, select) {
  if (!id) return null;
  
  try {
    // First try as MongoDB ObjectId
    if (mongoose.Types.ObjectId.isValid(id)) {
      const userById = await this.findById(id).select(select);
      if (userById) return userById;
    }
    
    // Then try as Google ID if it's a non-empty string
    if (typeof id === 'string' && id.length > 0) {
      return await this.findOne({ googleId: id }).select(select);
    }
    
    return null;
  } catch (error) {
    console.error('Error in findByIdOrGoogleIdSelect:', error);
    return null;
  }
};

const User = mongoose.models.User || mongoose.model('User', UserSchema);
export default User;
