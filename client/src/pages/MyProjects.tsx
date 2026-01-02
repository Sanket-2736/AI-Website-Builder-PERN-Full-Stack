import React, { useEffect, useState } from 'react'
import type { Project } from '../types'
import { Loader2Icon, Plus, PlusIcon, TrashIcon } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import Footer from '../components/Footer'
import api from '../configs/axios'
import { toast } from 'sonner'
import { authClient } from '../lib/auth-client'

const MyProjects = () => {
  const [loading, setLoading] = useState(true)
  const [projects, setProjects] = useState<Project[]>([]);
  const { data : session, isPending} = authClient.useSession();

  const fetchProjects = async () => {
    try {
      const {data} = await api.get(`/api/user/projects`);
      setProjects(data.projects);
      setLoading(false);
    } catch (error) {
      setLoading(false);
      console.log(error);
      toast.error("Internal server error!")
    }
  }

  const deleteProject = (projectId: string) => {
    try {
      const confirm = window.confirm("Are you sure to delete this project?");
      if(!confirm) return ;
      const {data} = await api.delete(`/api/project/${projectId}`);
      toast.success(data.message);
      fetchProjects();
    } catch (error) {
      console.log(error);
      toast.error("Internal server error!")
    }
  }

  useEffect(() => {
    if(session?.user && !isPending) fetchProjects();
    else if(!isPending && !session?.user) {
      toast.info('Please login to continue!');
      navigate('/');
    }
  }, [session?.user]);

  const navigate = useNavigate();

  return (
    <>
      <div className="px-4 md:px-16 lg:px-24 xl:px-32">
        {loading ? (
          <div className='flex items-center justify-center h-[80vh]'>
            <Loader2Icon className='size-7 animate-spin text-indigo-200' />
          </div>
        ) : projects.length > 0 ? (
            <div className="py-10 min-h-[80vh]">
                <div className='flex items-center justify-between gap-4'>
                    <h1 className='text-2xl font-medium text-white'>My Projects</h1>
                    <button onClick={() => navigate('/')} className='flex items-center gap-2 text-white px-3 sm:px-6 py-1 sm:py-2 rounded bg-linear-to-br from-indigo-500 to-indigo-600 hover:opacity-90 active:scale-95 transition-all'>
                        <PlusIcon size={18} />Create New
                    </button>
                </div>

                <div className="flex flex-wrap gap-3.5">
                  {projects.map((item, index) => (
                    <div
                      key={index}
                      onClick={() => navigate(`/projects/${item.id}`)}
                      className="relative group w-72 max-sm:mx-auto cursor-pointer bg-gray-900/60 border border-gray-700 rounded-lg overflow-hidden shadow-md hover:shadow-indigo-700/60 hover:border-indigo-800/80 transition-all duration-300"
                    >
                      <div className="relative w-full h-40 bg-gray-900 overflow-hidden border-b border-gray-800">
                        {item.current_code ? (
                          <iframe
                            srcDoc={item.current_code}
                            frameBorder={0}
                            className="absolute top-0 left-0 w-[1280px] h-[800px] origin-top-left pointer-events-none"
                            sandbox='allow-scripts allow-same-origin'
                            style={{transform : 'scale(0.25)'}}
                          />
                        ) : (
                          <div className="flex items-center justify-center">
                            <p>No preview.</p>
                          </div>
                        )}
                      </div>
                      <div className="p-4 text-white bg-linear-180 from-transparent group-hover:from-indigo-950 to-transparent transition-colors">
                        <div className="flex items-center justify-between">
                          <h2 className="text-lg font-medium line-clamp-2">{item.name}</h2>
                          <button className="px-2.5 py-0.5 mt-1 ml-2 text-sx bg-gray-800 border border-gray-700 rounded-full">
                            Website
                          </button>
                        </div>
                        <p className="text-gray-400 mt-1 text-sm line-clamp-2">{item.initial_prompt}</p>

                        <div onClick={(e) => e.stopPropagation()} className="flex justify-between items-center mt-6">
                          <span className="text-xs text-gray-500">
                            {new Date(item.createdAt).toLocaleDateString()}
                          </span>

                          <div className="flex gap-3 text-white text-sm">
                            <button onClick={() => navigate(`/preview/${item.id}`)} className="px-3 py-1.5 bg-white/10 hover:bg-white/15 rounded-md transition-all">
                              Preview
                            </button>
                            <button onClick={() => navigate(`/projects/${item.id}`)} className="px-3 py-1.5 bg-white/10 hover:bg-white/15 rounded-md transition-all">
                              Open
                            </button>
                          </div>
                        </div>
                      </div>

                      <div onClick={(e) => e.stopPropagation()}>
                        <TrashIcon className='absolute top-3 right-3 scale-0 group-hover:scale-100 bg-white p-1.5 size-7 rounded text-red-500 text-xl cursor-pointer transition-all' onClick={() => deleteProject(item.id)} />
                      </div>

                    </div>
                  ))}

                </div>
            </div>
        ) : (
          <div className='flex flex-col items-center justify-center h-[80vh]'>
            <h1 className="text-3xl font-semibold py-20 text-gray-300">You have no projects yet!</h1>
            <button onClick={() => navigate('/')} className='flex items-center gap-2 text-white px-3 sm:px-6 py-1 sm:py-2 rounded bg-linear-to-br from-indigo-500 to-indigo-600 hover:opacity-90 active:scale-95 transition-all'>
                <PlusIcon size={18} /> New
            </button>
          </div>
        )}
      </div>
      <Footer/>
    </>
  )
}

export default MyProjects
