const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Configure storage for profile pictures
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'ecomplain/students/profile-pictures',
    allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
    transformation: [
      { width: 500, height: 500, crop: 'fill', gravity: 'face' },
      { quality: 'auto', fetch_format: 'auto' }
    ],
    public_id: (req, file) => {
      // Use student ID from authenticated user
      const studentId = req.user?._id || 'temp';
      return `student-${studentId}-${Date.now()}`;
    }
  }
});

// File filter for images only
const fileFilter = (req, file, cb) => {
  // Accept only image files
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'), false);
  }
};

// Configure multer for profile pictures
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: fileFilter
});

// Configure storage for complaint attachments - Images
const complaintImageStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'ecomplain/complaints/attachments',
    allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
    resource_type: 'image', // Explicitly set for images
    public_id: (req, file) => {
      const complaintId = req.params?.id || 'temp';
      const timestamp = Date.now();
      const originalName = file.originalname.replace(/\.[^/.]+$/, ''); // Remove extension
      return `complaint-${complaintId}-${originalName}-${timestamp}`;
    }
  }
});

// Configure storage for complaint attachments - PDFs and Documents
const complaintDocumentStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'ecomplain/complaints/attachments',
    allowed_formats: ['pdf', 'doc', 'docx', 'txt', 'zip'],
    resource_type: 'raw', // Use 'raw' for PDFs and documents to preserve file format
    public_id: (req, file) => {
      const complaintId = req.params?.id || 'temp';
      const timestamp = Date.now();
      const originalName = file.originalname.replace(/\.[^/.]+$/, ''); // Remove extension
      return `complaint-${complaintId}-${originalName}-${timestamp}`;
    }
  }
});

// Unified storage that selects based on file type
const complaintStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: (req, file) => {
    const complaintId = req.params?.id || 'temp';
    const timestamp = Date.now();
    const originalName = file.originalname.replace(/\.[^/.]+$/, ''); // Remove extension
    const publicId = `complaint-${complaintId}-${originalName}-${timestamp}`;
    
    // Determine resource type based on file MIME type
    const isImage = file.mimetype.startsWith('image/');
    const isPdf = file.mimetype === 'application/pdf';
    
    console.log(`[Cloudinary Upload] Processing file: ${file.originalname}, MIME: ${file.mimetype}, isImage: ${isImage}, isPdf: ${isPdf}`);
    
    if (isImage) {
      return {
        folder: 'ecomplain/complaints/attachments',
        allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
        resource_type: 'image',
        public_id: publicId
      };
    } else if (isPdf) {
      return {
        folder: 'ecomplain/complaints/attachments',
        allowed_formats: ['pdf'],
        resource_type: 'raw', // PDFs must use 'raw' resource type
        public_id: publicId
      };
    } else {
      // Other documents (doc, docx, txt, zip)
      return {
        folder: 'ecomplain/complaints/attachments',
        allowed_formats: ['doc', 'docx', 'txt', 'zip'],
        resource_type: 'raw',
        public_id: publicId
      };
    }
  }
});

// File filter for complaint attachments (images, PDFs, documents)
const complaintFileFilter = (req, file, cb) => {
  const allowedMimes = [
    'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp',
    'application/pdf',
    'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain',
    'application/zip', 'application/x-zip-compressed'
  ];
  
  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`File type not allowed. Allowed types: images, PDF, Word documents, text files, and ZIP files.`), false);
  }
};

// Configure multer for complaint attachments (multiple files)
const uploadComplaintAttachments = multer({
  storage: complaintStorage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit per file
    files: 5 // Maximum 5 files per complaint
  },
  fileFilter: complaintFileFilter
});

// Helper function to upload image to Cloudinary
const uploadImageToCloudinary = async (filePath, options = {}) => {
  try {
    const result = await cloudinary.uploader.upload(filePath, {
      resource_type: 'image',
      folder: options.folder || 'ecomplain/uploads',
      ...options
    });
    
    console.log('Image uploaded to Cloudinary:', {
      public_id: result.public_id,
      secure_url: result.secure_url,
      resource_type: result.resource_type
    });
    
    return {
      url: result.secure_url,
      public_id: result.public_id,
      resource_type: result.resource_type
    };
  } catch (error) {
    console.error('Error uploading image to Cloudinary:', error);
    throw error;
  }
};

// Helper function to upload PDF to Cloudinary
const uploadPdfToCloudinary = async (filePath, options = {}) => {
  try {
    const result = await cloudinary.uploader.upload(filePath, {
      resource_type: 'raw', // PDFs must use 'raw' resource type
      folder: options.folder || 'ecomplain/uploads',
      ...options
    });
    
    console.log('PDF uploaded to Cloudinary:', {
      public_id: result.public_id,
      secure_url: result.secure_url,
      resource_type: result.resource_type
    });
    
    return {
      url: result.secure_url,
      public_id: result.public_id,
      resource_type: result.resource_type
    };
  } catch (error) {
    console.error('Error uploading PDF to Cloudinary:', error);
    throw error;
  }
};

// Helper function to delete image from Cloudinary
const deleteImage = async (imageUrl) => {
  try {
    if (!imageUrl) return false;

    // Extract public_id from Cloudinary URL
    // Cloudinary URLs format: https://res.cloudinary.com/{cloud_name}/image/upload/v{version}/{folder}/{public_id}.{ext}
    // or: https://res.cloudinary.com/{cloud_name}/image/upload/{transformation}/{folder}/{public_id}.{ext}
    // For raw files: https://res.cloudinary.com/{cloud_name}/raw/upload/v{version}/{folder}/{public_id}.{ext}
    let publicId = imageUrl;
    let resourceType = 'image';

    // If it's a full URL, extract the public_id and resource type
    if (imageUrl.includes('cloudinary.com')) {
      // Check if it's a raw file (PDF, etc.)
      if (imageUrl.includes('/raw/upload/')) {
        resourceType = 'raw';
        const urlMatch = imageUrl.match(/\/raw\/upload\/(?:v\d+\/)?(.+?)(?:\.(pdf|doc|docx|txt|zip))?$/);
        if (urlMatch) {
          publicId = urlMatch[1];
          publicId = publicId.replace(/\.(pdf|doc|docx|txt|zip)$/i, '');
        }
      } else {
        // Image file
        const urlMatch = imageUrl.match(/\/image\/upload\/(?:v\d+\/)?(.+?)(?:\.(jpg|jpeg|png|gif|webp))?$/);
        if (urlMatch) {
          publicId = urlMatch[1];
          publicId = publicId.replace(/\.(jpg|jpeg|png|gif|webp)$/i, '');
        }
      }
    }

    // Destroy the file
    const result = await cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
    return result.result === 'ok';
  } catch (error) {
    console.error('Error deleting file from Cloudinary:', error);
    return false;
  }
};

module.exports = {
  cloudinary,
  upload,
  uploadComplaintAttachments,
  uploadImageToCloudinary,
  uploadPdfToCloudinary,
  deleteImage
};

