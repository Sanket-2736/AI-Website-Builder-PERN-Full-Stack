import { Request, Response } from "express";
import prisma from "../lib/prisma.js";
import openai from "../configs/openai.js";
import { success } from "better-auth";

export const makeRevision = async (req : Request, res : Response) => {
    const userId = req.userId;
    try {
        const {projectId} = req.params;
        const {message} = req.body;

        const user = await prisma.user.findUnique({
            where : {id : userId}
        });

        if(!userId || !user){
            return res.status(401).json({
                success : false,
                message : "Unauthorised access!"
            });
        }

        if(user.credits < 5){
            return res.status(403).json({
                success : false,
                message :"Not enough credits, please purchase some."
            })
        }

        if(!message || !message.trim()){
            return res.status(400).json({
                success : false,
                message :"Please enter a valid prompt."
            })
        }

        const currentProject = await prisma.websiteProject.findUnique({
            where : {id : projectId, userId},
            include : {versions : true}
        })

        if(!currentProject){
            return res.status(404).json({
                success : false,
                message :"Project not found."
            })
        }

        await prisma.conversation.create({
            data : {
                role : 'user',
                content : message,
                projectId
            }
        })

        await prisma.user.update({
            where : {id : userId},
            data : {
                credits : {decrement : 5}
            }
        });

        const promptEnhanceResponse = await openai.chat.completions.create({
            model : 'kwaipilot/kat-coder-pro:free',
            messages : [
                {
                    role : 'system',
                    content : `
                        You are a prompt enhancement specialist. The user wants to
                        make changes to their website. Enhance their request to be
                        more specific and actionable for a web developer.

                        Enhance this by:
                        1. Being specific about what elements to change
                        2. Mentioning design details (colors, spacing, sizes)
                        3. Clarifying the desired outcome
                        4. Using clear technical terms

                        Return ONLY the enhanced request, nothing else. Keep it concise
                        (1-2 sentences).
                    `
                },
                {
                    role : 'user',
                    content : `User's request : "${message}"`
                }
            ]
        })

        const enhancedPrompt = promptEnhanceResponse.choices[0].message.content;

        await prisma.conversation.create({
            data : {
                role : 'assistant',
                content : `I've enhanced your prompt to : ${enhancedPrompt}`,
                projectId
            }
        })

        await prisma.conversation.create({
            data : {
                role : 'assistant',
                content : `Now making changes to your website...`,
                projectId
            }
        });

        const codeGenerationResponse = await openai.chat.completions.create({
            model : 'kwaipilot/kat-coder-pro:free',
            messages : [
                {
                    role: 'system',
                    content : `
                    You are an expert web developer.

                    CRITICAL REQUIREMENTS:
                    - Return ONLY the complete updated HTML code with the requested
                    changes.
                    - Use Tailwind CSS for ALL styling (NO custom CSS).
                    - Use Tailwind utility classes for all styling changes.
                    - Include all JavaScript in <script> tags before closing </body>
                    - Make sure it's a complete, standalone HTML document with
                    Tailwind CSS
                    - Return the HTML Code Only, nothing else

                    Apply the requested changes while maintaining the Tailwind CSS
                    styling approach.
                    `
                },
                {
                    role : 'user',
                    content : `
                        Here is the current website coe : "${currentProject.current_code}" The user wants this change : "${enhancedPrompt}
                    `
                }
            ]
        })

        const code = codeGenerationResponse.choices[0].message.content || '';
        if(!code){
            await prisma.conversation.create({
                data : {
                    role : 'assistant',
                    content : "Unable to generate the code. Please try again",
                    projectId
                }                
            })

            await prisma.user.update({
                where : {id : userId},
                data : {
                    credits : {increment : 5}
                }
            });
        }
        const version = await prisma.version.create({
            data : {
                code : code.replace(/```[a-z]*\n?/gi, '').replace(/```$/g, '').trim(),
                description : 'Changes made',
                projectId
            }
        });

        await prisma.conversation.create({
            data : {
                role : 'assistant',
                content : "I've made the changes to your website! You can now preview it",
                projectId
            }
        })

        await prisma.websiteProject.update({
            where : {id : projectId},
            data : {
                current_code : code.replace(/```[a-z]*\n?/gi, '').replace(/```$/g, '').trim(),
                current_version_index : version.id
            }
        })

        return res.status(200).json({
            success : true,
            message : "Changes made successfully."
        })

    } catch (error : any) {
        await prisma.user.update({
            where : {id : userId},
            data : {
                credits : {increment : 5}
            }
        });
        console.log("Error in make revision: ", error);
        return res.status(500).json({
            success : false,
            message : "Internal server error!"
        })
    }
}

