import { Request, Response } from "express"
import Stripe from 'stripe'
import prisma from "../lib/prisma.js";
import openai from "../configs/openai.js";
import { success } from "better-auth";

export const getUserCredits = async (req : Request, res : Response) => {
    try {
        const userId = req.userId;
        if(!userId){
            return res.status(401).json({
                success : false,
                message : "Unauthorised access!"
            });
        }

        const user = await prisma.user.findUnique({
            where : {id : userId}
        })

        return res.status(200).json({
            success : true,
            credits : user?.credits
        })
    } catch (error : any) {
        console.log("Error in user credits: ", error);
        return res.status(500).json({
            success : false,
            message : 'Internal server error!'
        })
    }
}

export const getUserProject = async (req : Request, res : Response) => {
    try {
        const userId = req.userId;
        if(!userId){
            return res.status(401).json({
                success : false,
                message : "Unauthorised access!"
            });
        }

        const user = await prisma.user.findUnique({
            where : {id : userId}
        })

        const {projectId} = req.params;

        const project = await prisma.websiteProject.findUnique({
            where : {id : projectId, userId},
            include : {
                conversation : {
                    orderBy : {timestamp : 'asc'}
                },
                versions : {orderBy : {timestamp : 'asc'}}
            }
        })

        return res.status(200).json({
            success : true,
            project
        })
    } catch (error : any) {
        console.log("Error in user credits: ", error);
        return res.status(500).json({
            success : false,
            message : 'Internal server error!'
        })
    }
}

