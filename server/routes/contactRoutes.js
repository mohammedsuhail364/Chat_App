import { Router } from "express";
import { verifyToken } from "../middlewares/authMiddleware.js";
import { getAllContatcs, getContactsForDMList, searchContacts } from "../controllers/contactController.js";

const contactsRoutes=Router();
contactsRoutes.post("/search",verifyToken,searchContacts)
contactsRoutes.get("/get-contacts-for-dm",verifyToken,getContactsForDMList)
contactsRoutes.get("/get-all-contacts",verifyToken,getAllContatcs)

export default contactsRoutes;