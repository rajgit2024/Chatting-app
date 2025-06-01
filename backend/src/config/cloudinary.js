const cloudinary = require("cloudinary").v2
require("dotenv").config()

console.log("=== Cloudinary Environment Variables ===")
console.log("CLOUDINARY_CLOUD_NAME:", process.env.CLOUDINARY_CLOUD_NAME ? "✅ Set" : "❌ Missing")
console.log("CLOUDINARY_API_KEY:", process.env.CLOUDINARY_API_KEY ? "✅ Set" : "❌ Missing")
console.log("CLOUDINARY_API_SECRET:", process.env.CLOUDINARY_API_SECRET ? "✅ Set" : "❌ Missing")

// Configure Cloudinary with correct environment variable names
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET,
})

// Test the connection
const testCloudinaryConnection = async () => {
  try {
    if (!process.env.CLOUD_NAME|| !process.env.CLOUD_API_KEY || !process.env.CLOUD_API_SECRET) {
      console.error("❌ Cloudinary environment variables are missing!")
      console.log("Please check your .env file and make sure you have:")
      console.log("CLOUDINARY_CLOUD_NAME=your_cloud_name")
      console.log("CLOUDINARY_API_KEY=your_api_key")
      console.log("CLOUDINARY_API_SECRET=your_api_secret")
      return false
    }

    const result = await cloudinary.api.ping()
    console.log("✅ Cloudinary connection successful:", result)
    return true
  } catch (error) {
    console.error("❌ Cloudinary connection failed:", error.message)
    console.log("Please verify your Cloudinary credentials in .env file")
    return false
  }
}

// Call test function when module loads
testCloudinaryConnection()

module.exports = cloudinary;
