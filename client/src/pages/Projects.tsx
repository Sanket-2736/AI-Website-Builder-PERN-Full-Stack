import React, { useEffect, useRef, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import {
  DownloadIcon,
  EyeIcon,
  EyeOffIcon,
  FullscreenIcon,
  LaptopIcon,
  Loader2Icon,
  MessageSquare,
  SaveIcon,
  SmartphoneIcon,
  TabletIcon,
  XIcon
} from 'lucide-react'
import Sidebar from '../components/Sidebar'
import ProjectPreview, { type ProjectPreviewRef } from '../components/ProjectPreview'
import api from '../configs/axios'
import { toast } from 'sonner'
import { authClient } from '../lib/auth-client'

const Projects = () => {
  const { projectId } = useParams()
  const navigate = useNavigate()

  const previewRef = useRef<ProjectPreviewRef>(null);

  const [project, setProject] = useState<Project | null>(null)
  const [loading, setLoading] = useState(true)

  const [isGenerating, setIsGenerating] = useState(true)
  const [device, setDevice] = useState<'phone' | 'tablet' | 'desktop'>('desktop')

  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  const {data : session, isPending} = authClient.useSession();

  const fetchProject = async () => {
    try {
      setLoading(true)
      const {data} = await api.get(`/api/user/project/${projectId}`);
      setProject(data.project);
      setIsGenerating(data.project.current_code ? false : true);
      setLoading(false);
    } catch (error) {
      setLoading(false);
      toast.error('Internal server error!');
      console.log("Error in fetchproject", error);
    }
  }

  const saveProject = async () => {
    if(!previewRef.current) return;
    const code = previewRef.current.getCode();
    if(!code) return;
    setIsSaving(true);

    try {
      const {data} = await api.put(`/api/project/save/${projectId}`, {code});
      toast.success(data.message);
    } catch (error : any) {
      toast.error('Internal server error');
      console.log('Error in save project: ', error);
    } finally {
      setIsSaving(false);
    }
  }

  const downloadCode = () => {
    const code = previewRef.current?.getCode() || project?.current_code;
    if(!code){
      if(isGenerating){
        return;
      }
      return;
    }

    const element = document.createElement('a');
    const file = new Blob([code], {type: "text/html"});
    element.href = URL.createObjectURL(file);
    element.download = "index.html";
    document.body.appendChild(element);
    element.click();
  }

  const togglePublish = async () => {
    try {
      const {data} = await api.get(`/api/user/publish-toggle/${projectId}`);
      toast.success(data.message);
      setProject((prev) => prev ? ({...prev, isPublished : !prev.isPublished}) : null);
    } catch (error : any) {
      toast.error('Internal server error');
      console.log('Error in save project: ', error);
    } 
  }

  useEffect(() => {
    if(session?.user){
      fetchProject();
    } else if(!isPending && !session?.user){
      navigate('/');
      toast('Please login to view your projects')
    }
  }, [session?.user])

  useEffect(() => {
    if(project && !project.current_code){
      const intervalId = setInterval(fetchProject, 10000);
      return () => clearInterval(intervalId);
    }
  }, [project])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2Icon className="size-7 animate-spin text-violet-200" />
      </div>
    )
  }

  return project ? (
    <div className="min-h-screen text-white bg-gray-950">
      {/* TOP BAR */}
      <div className="sticky top-0 z-50 border-b border-gray-800 bg-gray-900/80 backdrop-blur">
        <div className="flex flex-wrap items-center gap-3 px-4 text-emerald-50 py-2 w-full max-w-7xl mx-auto">
          
          {/* Left */}
          <div className="flex items-center gap-2 sm:min-w-90">
            <img
              src="/favicon.svg"
              alt="logo"
              className="h-6 cursor-pointer"
              onClick={() => navigate('/')}
            />

            <div className="max-w-56 sm:max-w-xs">
              <h1 className="text-sm font-medium text-white capitalize truncate">
                {project.name}
              </h1>
              <p className="text-xs text-gray-400 truncate">
                Previewing last saved version
              </p>
            </div>

            <div className="sm:hidden ml-auto">
              {isMenuOpen ? (
                <XIcon
                  className="size-6 cursor-pointer text-violet-200"
                  onClick={() => setIsMenuOpen(false)}
                />
              ) : (
                <MessageSquare
                  className="size-6 cursor-pointer text-violet-200"
                  onClick={() => setIsMenuOpen(true)}
                />
              )}
            </div>
          </div>

          {/* Middle – Device Switch */}
          <div className="flex items-center gap-1 mx-auto">
            <SmartphoneIcon
              onClick={() => setDevice('phone')}
              className={`size-7 p-1 rounded cursor-pointer transition ${
                device === 'phone' ? 'bg-gray-700' : 'hover:bg-gray-800'
              }`}
            />
            <TabletIcon
              onClick={() => setDevice('tablet')}
              className={`size-7 p-1 rounded cursor-pointer transition ${
                device === 'tablet' ? 'bg-gray-700' : 'hover:bg-gray-800'
              }`}
            />
            <LaptopIcon
              onClick={() => setDevice('desktop')}
              className={`size-7 p-1 rounded cursor-pointer transition ${
                device === 'desktop' ? 'bg-gray-700' : 'hover:bg-gray-800'
              }`}
            />
          </div>

          {/* Right */}
          <div className="flex items-center gap-2 ml-auto text-xs sm:text-sm">
            <button
              disabled={isSaving}
              onClick={saveProject}
              className="hidden sm:flex items-center gap-2 px-3.5 py-1 bg-gray-800 hover:bg-gray-700 rounded border border-gray-700 transition"
            >
              {isSaving ? (
                <Loader2Icon size={16} className="animate-spin" />
              ) : (
                <SaveIcon size={16} />
              )}
              Save
            </button>

            <Link
              to={`/preview/${projectId}`}
              target="_blank"
              className="hidden sm:flex items-center gap-2 px-3.5 py-1 bg-gray-800 hover:bg-gray-700 rounded border border-gray-700 transition"
            >
              <FullscreenIcon size={16} />
              Preview
            </Link>

            <button onClick={downloadCode} className="hidden sm:flex items-center gap-2 px-3.5 py-1 bg-gray-800 hover:bg-gray-700 rounded border border-gray-700 transition">
              <DownloadIcon size={16} />
              Download
            </button>

            <button onClick={togglePublish} className="hidden sm:flex items-center gap-2 px-3.5 py-1 bg-blue-800 hover:bg-blue-700 rounded border border-white transition">
              {project.isPublished ? (
                <EyeOffIcon size={16} />
              ) : (
                <EyeIcon size={16} />
              )}
              Publish
            </button>

            {!project.isPublished && (
              <span className="hidden sm:block text-xs text-gray-400">
                Unpublished?
              </span>
            )}
          </div>
        </div>
      </div>
      <div className='flex-1 flex overflow-auto'>
        <Sidebar isMenuOpen={isMenuOpen} project={project} setProject={(p) => setProject(p)} isGenerating={isGenerating} setIsGenerating={setIsGenerating}/>

        <div className='flex-1 p-2 pl-0 '>
          <ProjectPreview ref={previewRef} project={project} isGenerating={isGenerating} device={device}/>
        </div>
      </div>
    </div>
  ) : (
    <div className="flex items-center justify-center h-screen">
      <p className="text-2xl font-medium text-gray-200">
        Unable to load project!
      </p>
    </div>
  )
}

export default Projects
