import {Router} from 'express'
import { 
        getUserInfo,
        login, 
        signUp,
        updateProfile ,
        addProfileImage,
        removeProfileImage,
        logOut
        } from '../controllers/authController.js';
import { verifyToken } from '../middlewares/authMiddleware.js';
import multer from 'multer'

const authRoutes=Router();
const upload=multer({dest:'uploads/profiles/'});

authRoutes.post('/signup',signUp);
authRoutes.post('/login',login);
authRoutes.get('/user-info',verifyToken ,getUserInfo);
authRoutes.post('/update-profile',verifyToken,updateProfile);
authRoutes.post('/add-profile-image',verifyToken,upload.single('profile-image'),addProfileImage);
authRoutes.delete('/remove-profile-image',verifyToken,removeProfileImage)
authRoutes.post('/logout',logOut)

export default authRoutes;