export const createUserProject = async (req : Request, res : Response) => {
    const userId = req.userId;
    try {
        const {initial_prompt} = req.body;
        if(!userId){
            return res.status(401).json({
                success : false,
                message : "Unauthorised access!"
            });
        }

        const user = await prisma.user.findUnique({
            where : {id : userId}
        })

        if(user && user.credits < 5){
            return res.status(403).json({
                success : false,
                message : "You don't have enough credits to start this project!"
            })
        }

        const project = await prisma.websiteProject.create({
            data : {
                name : initial_prompt.lengtg > 50 ? initial_prompt.substring(0, 47) + '...' : initial_prompt,
                initial_prompt,
                userId
            }
        })

        await prisma.user.update({
            where : {id : userId},
            data : {totalCreation : {increment : 1}}
        })

        await prisma.conversation.create({
            data : {
                role : 'user',
                content : initial_prompt,
                projectId : project.id
            }
        })

        await prisma.user.update({
            where : {id : userId},
            data : {credits : {decrement : 5}}
        })

        res.status(200).json({
            success : true,
            projectId : project.id,
            message : "Project created successfully!"
        });

        const promptEnhanceResponse = await openai.chat.completions.create({
            model: "kwaipilot/kat-coder-pro:free",
            messages : [{
                role : 'system',
                content : `
                    You are a prompt enhancement specialist. Take the user's website request and expand it into a detailed comprehensive prompt that will help create the best possible website.
                    Enhance this prompt by:
                    1. Adding specific design details(layout, color scheme, typography)
                    2. Specifying key sections and features
                    3. Describing the user experience and interactions
                    4. Including modern web design best practices
                    5. Mentoring responsive design requirements
                    6. Adding any missing but important elements

                    Return only enhance prompt, nothing else. Making detailed but concise (2-3 paragraphs max).
                `
            }, {
                role : 'user',
                content : initial_prompt
            }]
        })

        const enhancedPrompt = promptEnhanceResponse.choices[0].message.content;

        await prisma.conversation.create({
            data : {
                role : 'assistant',
                content : `I've enhanced your prompt to : "${enhancedPrompt}"`,
                projectId : project.id
            }
        })

        await prisma.conversation.create({
            data : {
                role : 'assistant',
                content : `now generating your website...`,
                projectId : project.id
            }
        })

        const codeGenerationResponse = await openai.chat.completions.create({
            model : 'kwaipilot/kat-coder-pro:free',
            messages : [
                {
                    role : 'system',
                    content : `
                        You are an expert web developer. Createa a complete, production-ready, single-page website based on this request : ${enhancedPrompt}

                        CRITICAL REQUIREMENTS:
                        - You must ouput valid HTML ONLY>
                        - Use Tailwind CSS for ALL styling
                        - Include this EXACT script in the <head> <script src="https://cdn.jsdelivr.net/npm/@taiwindcss/browser@4"></script>
                        - Use Tailwind utility classes extensively for styling, animations, and responsiveness
                        - Make it fully functional and interactive with Javascript in <script> tag before closing </body>
                        - Use modern, beautiful design with great UX using Tailwind classes
                        - Include all necessary meta tags
                        - Use Google Fonts CDN if needed for custom fonts
                        - Use placeholder images from https://placehold.co/600x400
                        - Use Tailwind gradient classes for beautiful backgrounds
                        - Make sure all buttons, cards, and components use Tailwind styling

                        CRITICAL HARD RULES:
                        1. You MUST put ALL output ONLY into message.content.
                        2. You MUST NOT place anything in "reasoning", "analysis",
                        "reasoning_details", or any hidden fields.
                        3. You MUST NOT include internal thoughts, explanations,
                        analysis, comments, or markdown.
                        4. Do NOT include markdown, explanations, notes, or code fences.

                        The HTML should be complete and ready to render as-is with
                        Tailwind CSS.
                    `
                },
                {
                    role : 'user',
                    content : enhancedPrompt || ''
                }
            ]
        })

        const code = codeGenerationResponse.choices[0].message.content || '';
        if(!code){
            await prisma.conversation.create({
                data : {
                    role : 'assistant',
                    content : "Unable to generate the code. Please try again",
                    projectId : project.id
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
                description : 'Initial Version',
                projectId: project.id
            }
        })

        await prisma.conversation.create({
            data : {
                role : 'assistant',
                content : "I've created your website! You can now preview it and request any changes.",
                projectId : project.id
            }
        })

        await prisma.websiteProject.update({
            where : {id : project.id},
            data : {
                current_code : code.replace(/```[a-z]*\n?/gi, '').replace(/```$/g, '').trim(),
                current_version_index : version.id
            }
        })

    } catch (error : any) {
        await prisma.user.update({
            where : {id: userId},
            data : {credits : {increment : 5}}
        })
        console.log("Error in creating project: ", error);
        return res.status(500).json({
            success : false,
            message : 'Internal server error!'
        })
    }
}

export const getUserProjects = async (req : Request, res : Response) => {
    try {
        const userId = req.userId;
        if(!userId){
            return res.status(401).json({
                success : false,
                message : "Unauthorised access!"
            });
        }

        const user = await prisma.user.findUnique({
            where : {id : userId}
        })

        const {projectId} = req.params;

        const projects = await prisma.websiteProject.findMany({
            where : {id : userId},
            orderBy : {updatedAt : 'desc'}
        })

        return res.status(200).json({
            success : true,
            projects
        })
    } catch (error : any) {
        console.log("Error in user projects: ", error);
        return res.status(500).json({
            success : false,
            message : 'Internal server error!'
        })
    }
}

export const togglePublish = async (req : Request, res : Response) => {
    try {
        const userId = req.userId;
        if(!userId){
            return res.status(401).json({
                success : false,
                message : "Unauthorised access!"
            });
        }

        const user = await prisma.user.findUnique({
            where : {id : userId}
        })

        const {projectId} = req.params;

        const project = await prisma.websiteProject.findUnique({
            where : {id : projectId, userId}
        });

        if(!project){
            return res.status(404).json({
                success : false,
                message : "Project not found!"
            })
        }

        await prisma.websiteProject.update({
            where : {id : projectId},
            data :{isPublished : !project.isPublished}
        })

        return res.status(200).json({
            success : true,
            project,
            message  : project.isPublished ? "Project published!" : "Project unpublished"
        })
    } catch (error : any) {
        console.log("Error in toggle publish: ", error);
        return res.status(500).json({
            success : false,
            message : 'Internal server error!'
        })
    }
}

export const purchaseCredits = async (req : Request, res : Response) => {
    try {
        interface Plan {
            credits : number;
            amount : number
        }

        const plans = {
            basic : {credits : 100, amount : 5},
            pro : {credits : 400, amount : 19},
            enterprise : {credits : 1000, amount : 49},
        }

        const userId = req.userId;

        const {planId} = req.body as {planId : keyof typeof plans};

        const plan : Plan = plans[planId];

        if(!planId){
            return res.status(404).json({
                success : false,
                message : "Plan not found!"
            });
        }

        const transaction = await prisma.transaction.create({
            data : {
                userId : userId!,
                planId : req.body.planId,
                amount : plan.amount,
                credits : plan.credits
            }
        })

        const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);
        const origin = req.headers.origin as string;
        const session = await stripe.checkout.sessions.create({
            success_url: `${origin}/loading`,
            cancel_url : `${origin}`,
            line_items: [
                {
                    price_data : {
                        currency : 'usd',
                        product_data : {
                            name : `AiSiteBuilder - ${plan.credits} credits`
                        },
                        unit_amount : Math.floor(transaction.amount) * 100
                    },
                    quantity : 1
                },
            ],
            mode: 'payment',
            metadata : {
                transactionId : transaction.id,
                appId : 'ai-site-builder'
            },
            expires_at : Math.floor(Date.now() / 1000) + 30 * 60,
        });

        return res.status(200).json({
            payment_link: session.url, success : true
        })
    } catch (error : any) {
        console.log("Error in credits purchase: ", error);
        return res.status(500).json({
            success : false,
            message : 'Internal server error!'
        })
    }
}