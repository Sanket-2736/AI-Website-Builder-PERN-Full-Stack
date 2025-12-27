import { Request, Response, NextFunction } from "express";
import { auth } from "../lib/auth.js";
import { fromNodeHeaders } from "better-auth/node";
import { success } from "better-auth";

export const protect = async (req : Request, res : Response, next : NextFunction) => {
    try {
        const session = await auth.api.getSession({
            headers : fromNodeHeaders(req.headers)
        });

        if(!session || !session?.user){
            return res.status(401).json({
                success : false,
                message : "Unauthorised access!"
            })
        }

        req.userId = session.user.id;

        next();
    } catch (error) {
        console.log("Error in auth middleware: ", error);
        return res.status(401).json({
            success : false,
            message : "Internal server error!"
        })
    }
}