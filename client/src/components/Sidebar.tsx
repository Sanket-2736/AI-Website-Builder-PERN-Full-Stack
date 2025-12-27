import React, { useEffect, useRef, useState } from 'react'
import type { Message, Project, Version } from '../types'
import { BotIcon, EyeIcon, Loader2Icon, SendIcon, UserIcon } from 'lucide-react';
import { Link } from 'react-router-dom';

interface SidebarProps {
  isMenuOpen: boolean,
  project : Project,
  setProject : (project : Project) => void,
  isGenerating : boolean,
  setIsGenerating : (isGenerating : boolean) => void
}

function Sidebar({isMenuOpen, project, setProject, isGenerating, setIsGenerating} : SidebarProps) {
    const messageRef = useRef<HTMLDivElement>(null);
    const handleRevisions = (e: React.FormEvent) => {
        e.preventDefault();
        setIsGenerating(true);

        setTimeout(() => {
            setIsGenerating(false);
        }, 3000);
    }
    const [inputValue, setInputValue] = useState<string>('');

    useEffect(() => {
        if(messageRef.current){
            messageRef.current.scrollIntoView({behavior: 'smooth'});
        }
    }, [project.conversation.length, isGenerating]);

    const handleRollback = (versionId: string) => {

    }

  return (
    <div className={`h-full sm:max-w-sm rounded-xl bg-gray-900 border-gray-800 transition-all  ${isMenuOpen ? 'max-sm:w-0 overflow-hidden' : 'w-full'}`}>
        <div className='flex flex-col h-full'>
            {/* messages */}
            <div className='flex-1 overflow-y-auto no-scrollbar px-3 flex flex-col gap-4'>
                {[...project.conversation, ...project.versions].sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()).map((item, index) => {
                    const isMessage = 'content' in item;

                    if(isMessage){
                        const msg = item as Message;
                        const isUser = msg.role === 'user';
                        return (
                            <div key={index} className={`flex items-start gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}>
                            {
                                !isUser && (
                                    <div className='w-8 h-8 rounded-full bg-linear-to-br from-indigo-600 flex items-center justify-center to-indigo-700'>
                                        <BotIcon className='size-5 text-white'/>
                                    </div>
                                )
                            }

                            <div className={`max-w-[80%] p-2 px-4 rounded-2xl shadow-sm text-sm mt-5 leading-relaxed ${isUser ? "bg-linear-to-r from bg-indigo-500 to-indigo-600 text-white rounded-tr-none" : "rounded-tl-none bg-gray-800 text-gray-100"}`}>
                                {msg.content}
                            </div>
                            {isUser && (
                                <div className='w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center'>
                                    <UserIcon className='size-5 text-gray-200'/>
                                </div>
                            )}
                            </div>
                        )
                    } else {
                        const ver = item as Version;
                        return (
                            <div key={ver.id} className='w-4/5 mx-auto my-2 p-3 rounded-xl bg-gray-800 text-gray-100 flex flex-col gap-2'>
                                <div className='font-medium text-xs'>
                                    Code updated <br/><span className='text-gray-500 text-xs font-normal'>
                                        {new Date(ver.timestamp).toLocaleDateString()}
                                    </span>
                                </div>

                                <div className='flex items-center justify-between'>
                                    {
                                        project.current_version_index === ver.id ? (
                                            <button className='px-3 py-1 rounded-md text-xs bg-gray-700'>
                                                Current Version
                                            </button>
                                        ) : (
                                            <button onClick={() => handleRollback(ver.id)} className='px-3 py-1 rounded-md text-xs bg-indigo-500 hover:bg-indigo-600 text-white'>
                                                Roll back to this version
                                            </button>
                                        )
                                    }

                                    <Link target='_blank' to={`/preview/${project.id}/${ver.id}`}>
                                        <EyeIcon className='size-6 p-1 bg-gray-700 hover:bg-indigo-500 transition-colors rounded'/>
                                    </Link>
                                </div>
                            </div>
                        )
                    }
                })}

                {
                    isGenerating && (
                        <div className='flex items-center gap-3 justify-start'>
                            <div className='w-8 h-8 rounded-full bg-linear-to-br from-indigo-600 to-indigo-700 flex items-center justify-center'>
                                <BotIcon className='size-5 text-white'/>
                            </div>
                            <div className="flex gap-1.5 h-full items-end">
                                <span className='size-2 rounded-full animate-bounce bg-gray-600' style={{animationDelay: '0s'}} />
                                <span className='size-2 rounded-full animate-bounce bg-gray-600' style={{animationDelay: '0.2s'}} />
                                <span className='size-2 rounded-full animate-bounce bg-gray-600' style={{animationDelay: '0.4s'}} />
                            </div>
                        </div>
                    )
                }

                <div ref={messageRef} />
            </div>

            {/* input area */}
            <form onSubmit={handleRevisions} className='m-3 relative' action="">
                <div className="flex items-center gap-2">
                    <textarea onChange={(e) => setInputValue(e.target.value)} value={inputValue} rows={4} placeholder='Describe your website or request changes...' className='flex-1 p-3 rounded-xl resize-none text-sm outline-none ring ring-gray-700 focus:ring-indigo-500 bg-gray-800 text-gray-100 placeholder-gray-400 transition-all' disabled={isGenerating}/>
                        <button disabled={isGenerating || !inputValue.trim()} className='absolute bottom-2.5 right-2.5 rounded-full bg-linear-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-500 text-white transition-colors disabled:opacity-60'>{isGenerating ? (
                            <Loader2Icon className='size-7 p-1.5 animate-spin text-white' />
                        ) : (
                            <SendIcon className='size-7 p-1.5 text-white'/>
                        )}</button>
                </div>
            </form>


        </div>
    </div>
  )
}

export default Sidebar
