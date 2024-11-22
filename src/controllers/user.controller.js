import {asyncHandler} from "../utils/asyncHandler.js";
import {ApiError} from "../utils/ApiError.js"
import {User} from "../models/user.model.js"
import {uploadOnCloudinary} from "../utils/cloudinary.js"
import {ApiResponse} from "../utils/ApiResponse.js"


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
    if(!username || !email) {
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
        secure: true
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
            "User logged In Succeddfully   "
        )
    )

})

const logoutUser = asyncHandler(async(req,res) =>{
       await User.findByIdAndUpdate(
            req.user._id,
            {
                $set: {
                    refreshToken: undefined
                }
            }
        )

        const options = {
            httpOnly: true,
            secure: true
        }

        return res.status(200
            .clearCookie("accessToken", options)
            .clearCookie("refreshToken", options)
            .json(new ApiResponse(200, {}, "User logged Out"))
        )
})


export {
    registerUser,
    loginUser,
    logoutUser
}


// Steps to register User

// take user name 
// take user Email
// take user Password
// create a button that save the user data in DB 
// insert some middleware to check if user name is filled and password is following the rules defined and email is in emial format 
// after checking the data put the data in DB