import { v2 as cloudinary } from 'cloudinary';
import exp from 'constants';
import fs from 'fs'


// Configuration
cloudinary.config({
    cloud_name: 'dl2njnkpu', 
    api_key: '821517973896547', 
    api_secret: 'pv59wYyyE8FZy_PwRYEC3oTkgg0'


    // cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    // api_key: process.env.CLOUDINARY_API_KEY,
    // api_secret: process.env.CLOUDINARY_API_SECRET
});


const uploadOnCloudinary =  async (localFilePath) => {
    try {
        if(!localFilePath) return null
        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto"
        })

        console.log("File is uploaded on Cloudinary", response.url)
        return(response)
    } catch (error) {
        fs.unlinkSync(localFilePath)
        return null
    }
}


export {uploadOnCloudinary}