export const rollbackToVersion = async (req : Request, res : Response) => {
    try {
        const userId = req.userId;
        if(!userId){
            return res.status(401).json({
                success : false,
                message : "Unauthorised access"
            })
        }

        const {projectId, versionId} = req.params;

        const project = await prisma.websiteProject.findUnique({
            where : {id : projectId},
            include : {
                 versions : true
            }
        })

        if(!project){
            return res.status(404).json({
                success : false,
                message : "Project not found!"
            })
        }

        const version = project.versions.find((version) => version.id === versionId);

        if(!version){
            return res.status(404).json({
                success : false,
                message : "Version not found!"
            })
        }

        await prisma.websiteProject.update({
            where : {id : projectId},
            data : {
                current_code : version.code,
                current_version_index : version.id
            }
        })

        await prisma.conversation.create({
            data : {
                role : 'assistant',
                content : `I've rolled backyour website to selected version. You can now preview it`,
                projectId
            }
        })

        return res.status(200).json({
            success : true,
            message : "Version rolled back"
        })
    } catch (error:any) {
        console.log("Error in rollback: ", error);
        return res.status(500).json({
            success : false,
            message : "Internal server error!"
        })
    }
}

export const deleteProject = async (req : Request, res : Response) => {
    try {
        const userId = req.userId;
        const {projectId} = req.params;

        await prisma.websiteProject.delete({
            where : {id: projectId, userId}
        })

        return res.status(200).json({
            success: true, 
            message : "Project deleted successfully."
        })
    } catch (error : any) {
        
    }
}

export const getProjectPreview = async (req : Request, res : Response) => {
    try {
        const userId = req.userId;
        const {projectId} = req.params;

        if(!userId){
            return res.status(401).json({
                success : false,
                message : "Unauthorised access!"
            });
        }

        const project = await prisma.websiteProject.findFirst({
            where : {id : projectId, userId},
            include : {versions : true}
        })

        if(!project){
            return res.status(404).json({
                success : false,
                message : "Project not found!"
            })
        }

        return res.status(200).json({
            success: true, 
            project
        })
    } catch (error : any) {
        console.log("Error in getProjectPreview: ", error);
        return res.status(500).json({
            success : false,
            message  : "Internal server error!"
        })
    }
}

export const getPublishedProjects = async (req : Request, res : Response) => {
    try {

        const projects = await prisma.websiteProject.findMany({
            where : {isPublished : true},
            include : {user : true}
        })

        return res.status(200).json({
            success: true, 
            projects
        })
    } catch (error : any) {
        console.log("Error in getPublishedProjects: ", error);
        return res.status(500).json({
            success : false,
            message  : "Internal server error!"
        })
    }
}

export const getProjectById = async (req : Request, res : Response) => {
    try {
        const {projectId} = req.params;
        const project = await prisma.websiteProject.findFirst({
            where : {id : projectId},
            include : {user : true}
        })

        if(!project || !project.isPublished){
            return res.status(404).json({
                success : false,
                message : "Project not found!"
            })
        }

        return res.status(200).json({
            success: true, 
            code : project.current_code
        })
    } catch (error : any) {
        console.log("Error in getPublishedProjects: ", error);
        return res.status(500).json({
            success : false,
            message  : "Internal server error!"
        })
    }
}

export const saveProjectCode = async (req : Request, res : Response) => {
    try {
        const userId = req.userId;

        if(!userId){
            return res.status(401).json({
                success : false,
                message : "Unauthorised Access!"
            })
        }

        const {projectId} = req.params;
        const {code} = req.body;

        if(!code){
            return res.status(400).json({
                success : false,
                message : "Code is required!"
            })
        }

        const project = await prisma.websiteProject.findFirst({
            where : {id : projectId, userId},
            include : {user : true}
        })

        if(!project){
            return res.status(404).json({
                success : false,
                message : "Project not found!"
            })
        }
        await prisma.websiteProject.update({
            where : {id : projectId},
            data : {
                current_code : code, current_version_index: ''
            }
        })

        return res.status(200).json({
            success: true, 
            message: "Project saved successfully!"
        })
    } catch (error : any) {
        console.log("Error in getPublishedProjects: ", error);
        return res.status(500).json({
            success : false,
            message  : "Internal server error!"
        })
    }
}