import {asyncHandler} from "../utils/asyncHandler.js";
import {ApiError} from "../utils/ApiError.js"
import {User} from "../models/user.model.js"
import {uploadOnCloudinary} from "../utils/cloudinary.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import jwt from "jsonwebtoken";


const generateAccessAndRefreshTokens = async(userId) => {
    try {
        const user = await User.findById(userId)

        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()

        user.refreshToken = refreshToken
        await user.save({ validateBeforeSave: false })

        return {accessToken, refreshToken}



    } catch (error) {
        throw new ApiError(500, "Something went wrong while generating refresh and access token")
    }
}


const registerUser = asyncHandler( async (req, res) => {
    res.status(200).json({
        message: "ok"
    })

    const { fullName, username, email, password } = req.body;


    // if (fullName === ""){
    //     throw new ApiError(400, "Full name is required")
        
    // }

    if(
        [fullName, email, username, password].some((value) => value?.trim() === "")
    ) {
        throw new ApiError(400, "Field Must Not Be Empty")
    }

    if(!email.includes("@"))
    {
        throw new ApiError(400, "Please Enter a Valid Email")
        
    }

    const existedUser = await User.findOne({
        $or : [{username}, {email}]
    })

    if(existedUser) {
        throw new ApiError(409, "User already registered")
    }

    const avatarLocalPath = req.files?.avatar[0]?.path
    const coverImageLocalPath = req.files?.coverImage[0]?.path

    if(!avatarLocalPath) {
        throw new ApiError(400, "AvatarLocalPath is Required");
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


const loginUser = asyncHandler( async (req, res) => {


    const {email, username, password} = req.body
    if(!(username || email)) {
        throw new ApiError(400, "username or password is required")
    }

    const user = await User.findOne({
        $or: [{username}, {email}]
    })

    if(!user) {
        throw new ApiError(404, "User does not exists")
    }

    const isPasswordValid = await user.isPasswordCorrect(password)

    if(!isPasswordValid) {
        throw new ApiError(401, "Invalid Password")
    }


    const {accessToken, refreshToken} = await generateAccessAndRefreshTokens(user._id)

    const loggedInUser = await User.findById(user._id).select("-password -refreshToken")

    const options = {
        httpOnly: true,
        secure: true,
        
    }

    return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
        new ApiResponse(200,
            {
                user: loggedInUser, accessToken, refreshToken
            },
            "User logged In Successfully"
        )
    )

})

const logoutUser = asyncHandler(async(req,res) => {
       await User.findByIdAndUpdate(
            req.user._id,
            {
                $unset: {
                    refreshToken: 1
                }
            },
            {
                new: true
            }
        )

        const options = {
            httpOnly: true,
        secure: true
        }

        return res
        .status(200)
            .clearCookie("accessToken", options)
            .clearCookie("refreshToken", options)
            .json(new ApiResponse(200, {}, "User logged Out"))
        
    })


const refreshAccessToken = asyncHandler(async (req, res) => {
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken


    if(incomingRefreshToken) {
        throw new ApiError(401, "Unauthorized request")
    }

    try {
        const decodedToken = jwt.verify(
            incomingRefreshToken,
            process.env.REFRESH_TOKEN_SECRET
        )
    
    
        const user = await User.findById(decodedToken?._id)
    
    
        if(!user) {
            throw new ApiError(401, "invalid refresh token")
        }
    
        if(incomingRefreshToken !== user?.refreshToken) {
            throw new ApiError(401, "Refresh token is expired or used")
        }
    
        const options = {
            httpOnly: true,
            secure: true
        }
    
        const {newAccessToken, newRefreshToken} = await generateAccessAndRefreshTokens(user._id, options)
    
        return res
        .status(200)
        .cookie("accessToken",  newAccessToken, options)
        .cookie("refreshToken", newRefreshToken, options)
        .json(
            new ApiResponse(
                200,
                {accessToken : newAccessToken,
                refreshToken : newRefreshToken},
                "Access Token refreshed successfully"
            )
        )
    
    
    } catch (error) {
        throw new ApiError(401, error?.message ||
            "invalid refresh token"
        )
    }



})

export {
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken
}


// Steps to register User

// take user name 
// take user Email
// take user Password
// create a button that save the user data in DB 
// insert some middleware to check if user name is filled and password is following the rules defined and email is in emial format 
// after checking the data put the data in DB