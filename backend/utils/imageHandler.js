const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

/**
 * Saves a base64 image to the local filesystem and returns the URL path.
 * This prevents MongoDB document size limits from being exceeded.
 */
const saveBase64Image = async (base64String) => {
    if (!base64String) return "";
    
    try {
        // Ensure uploads directory exists
        const uploadDir = path.join(__dirname, '../../uploads');
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }

        // Extract format and data
        const matches = base64String.match(/^data:image\/([A-Za-z-+/]+);base64,(.+)$/);
        if (!matches || matches.length !== 3) {
            throw new Error('Invalid base64 string');
        }

        const extension = matches[1];
        const data = matches[2];
        const buffer = Buffer.from(data, 'base64');
        
        // Check size (extra safety)
        if (buffer.length > 5 * 1024 * 1024) {
            throw new Error('File too large (max 5MB)');
        }

        const fileName = `${uuidv4()}.${extension}`;
        const filePath = path.join(uploadDir, fileName);
        
        fs.writeFileSync(filePath, buffer);
        
        // Return the relative URL (assuming the server serves /uploads)
        return `/uploads/${fileName}`;
    } catch (error) {
        console.error("[ImageHandler] Failed to save image:", error.message);
        return "";
    }
};

module.exports = { saveBase64Image };
