import {asyncHandler} from "../utils/asyncHandler.js";
import {ApiError} from "../utils/ApiError.js"
import {User} from "../models/user.model.js"
import {uploadOnCloudinary} from "../utils/cloudinary.js"
import {ApiResponse} from "../utils/ApiResponse.js"


const registerUser = asyncHandler( async (req, res) => {
    res.status(200).json({
        message: "ok"
    })

    const email = req.body.email
    // const {email} = req.body
    console.log("email: ", email)

    // if (fullName === ""){
    //     throw new ApiError(400, "Full name is required")
        
    // }

    if(
        [fullName, email, username, password].some((value) => value?.trim === "")
    ) {
        throw new ApiError(400, "Field Must Not Be Empty")
    }

    if(!email.includes("@"))
    {
        throw new ApiError(400, "Please Enter a Valid Email")
        
    }

    const existedUser = User.findOne({
        $or : [{username}, {email}]
    })

    if(existedUser) {
        throw new ApiError(409, "User already registered")
    }

    const avatarLocalPath = req.file?.avatar[0]?.path
    const coverImageLocalPath = req.file?.coverImage[0]?.path

    if(!avatarLocalPath) {
        throw new ApiError(400, "Avatar is Required");
    }


    const avatar = await uploadOnCloudinary(avatarLocalPath)
    const coverImage = await uploadOnCloudinary(coverImageLocalPath)


    if(!avatar){
        throw new ApiError(400, "Avatar is Required");
    }



    const user = await User.create({
        fullName,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
        email,
        password,
        username: username.toLowerCase()
    })

    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )


    if(!createdUser){
        throw new ApiError(500, "Something Went Wrong while registering")
    }

    return res.status(201).json(
        new ApiResponse(200, createdUser, "User registered Successfully")
    )





})


export {registerUser}


// Steps to register User

// take user name 
// take user Email
// take user Password
// create a button that save the user data in DB 
// insert some middleware to check if user name is filled and password is following the rules defined and email is in emial format 
// after checking the data put the data in DB