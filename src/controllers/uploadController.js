const supabase = require('../config/supabase');

const uploadMedia = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Please upload a file' });
    }

    // Create a unique filename to prevent overwriting files with identical names
    const fileExt = req.file.originalname.split('.').pop();
    const fileName = `${Date.now()}-${Math.floor(Math.random() * 1000)}.${fileExt}`;
    
    // Determine folder path inside bucket based on file type
    const folder = req.file.mimetype.startsWith('image/') ? 'images' : 'audio';
    const filePath = `${folder}/${fileName}`;

    // Upload the file buffer to your Supabase storage bucket
    const { data, error } = await supabase.storage
      .from('meme-media')
      .upload(filePath, req.file.buffer, {
        contentType: req.file.mimetype,
        upsert: false
      });

    if (error) throw error;

    // Get the public streaming/viewing URL
    const { data: { publicUrl } } = supabase.storage
      .from('meme-media')
      .getPublicUrl(filePath);

    // Return success response to your team members' apps
    return res.status(200).json({
      message: 'File uploaded successfully!',
      url: publicUrl,
      path: data.path
    });

  } catch (error) {
    console.error('Upload Error:', error.message);
    return res.status(500).json({ error: error.message });
  }
};

module.exports = { uploadMedia };